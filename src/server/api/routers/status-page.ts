import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  statusPage,
  statusPageMonitor,
  monitor,
  incident,
} from "@/server/db/schema";
import {
  createStatusPageSchema,
  updateStatusPageSchema,
  deleteStatusPageSchema,
  addMonitorToStatusPageSchema,
  removeMonitorFromStatusPageSchema,
  getStatusPagesSchema,
} from "@/schemas";

export const statusPageRouter = createTRPCRouter({
  // Get all status pages for the authenticated user
  list: protectedProcedure
    .input(getStatusPagesSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const statusPages = await db
        .select()
        .from(statusPage)
        .where(eq(statusPage.userId, user.id))
        .orderBy(desc(statusPage.createdAt));

      if (input.includeMonitors) {
        // Get monitors for each status page
        const statusPagesWithMonitors = await Promise.all(
          statusPages.map(async (page) => {
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
              .where(eq(statusPageMonitor.statusPageId, page.id))
              .orderBy(desc(monitor.createdAt));

            return {
              ...page,
              monitors,
              monitorCount: monitors.length,
            };
          }),
        );

        return statusPagesWithMonitors;
      }

      return statusPages;
    }),

  // Get a single status page by ID
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const statusPageData = await db
        .select()
        .from(statusPage)
        .where(and(eq(statusPage.slug, input.slug)))
        .limit(1);

      if (!statusPageData[0]) {
        throw new Error("Status page not found");
      }

      // Get monitors for this status page
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
        .where(eq(statusPageMonitor.statusPageId, statusPageData[0].id))
        .orderBy(desc(monitor.createdAt));

      // Get incidents for this status page and its monitors
      const incidents = await db
        .select({
          id: incident.id,
          title: incident.title,
          description: incident.description,
          status: incident.status,
          statusPageId: incident.statusPageId,
          monitorId: incident.monitorId,
          startedAt: incident.startedAt,
          resolvedAt: incident.resolvedAt,
          createdAt: incident.createdAt,
          updatedAt: incident.updatedAt,
          monitorName: monitor.name,
        })
        .from(incident)
        .leftJoin(monitor, eq(incident.monitorId, monitor.id))
        .where(eq(incident.statusPageId, statusPageData[0].id))
        .orderBy(desc(incident.startedAt));

      return {
        ...statusPageData[0],
        monitors,
        incidents,
      };
    }),

  // Create a new status page
  create: protectedProcedure
    .input(createStatusPageSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Generate slug from name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if slug already exists
      const existingStatusPage = await db
        .select()
        .from(statusPage)
        .where(eq(statusPage.slug, slug))
        .limit(1);

      if (existingStatusPage[0]) {
        throw new Error("A status page with this name already exists");
      }

      const newStatusPage = await db
        .insert(statusPage)
        .values({
          id: randomBytes(16).toString("hex"),
          name: input.name,
          description: input.description,
          slug,
          userId: user.id,
        })
        .returning();

      return newStatusPage[0];
    }),

  // Update an existing status page
  update: protectedProcedure
    .input(updateStatusPageSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;
      const { id, ...updateData } = input;

      // Check if status page exists and belongs to user
      const existingStatusPage = await db
        .select()
        .from(statusPage)
        .where(and(eq(statusPage.id, id), eq(statusPage.userId, user.id)))
        .limit(1);

      if (!existingStatusPage[0]) {
        throw new Error("Status page not found");
      }

      // Generate new slug if name is being updated
      let slug = existingStatusPage[0].slug;
      if (updateData.name && updateData.name !== existingStatusPage[0].name) {
        slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Check if new slug already exists
        const slugExists = await db
          .select()
          .from(statusPage)
          .where(and(eq(statusPage.slug, slug), eq(statusPage.id, id)))
          .limit(1);

        if (slugExists[0]) {
          throw new Error("A status page with this name already exists");
        }
      }

      const updatedStatusPage = await db
        .update(statusPage)
        .set({
          ...updateData,
          slug,
        })
        .where(and(eq(statusPage.id, id), eq(statusPage.userId, user.id)))
        .returning();

      return updatedStatusPage[0];
    }),

  // Delete a status page
  delete: protectedProcedure
    .input(deleteStatusPageSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Check if status page exists and belongs to user
      const existingStatusPage = await db
        .select()
        .from(statusPage)
        .where(and(eq(statusPage.id, input.id), eq(statusPage.userId, user.id)))
        .limit(1);

      if (!existingStatusPage[0]) {
        throw new Error("Status page not found");
      }

      // Delete the status page (cascade will handle related records)
      await db
        .delete(statusPage)
        .where(
          and(eq(statusPage.id, input.id), eq(statusPage.userId, user.id)),
        );

      return { success: true };
    }),

  // Add a monitor to a status page
  addMonitor: protectedProcedure
    .input(addMonitorToStatusPageSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Verify status page belongs to user
      const statusPageData = await db
        .select()
        .from(statusPage)
        .where(
          and(
            eq(statusPage.id, input.statusPageId),
            eq(statusPage.userId, user.id),
          ),
        )
        .limit(1);

      if (!statusPageData[0]) {
        throw new Error("Status page not found");
      }

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

      // Check if monitor is already added to this status page
      const existingRelation = await db
        .select()
        .from(statusPageMonitor)
        .where(
          and(
            eq(statusPageMonitor.statusPageId, input.statusPageId),
            eq(statusPageMonitor.monitorId, input.monitorId),
          ),
        )
        .limit(1);

      if (existingRelation[0]) {
        throw new Error("Monitor is already added to this status page");
      }

      // Add monitor to status page
      const newRelation = await db
        .insert(statusPageMonitor)
        .values({
          id: randomBytes(16).toString("hex"),
          statusPageId: input.statusPageId,
          monitorId: input.monitorId,
        })
        .returning();

      return newRelation[0];
    }),

  // Remove a monitor from a status page
  removeMonitor: protectedProcedure
    .input(removeMonitorFromStatusPageSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Verify status page belongs to user
      const statusPageData = await db
        .select()
        .from(statusPage)
        .where(
          and(
            eq(statusPage.id, input.statusPageId),
            eq(statusPage.userId, user.id),
          ),
        )
        .limit(1);

      if (!statusPageData[0]) {
        throw new Error("Status page not found");
      }

      // Remove monitor from status page
      await db
        .delete(statusPageMonitor)
        .where(
          and(
            eq(statusPageMonitor.statusPageId, input.statusPageId),
            eq(statusPageMonitor.monitorId, input.monitorId),
          ),
        );

      return { success: true };
    }),

  // Get available monitors that can be added to a status page
  getAvailableMonitors: protectedProcedure
    .input(z.object({ statusPageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Verify status page belongs to user
      const statusPageData = await db
        .select()
        .from(statusPage)
        .where(
          and(
            eq(statusPage.id, input.statusPageId),
            eq(statusPage.userId, user.id),
          ),
        )
        .limit(1);

      if (!statusPageData[0]) {
        throw new Error("Status page not found");
      }

      // Get all user's monitors
      const allMonitors = await db
        .select()
        .from(monitor)
        .where(eq(monitor.userId, user.id))
        .orderBy(desc(monitor.createdAt));

      // Get monitors already added to this status page
      const addedMonitors = await db
        .select({ monitorId: statusPageMonitor.monitorId })
        .from(statusPageMonitor)
        .where(eq(statusPageMonitor.statusPageId, input.statusPageId));

      const addedMonitorIds = new Set(addedMonitors.map((m) => m.monitorId));

      // Filter out already added monitors
      const availableMonitors = allMonitors.filter(
        (monitor) => !addedMonitorIds.has(monitor.id),
      );

      return availableMonitors;
    }),
});
