import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { statusPage, statusPageMonitor } from "@/server/db/schema";
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

      const statusPages = await db.query.statusPage.findMany({
        where: (sp, { eq }) => eq(sp.userId, user.id),
        orderBy: (sp, { desc }) => [desc(sp.createdAt)],
      });

      if (input.includeMonitors) {
        // Get monitors for each status page
        const statusPagesWithMonitors = await Promise.all(
          statusPages.map(async (page) => {
            const spm = await db.query.statusPageMonitor.findMany({
              where: (spm, { eq }) => eq(spm.statusPageId, page.id),
              with: { monitor: true },
            });
            const monitors = spm
              .map((r) => r.monitor)
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((m) => ({
                id: m.id,
                name: m.name,
                slug: m.slug,
                url: m.url,
                status: m.status,
                lastChecked: m.lastChecked ?? null,
                threshold: m.threshold,
                cronExpression: m.cronExpression,
                createdAt: m.createdAt,
                updatedAt: m.updatedAt,
              }));

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
      const statusPageData = await db.query.statusPage.findFirst({
        where: (sp, { eq }) => eq(sp.slug, input.slug),
      });

      if (!statusPageData) {
        throw new Error("Status page not found");
      }

      // Get monitors for this status page
      const spm = await db.query.statusPageMonitor.findMany({
        where: (spm, { eq }) => eq(spm.statusPageId, statusPageData.id),
        with: { monitor: true },
      });
      const monitors = spm
        .map((r) => r.monitor)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((m) => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          url: m.url,
          status: m.status,
          lastChecked: m.lastChecked ?? null,
          threshold: m.threshold,
          cronExpression: m.cronExpression,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        }));

      // Get incidents for this status page and its monitors
      const incidentsRaw = await db.query.incident.findMany({
        where: (i, { eq }) => eq(i.statusPageId, statusPageData.id),
        with: { monitor: true },
        orderBy: (i, { desc }) => [desc(i.startedAt)],
      });
      const incidents = incidentsRaw.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        status: i.status,
        statusPageId: i.statusPageId,
        monitorId: i.monitorId,
        startedAt: i.startedAt,
        resolvedAt: i.resolvedAt ?? null,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        monitorName: i.monitor?.name ?? null,
      }));

      return {
        ...statusPageData,
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
      const existingStatusPage = await db.query.statusPage.findFirst({
        where: (sp, { eq }) => eq(sp.slug, slug),
      });

      if (existingStatusPage) {
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
      const existingStatusPage = await db.query.statusPage.findFirst({
        where: (sp, { and, eq }) => and(eq(sp.id, id), eq(sp.userId, user.id)),
      });

      if (!existingStatusPage) {
        throw new Error("Status page not found");
      }

      // Generate new slug if name is being updated
      let slug = existingStatusPage.slug;
      if (updateData.name && updateData.name !== existingStatusPage.name) {
        slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Check if new slug already exists
        const slugExists = await db.query.statusPage.findFirst({
          where: (sp, { and, eq, ne }) => and(eq(sp.slug, slug), ne(sp.id, id)),
        });

        if (slugExists) {
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
      const statusPageData = await db.query.statusPage.findFirst({
        where: (sp, { and, eq }) =>
          and(eq(sp.id, input.statusPageId), eq(sp.userId, user.id)),
      });

      if (!statusPageData) {
        throw new Error("Status page not found");
      }

      // Verify monitor belongs to user
      const monitorData = await db.query.monitor.findFirst({
        where: (m, { and, eq }) =>
          and(eq(m.id, input.monitorId), eq(m.userId, user.id)),
      });

      if (!monitorData) {
        throw new Error("Monitor not found");
      }

      // Check if monitor is already added to this status page
      const existingRelation = await db.query.statusPageMonitor.findFirst({
        where: (spm, { and, eq }) =>
          and(
            eq(spm.statusPageId, input.statusPageId),
            eq(spm.monitorId, input.monitorId),
          ),
      });

      if (existingRelation) {
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
      const statusPageData = await db.query.statusPage.findFirst({
        where: (sp, { and, eq }) =>
          and(eq(sp.id, input.statusPageId), eq(sp.userId, user.id)),
      });

      if (!statusPageData) {
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
      const allMonitors = await db.query.monitor.findMany({
        where: (m, { eq }) => eq(m.userId, user.id),
        orderBy: (m, { desc }) => [desc(m.createdAt)],
      });

      // Get monitors already added to this status page
      const addedMonitors = await db.query.statusPageMonitor.findMany({
        where: (spm, { eq }) => eq(spm.statusPageId, input.statusPageId),
        columns: { monitorId: true },
      });

      const addedMonitorIds = new Set(addedMonitors.map((m) => m.monitorId));

      // Filter out already added monitors
      const availableMonitors = allMonitors.filter(
        (monitor) => !addedMonitorIds.has(monitor.id),
      );

      return availableMonitors;
    }),
});
