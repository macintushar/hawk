import { z } from "zod";
import { eq, and, desc, gte } from "drizzle-orm";
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
        const spm = await db.query.statusPageMonitor.findMany({
          where: (spm, { eq }) => eq(spm.statusPageId, input.statusPageId!),
          with: { monitor: true },
        });
        const monitors = spm
          .map((r) => r.monitor)
          .filter((m) => m.userId === user.id)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return monitors;
      }

      // Get all monitors for the user
      const monitors = await db.query.monitor.findMany({
        where: (m, { eq }) => eq(m.userId, user.id),
        orderBy: (m, { desc }) => [desc(m.createdAt)],
      });

      if (input.limit) {
        return monitors.slice(0, input.limit);
      }

      return monitors;
    }),

  // Get a single monitor by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const monitorData = await db.query.monitor.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, input.id), eq(m.userId, user.id)),
      });

      if (!monitorData) {
        throw new Error("Monitor not found");
      }

      return monitorData;
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
      const existingMonitor = await db.query.monitor.findFirst({
        where: (m, { and, eq }) => and(eq(m.id, id), eq(m.userId, user.id)),
      });

      if (!existingMonitor) {
        throw new Error("Monitor not found");
      }

      // Generate new slug if name is being updated
      let slug = existingMonitor.slug;
      if (updateData.name && updateData.name !== existingMonitor.name) {
        slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Check if new slug already exists
        const slugExists = await db.query.monitor.findFirst({
          where: (m, { and, eq }) => and(eq(m.slug, slug), eq(m.id, id)),
        });

        if (slugExists) {
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
      const existingMonitor = await db.query.monitor.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, input.id), eq(m.userId, user.id)),
      });

      if (!existingMonitor) {
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
        limit: z.number().min(1).max(100).default(50).optional(),
        days: z.number().min(1).max(90).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Verify monitor belongs to user
      const monitorData = await db.query.monitor.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, input.monitorId), eq(m.userId, user.id)),
      });

      if (!monitorData) {
        throw new Error("Monitor not found");
      }

      // Get check history
      const baseWhere = eq(monitorCheck.monitorId, input.monitorId);

      // If a days range is provided, filter from now - days
      const days = input.days;

      let checkHistory;
      if (days) {
        checkHistory = await db.query.monitorCheck.findMany({
          where: (mc, { and, gte, eq }) =>
            and(
              eq(mc.monitorId, input.monitorId),
              gte(
                mc.checkedAt,
                new Date(Date.now() - days * 24 * 60 * 60 * 1000),
              ),
            ),
          orderBy: (mc, { desc }) => [desc(mc.checkedAt)],
          limit: 5000,
        });
      } else {
        checkHistory = await db.query.monitorCheck.findMany({
          where: (mc, { eq }) => eq(mc.monitorId, input.monitorId),
          orderBy: (mc, { desc }) => [desc(mc.checkedAt)],
          limit: input.limit ?? 50,
        });
      }

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
