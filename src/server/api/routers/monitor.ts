import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { monitor, statusPageMonitor, monitorCheck } from "@/server/db/schema";
import { utcNow } from "@/lib/date-utils";
import {
  createMonitorSchema,
  updateMonitorSchema,
  deleteMonitorSchema,
  getMonitorsSchema,
} from "@/schemas";
import { monitoringService } from "@/lib/monitoring-service";

export const monitorRouter = createTRPCRouter({
  // Get all monitors for the authenticated user
  list: protectedProcedure
    .input(getMonitorsSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      if (input.statusPageId) {
        // Get monitors for a specific status page
        const monitors = await db
          .select({
            id: monitor.id,
            name: monitor.name,
            slug: monitor.slug,
            url: monitor.url,
            status: monitor.status,
            lastChecked: monitor.lastChecked,
            threshold: monitor.threshold,
            cronExpression: monitor.cronExpression,
            createdAt: monitor.createdAt,
            updatedAt: monitor.updatedAt,
          })
          .from(monitor)
          .innerJoin(
            statusPageMonitor,
            eq(monitor.id, statusPageMonitor.monitorId),
          )
          .where(
            and(
              eq(monitor.userId, user.id),
              eq(statusPageMonitor.statusPageId, input.statusPageId),
            ),
          )
          .orderBy(desc(monitor.createdAt));

        return monitors;
      }

      // Get all monitors for the user
      const monitors = await db
        .select()
        .from(monitor)
        .where(eq(monitor.userId, user.id))
        .orderBy(desc(monitor.createdAt));

      return monitors;
    }),

  // Get a single monitor by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const monitorData = await db
        .select()
        .from(monitor)
        .where(and(eq(monitor.id, input.id), eq(monitor.userId, user.id)))
        .limit(1);

      if (!monitorData[0]) {
        throw new Error("Monitor not found");
      }

      return monitorData[0];
    }),

  // Create a new monitor
  create: protectedProcedure
    .input(createMonitorSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Generate slug from name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if slug already exists
      const existingMonitor = await db
        .select()
        .from(monitor)
        .where(eq(monitor.slug, slug))
        .limit(1);

      if (existingMonitor[0]) {
        throw new Error("A monitor with this name already exists");
      }

      const newMonitor = await db
        .insert(monitor)
        .values({
          id: randomBytes(16).toString("hex"),
          name: input.name,
          slug,
          url: input.url,
          threshold: input.threshold,
          cronExpression: input.cronExpression,
          userId: user.id,
        })
        .returning();

      return newMonitor[0];
    }),

  // Update an existing monitor
  update: protectedProcedure
    .input(updateMonitorSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;
      const { id, ...updateData } = input;

      // Check if monitor exists and belongs to user
      const existingMonitor = await db
        .select()
        .from(monitor)
        .where(and(eq(monitor.id, id), eq(monitor.userId, user.id)))
        .limit(1);

      if (!existingMonitor[0]) {
        throw new Error("Monitor not found");
      }

      // Generate new slug if name is being updated
      let slug = existingMonitor[0].slug;
      if (updateData.name && updateData.name !== existingMonitor[0].name) {
        slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Check if new slug already exists
        const slugExists = await db
          .select()
          .from(monitor)
          .where(and(eq(monitor.slug, slug), eq(monitor.id, id)))
          .limit(1);

        if (slugExists[0]) {
          throw new Error("A monitor with this name already exists");
        }
      }

      const updatedMonitor = await db
        .update(monitor)
        .set({
          ...updateData,
          slug,
        })
        .where(and(eq(monitor.id, id), eq(monitor.userId, user.id)))
        .returning();

      return updatedMonitor[0];
    }),

  // Delete a monitor
  delete: protectedProcedure
    .input(deleteMonitorSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Check if monitor exists and belongs to user
      const existingMonitor = await db
        .select()
        .from(monitor)
        .where(and(eq(monitor.id, input.id), eq(monitor.userId, user.id)))
        .limit(1);

      if (!existingMonitor[0]) {
        throw new Error("Monitor not found");
      }

      // Delete the monitor (cascade will handle related records)
      await db
        .delete(monitor)
        .where(and(eq(monitor.id, input.id), eq(monitor.userId, user.id)));

      return { success: true };
    }),

  // Get monitor check history
  getCheckHistory: protectedProcedure
    .input(
      z.object({
        monitorId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Verify monitor belongs to user
      const monitorData = await db
        .select()
        .from(monitor)
        .where(
          and(eq(monitor.id, input.monitorId), eq(monitor.userId, user.id)),
        )
        .limit(1);

      if (!monitorData[0]) {
        throw new Error("Monitor not found");
      }

      // Get check history
      const checkHistory = await db
        .select()
        .from(monitorCheck)
        .where(eq(monitorCheck.monitorId, input.monitorId))
        .orderBy(desc(monitorCheck.checkedAt))
        .limit(input.limit);

      return checkHistory;
    }),

  // Trigger a manual check for a monitor
  check: protectedProcedure
    .input(z.object({ monitorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Verify monitor belongs to user
      const monitorData = await db
        .select()
        .from(monitor)
        .where(
          and(eq(monitor.id, input.monitorId), eq(monitor.userId, user.id)),
        )
        .limit(1);

      if (!monitorData[0]) {
        throw new Error("Monitor not found");
      }

      // Perform the actual check
      const result = await monitoringService.checkMonitor(input.monitorId);

      return {
        ...result,
        checkedAt: utcNow(),
      };
    }),
});
