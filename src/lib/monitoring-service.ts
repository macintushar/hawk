import { eq, and, not } from "drizzle-orm";
import { randomBytes } from "crypto";

import { db } from "@/server/db";
import { utcNow } from "@/lib/date-utils";
import { monitor, monitorCheck, incident } from "@/server/db/schema";
import {
  sendSlackMessage,
  formatMonitorDownMessage,
  formatMonitorUpMessage,
} from "@/lib/notifications/slack";
import { notificationSettings } from "@/server/db/schema";
import type { UptimeStatus } from "@/types";

export type CheckResult = {
  status: "up" | "down";
  responseTime?: number;
  statusCode?: number;
  error?: string;
};

export class MonitoringService {
  // Very small cron helper: supports "every N minutes" step syntax (e.g., every 5 minutes).
  // Falls back to 5 minutes when unable to parse.
  private getIntervalMsFromCron(
    cronExpression: string | null | undefined,
  ): number {
    const fallbackMinutes = 10;
    if (!cronExpression) return fallbackMinutes * 60 * 1000;
    // Match patterns like "*/5 * * * *" -> every 5 minutes
    const pattern = /^\*\/(\d+) \* \* \* \*$/;
    const match = pattern.exec(cronExpression);
    if (match) {
      const minutes = Number(match[1]);
      if (Number.isFinite(minutes) && minutes > 0) {
        return minutes * 60 * 1000;
      }
    }

    // Fallback
    return fallbackMinutes * 60 * 1000;
  }

  private isMonitorDue(
    lastChecked: Date | null | undefined,
    cronExpression: string | null | undefined,
  ): boolean {
    const intervalMs = this.getIntervalMsFromCron(cronExpression);
    if (!lastChecked) return true;
    return lastChecked.getTime() <= Date.now() - intervalMs;
  }

  private async isMonitorDueById(monitorId: string): Promise<boolean> {
    const m = await db
      .select({
        lastChecked: monitor.lastChecked,
        cronExpression: monitor.cronExpression,
      })
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);
    const row = m[0];
    if (!row) return false;
    return this.isMonitorDue(row.lastChecked, row.cronExpression);
  }
  /**
   * Perform an HTTP check for a monitor
   */
  async checkMonitor(monitorId: string): Promise<CheckResult> {
    const monitorData = await db.query.monitor.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
    });

    if (!monitorData) {
      throw new Error("Monitor not found");
    }

    const startTime = Date.now();
    let result: CheckResult;

    try {
      const response = await fetch(monitorData.url, {
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
    const monitorData = await db.query.monitor.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
    });

    if (!monitorData) {
      return;
    }

    const threshold = monitorData.threshold;
    const currentStatus = monitorData.status;

    // Get the last N check results (where N is the threshold)
    const recentChecks = await db.query.monitorCheck.findMany({
      where: (mc, { eq }) => eq(mc.monitorId, monitorId),
      orderBy: (mc, { desc }) => [desc(mc.checkedAt)],
      limit: threshold,
    });

    let newStatus: UptimeStatus = currentStatus;

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
      status?: UptimeStatus;
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
    const monitorData = await db.query.monitor.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
    });

    if (!monitorData) {
      return;
    }

    // Check if there's already an active incident for this monitor
    const existingIncident = await db.query.incident.findFirst({
      where: (i, { and, eq, not }) =>
        and(eq(i.monitorId, monitorId), not(eq(i.status, "resolved"))),
    });

    if (existingIncident) {
      return; // Don't create duplicate incidents
    }

    // Get monitor data for incident creation
    const monitorDataForIncident = await db.query.monitor.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
    });

    if (!monitorDataForIncident) {
      return;
    }

    // Get status pages that include this monitor
    const statusPages = await db.query.statusPageMonitor.findMany({
      where: (spm, { eq }) => eq(spm.monitorId, monitorId),
      columns: { statusPageId: true },
    });

    // Create incidents for each status page
    for (const spm of statusPages) {
      await db.insert(incident).values({
        id: randomBytes(16).toString("hex"),
        title: `${monitorDataForIncident.name} is down`,
        description: `The monitor for ${monitorDataForIncident.url} is currently down.`,
        status: "investigating",
        statusPageId: spm.statusPageId,
        monitorId,
      });
    }

    // Notify via Slack if enabled for the monitor's owner
    const ownerId = monitorDataForIncident.userId;
    const cfg = await db.query.notificationSettings.findFirst({
      where: (ns, { eq }) => eq(ns.userId, ownerId),
    });
    if (cfg?.slackEnabled && cfg.onMonitorDown) {
      const text = formatMonitorDownMessage({
        monitorName: monitorDataForIncident.name,
        url: monitorDataForIncident.url,
      });
      await sendSlackMessage(cfg.slackWebhookUrl ?? undefined, {
        text,
        channel: cfg.slackChannel ?? undefined,
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

    // Notify via Slack if enabled for the monitor's owner
    const monitorDataForIncident = await db
      .select()
      .from(monitor)
      .where(eq(monitor.id, monitorId))
      .limit(1);

    if (monitorDataForIncident[0]) {
      const ownerId = monitorDataForIncident[0].userId;
      const settings = await db
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.userId, ownerId))
        .limit(1);
      const cfg = settings[0];
      if (cfg?.slackEnabled && cfg.onMonitorUp) {
        const text = formatMonitorUpMessage({
          monitorName: monitorDataForIncident[0].name,
          url: monitorDataForIncident[0].url,
        });
        await sendSlackMessage(cfg.slackWebhookUrl ?? undefined, {
          text,
          channel: cfg.slackChannel ?? undefined,
        });
      }
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

    // Determine due based on each monitor's cronExpression and lastChecked
    return monitors
      .filter((m) => this.isMonitorDue(m.lastChecked, m.cronExpression))
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
      await Promise.all(
        batch.map(async (m) => {
          // Guard against rapid successive triggers: re-check due status just-in-time
          const stillDue = await this.isMonitorDueById(m.id);
          if (!stillDue) return;
          await this.checkMonitor(m.id);
        }),
      );
    }
  }
}

export const monitoringService = new MonitoringService();
