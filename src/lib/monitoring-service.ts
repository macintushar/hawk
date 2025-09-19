import { eq, and, desc, not } from "drizzle-orm";
import { randomBytes } from "crypto";

import { db } from "@/server/db";
import { utcNow } from "@/lib/date-utils";
import {
  monitor,
  monitorCheck,
  incident,
  statusPage,
  statusPageMonitor,
} from "@/server/db/schema";

export interface CheckResult {
  status: "up" | "down";
  responseTime?: number;
  statusCode?: number;
  error?: string;
}

export class MonitoringService {
  /**
   * Perform an HTTP check for a monitor
   */
  async checkMonitor(monitorId: string): Promise<CheckResult> {
    const monitorData = await db
      .select()
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);

    if (!monitorData[0]) {
      throw new Error("Monitor not found");
    }

    const startTime = Date.now();
    let result: CheckResult;

    try {
      const response = await fetch(monitorData[0].url, {
        method: "GET",
        headers: {
          "User-Agent": "Hawk-Monitor/1.0",
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        result = {
          status: "up",
          responseTime,
          statusCode: response.status,
        };
      } else {
        result = {
          status: "down",
          responseTime,
          statusCode: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      result = {
        status: "down",
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Store the check result
    await this.storeCheckResult(monitorId, result);

    // Update monitor status based on threshold
    await this.updateMonitorStatus(monitorId);

    return result;
  }

  /**
   * Store a check result in the database
   */
  private async storeCheckResult(
    monitorId: string,
    result: CheckResult,
  ): Promise<void> {
    await db.insert(monitorCheck).values({
      id: randomBytes(16).toString("hex"),
      monitorId,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      error: result.error,
    });
  }

  /**
   * Update monitor status based on recent check results and threshold
   */
  private async updateMonitorStatus(monitorId: string): Promise<void> {
    const monitorData = await db
      .select()
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);

    if (!monitorData[0]) {
      return;
    }

    const threshold = monitorData[0].threshold;
    const currentStatus = monitorData[0].status;

    // Get the last N check results (where N is the threshold)
    const recentChecks = await db
      .select()
      .from(monitorCheck)
      .where(eq(monitorCheck.monitorId, monitorId))
      .orderBy(desc(monitorCheck.checkedAt))
      .limit(threshold);

    let newStatus: "up" | "down" | "unknown" = currentStatus;

    if (recentChecks.length === 0) {
      // No checks yet, keep current status
      newStatus = currentStatus;
    } else if (recentChecks.length < threshold) {
      // Not enough checks for threshold-based logic
      // If current status is "unknown", update based on most recent check
      if (currentStatus === "unknown") {
        newStatus = recentChecks[0]?.status === "up" ? "up" : "down";
      } else {
        // For existing status, only change to "down" if we have consecutive failures
        let consecutiveFailures = 0;
        for (const check of recentChecks) {
          if (check.status === "down") {
            consecutiveFailures++;
          } else {
            break;
          }
        }
        // Only mark as down if we have enough consecutive failures
        if (consecutiveFailures >= recentChecks.length) {
          newStatus = "down";
        }
      }
    } else {
      // Enough checks for threshold-based logic
      let consecutiveFailures = 0;
      for (const check of recentChecks) {
        if (check.status === "down") {
          consecutiveFailures++;
        } else {
          break; // Stop counting when we hit a successful check
        }
      }

      newStatus = consecutiveFailures >= threshold ? "down" : "up";
    }

    // Always update lastChecked, and update status if it changed
    const updateData: {
      lastChecked: Date;
      status?: "up" | "down" | "unknown";
    } = {
      lastChecked: utcNow(),
    };

    if (newStatus !== currentStatus) {
      updateData.status = newStatus;
    }

    await db.update(monitor).set(updateData).where(eq(monitor.id, monitorId));

    // Create or resolve incidents based on status change
    if (newStatus !== currentStatus) {
      if (newStatus === "down" && currentStatus !== "down") {
        await this.createIncident(monitorId);
      } else if (newStatus === "up" && currentStatus === "down") {
        await this.resolveIncident(monitorId);
      }
    }
  }

  /**
   * Create an incident when a monitor goes down
   */
  private async createIncident(monitorId: string): Promise<void> {
    const monitorData = await db
      .select()
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);

    if (!monitorData[0]) {
      return;
    }

    // Check if there's already an active incident for this monitor
    const existingIncident = await db
      .select()
      .from(incident)
      .where(
        and(
          eq(incident.monitorId, monitorId),
          not(eq(incident.status, "resolved" as const)),
        ),
      )
      .limit(1);

    if (existingIncident[0]) {
      return; // Don't create duplicate incidents
    }

    // Get monitor data for incident creation
    const monitorDataForIncident = await db
      .select()
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);

    if (!monitorDataForIncident[0]) {
      return;
    }

    // Get status pages that include this monitor
    const statusPages = await db
      .select({ id: statusPage.id })
      .from(statusPage)
      .innerJoin(
        statusPageMonitor,
        eq(statusPage.id, statusPageMonitor.statusPageId),
      )
      .where(eq(statusPageMonitor.monitorId, monitorId));

    // Create incidents for each status page
    for (const statusPage of statusPages) {
      await db.insert(incident).values({
        id: randomBytes(16).toString("hex"),
        title: `${monitorDataForIncident[0].name} is down`,
        description: `The monitor for ${monitorDataForIncident[0].url} is currently down.`,
        status: "investigating",
        statusPageId: statusPage.id,
        monitorId,
      });
    }
  }

  /**
   * Resolve incidents when a monitor comes back up
   */
  private async resolveIncident(monitorId: string): Promise<void> {
    const activeIncidents = await db
      .select()
      .from(incident)
      .where(
        and(
          eq(incident.monitorId, monitorId),
          not(eq(incident.status, "resolved" as const)),
        ),
      );

    for (const incidentData of activeIncidents) {
      await db
        .update(incident)
        .set({
          status: "resolved",
          resolvedAt: utcNow(),
        })
        .where(eq(incident.id, incidentData.id));
    }
  }

  /**
   * Get monitors that need to be checked based on their cron expressions
   */
  async getMonitorsToCheck(): Promise<
    Array<{ id: string; cronExpression: string }>
  > {
    const monitors = await db
      .select({
        id: monitor.id,
        cronExpression: monitor.cronExpression,
        lastChecked: monitor.lastChecked,
      })
      .from(monitor);

    // TODO: Implement cron expression parsing and scheduling
    // For now, return all monitors that haven't been checked in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    return monitors
      .filter((m) => !m.lastChecked || m.lastChecked < fiveMinutesAgo)
      .map((m) => ({ id: m.id, cronExpression: m.cronExpression }));
  }

  /**
   * Check all monitors that are due for checking
   */
  async checkAllDueMonitors(): Promise<void> {
    const monitorsToCheck = await this.getMonitorsToCheck();

    // Process monitors in parallel, but limit concurrency
    const batchSize = 10;
    for (let i = 0; i < monitorsToCheck.length; i += batchSize) {
      const batch = monitorsToCheck.slice(i, i + batchSize);
      await Promise.all(batch.map((monitor) => this.checkMonitor(monitor.id)));
    }
  }
}

export const monitoringService = new MonitoringService();
