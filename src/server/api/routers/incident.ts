import { z } from "zod";
import { eq, and, desc, not } from "drizzle-orm";
import { randomBytes } from "crypto";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { incident, statusPage, monitor } from "@/server/db/schema";
import { utcNow } from "@/lib/date-utils";
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

      // Build where conditions
      const whereConditions = [eq(statusPage.userId, user.id)];

      if (input.statusPageId) {
        whereConditions.push(eq(incident.statusPageId, input.statusPageId));
      }

      if (input.status) {
        whereConditions.push(eq(incident.status, input.status));
      }

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
          statusPageName: statusPage.name,
          monitorName: monitor.name,
        })
        .from(incident)
        .innerJoin(statusPage, eq(incident.statusPageId, statusPage.id))
        .leftJoin(monitor, eq(incident.monitorId, monitor.id))
        .where(and(...whereConditions))
        .orderBy(desc(incident.startedAt));

      return incidents;
    }),

  // Get a single incident by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const incidentData = await db
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
          statusPageName: statusPage.name,
          monitorName: monitor.name,
        })
        .from(incident)
        .innerJoin(statusPage, eq(incident.statusPageId, statusPage.id))
        .leftJoin(monitor, eq(incident.monitorId, monitor.id))
        .where(and(eq(incident.id, input.id), eq(statusPage.userId, user.id)))
        .limit(1);

      if (!incidentData[0]) {
        throw new Error("Incident not found");
      }

      return incidentData[0];
    }),

  // Create a new incident
  create: protectedProcedure
    .input(createIncidentSchema)
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

      // Verify monitor belongs to user if provided
      if (input.monitorId) {
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
      const existingIncident = await db
        .select()
        .from(incident)
        .innerJoin(statusPage, eq(incident.statusPageId, statusPage.id))
        .where(and(eq(incident.id, id), eq(statusPage.userId, user.id)))
        .limit(1);

      if (!existingIncident[0]) {
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
      const existingIncident = await db
        .select()
        .from(incident)
        .innerJoin(statusPage, eq(incident.statusPageId, statusPage.id))
        .where(and(eq(incident.id, input.id), eq(statusPage.userId, user.id)))
        .limit(1);

      if (!existingIncident[0]) {
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
      const existingIncident = await db
        .select()
        .from(incident)
        .innerJoin(statusPage, eq(incident.statusPageId, statusPage.id))
        .where(and(eq(incident.id, input.id), eq(statusPage.userId, user.id)))
        .limit(1);

      if (!existingIncident[0]) {
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

      // Build where conditions
      const whereConditions = [eq(incident.statusPageId, input.statusPageId)];

      if (input.status) {
        whereConditions.push(eq(incident.status, input.status));
      }

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
        .where(and(...whereConditions))
        .orderBy(desc(incident.startedAt));

      return incidents;
    }),

  // Get active incidents (not resolved)
  getActive: protectedProcedure
    .input(z.object({ statusPageId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      // Build where conditions
      const whereConditions = [
        eq(statusPage.userId, user.id),
        not(eq(incident.status, "resolved")),
      ];

      if (input.statusPageId) {
        whereConditions.push(eq(incident.statusPageId, input.statusPageId));
      }

      const activeIncidents = await db
        .select({
          id: incident.id,
          title: incident.title,
          description: incident.description,
          status: incident.status,
          statusPageId: incident.statusPageId,
          monitorId: incident.monitorId,
          startedAt: incident.startedAt,
          createdAt: incident.createdAt,
          updatedAt: incident.updatedAt,
          statusPageName: statusPage.name,
          monitorName: monitor.name,
        })
        .from(incident)
        .innerJoin(statusPage, eq(incident.statusPageId, statusPage.id))
        .leftJoin(monitor, eq(incident.monitorId, monitor.id))
        .where(and(...whereConditions))
        .orderBy(desc(incident.startedAt));

      return activeIncidents;
    }),
});
