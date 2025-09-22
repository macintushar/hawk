import { z } from "zod";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { incident } from "@/server/db/schema";
import { utcNow } from "@/lib/date-utils";
import { sendSlackMessage } from "@/lib/notifications/slack";
import {
  createIncidentSchema,
  updateIncidentSchema,
  deleteIncidentSchema,
  resolveIncidentSchema,
  getIncidentsSchema,
} from "@/schemas";

export const incidentRouter = createTRPCRouter({
  // Get all incidents for the authenticated user
  list: protectedProcedure
    .input(getIncidentsSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const incidentsRaw = await db.query.incident.findMany({
        with: {
          statusPage: true,
          monitor: true,
        },
        orderBy: (i, { desc }) => [desc(i.startedAt)],
      });

      const incidents = incidentsRaw
        .filter((i) => i.statusPage.userId === user.id)
        .filter(
          (i) => !input.statusPageId || i.statusPageId === input.statusPageId,
        )
        .filter((i) => !input.status || i.status === input.status)
        .map((i) => ({
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
          statusPageName: i.statusPage.name,
          monitorName: i.monitor?.name ?? null,
        }));

      return incidents;
    }),

  // Get a single incident by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const inc = await db.query.incident.findFirst({
        where: (i, { eq }) => eq(i.id, input.id),
        with: { statusPage: true, monitor: true },
      });

      if (!inc || inc.statusPage.userId !== user.id) {
        throw new Error("Incident not found");
      }

      return {
        id: inc.id,
        title: inc.title,
        description: inc.description,
        status: inc.status,
        statusPageId: inc.statusPageId,
        monitorId: inc.monitorId,
        startedAt: inc.startedAt,
        resolvedAt: inc.resolvedAt ?? null,
        createdAt: inc.createdAt,
        updatedAt: inc.updatedAt,
        statusPageName: inc.statusPage.name,
        monitorName: inc.monitor?.name ?? null,
      };
    }),

  // Create a new incident
  create: protectedProcedure
    .input(createIncidentSchema)
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

      // Verify monitor belongs to user if provided
      if (input.monitorId) {
        const monitorData = await db.query.monitor.findFirst({
          where: (m, { and, eq }) =>
            and(eq(m.id, input.monitorId!), eq(m.userId, user.id)),
        });

        if (!monitorData) {
          throw new Error("Monitor not found");
        }
      }

      const newIncident = await db
        .insert(incident)
        .values({
          id: randomBytes(16).toString("hex"),
          title: input.title,
          description: input.description,
          statusPageId: input.statusPageId,
          monitorId: input.monitorId,
        })
        .returning();

      // Notify if rule enabled
      const cfg = await db.query.notificationSettings.findFirst({
        where: (ns, { eq }) => eq(ns.userId, user.id),
      });
      if (cfg?.slackEnabled && cfg.onIncidentCreated && newIncident[0]) {
        const text = `:memo: Incident created: ${newIncident[0].title}`;
        await sendSlackMessage(cfg.slackWebhookUrl ?? undefined, {
          text,
          channel: cfg.slackChannel ?? undefined,
        });
      }

      return newIncident[0];
    }),

  // Update an existing incident
  update: protectedProcedure
    .input(updateIncidentSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;
      const { id, ...updateData } = input;

      // Check if incident exists and belongs to user
      const existingIncident = await db.query.incident.findFirst({
        where: (i, { eq }) => eq(i.id, id),
        with: { statusPage: true },
      });

      if (!existingIncident || existingIncident.statusPage.userId !== user.id) {
        throw new Error("Incident not found");
      }

      const updatedIncident = await db
        .update(incident)
        .set(updateData)
        .where(eq(incident.id, id))
        .returning();

      return updatedIncident[0];
    }),

  // Delete an incident
  delete: protectedProcedure
    .input(deleteIncidentSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Check if incident exists and belongs to user
      const existingIncident = await db.query.incident.findFirst({
        where: (i, { eq }) => eq(i.id, input.id),
        with: { statusPage: true },
      });

      if (!existingIncident || existingIncident.statusPage.userId !== user.id) {
        throw new Error("Incident not found");
      }

      // Delete the incident
      await db.delete(incident).where(eq(incident.id, input.id));

      return { success: true };
    }),

  // Resolve an incident
  resolve: protectedProcedure
    .input(resolveIncidentSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Check if incident exists and belongs to user
      const existingIncident = await db.query.incident.findFirst({
        where: (i, { eq }) => eq(i.id, input.id),
        with: { statusPage: true },
      });

      if (!existingIncident || existingIncident.statusPage.userId !== user.id) {
        throw new Error("Incident not found");
      }

      const resolvedIncident = await db
        .update(incident)
        .set({
          status: "resolved",
          resolvedAt: utcNow(),
        })
        .where(eq(incident.id, input.id))
        .returning();

      // Notify if rule enabled
      const cfg = await db.query.notificationSettings.findFirst({
        where: (ns, { eq }) => eq(ns.userId, user.id),
      });
      if (cfg?.slackEnabled && cfg.onIncidentResolved && resolvedIncident[0]) {
        const text = `:white_check_mark: Incident resolved: ${resolvedIncident[0].title}`;
        await sendSlackMessage(cfg.slackWebhookUrl ?? undefined, {
          text,
          channel: cfg.slackChannel ?? undefined,
        });
      }

      return resolvedIncident[0];
    }),

  // Get incidents for a specific status page
  getByStatusPage: protectedProcedure
    .input(
      z.object({
        statusPageId: z.string(),
        status: z
          .enum(["investigating", "identified", "monitoring", "resolved"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
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

      const incidentsRaw = await db.query.incident.findMany({
        where: (i, { eq }) => eq(i.statusPageId, input.statusPageId),
        with: { monitor: true },
        orderBy: (i, { desc }) => [desc(i.startedAt)],
      });

      const incidents = incidentsRaw
        .filter((i) => !input.status || i.status === input.status)
        .map((i) => ({
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

      return incidents;
    }),

  // Get active incidents (not resolved)
  getActive: protectedProcedure
    .input(z.object({ statusPageId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const incidentsRaw = await db.query.incident.findMany({
        where: (i, { not, eq }) => not(eq(i.status, "resolved")),
        with: { statusPage: true, monitor: true },
        orderBy: (i, { desc }) => [desc(i.startedAt)],
      });

      const activeIncidents = incidentsRaw
        .filter((i) => i.statusPage.userId === user.id)
        .filter(
          (i) => !input.statusPageId || i.statusPageId === input.statusPageId,
        )
        .map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          status: i.status,
          statusPageId: i.statusPageId,
          monitorId: i.monitorId,
          startedAt: i.startedAt,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
          statusPageName: i.statusPage.name,
          monitorName: i.monitor?.name ?? null,
        }));

      return activeIncidents;
    }),
});
