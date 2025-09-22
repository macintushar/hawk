import { z } from "zod";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { notificationSettings } from "@/server/db/schema";
import { sendSlackMessage } from "@/lib/notifications/slack";

export const notificationsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    const user = session.user;

    const existing = await db.query.notificationSettings.findFirst({
      where: (ns, { eq }) => eq(ns.userId, user.id),
    });

    if (existing) return existing;

    // Return sensible defaults if none exist
    return {
      id: "",
      userId: user.id,
      slackEnabled: false,
      slackWebhookUrl: null,
      slackChannel: null,
      onMonitorDown: true,
      onMonitorUp: false,
      onIncidentCreated: true,
      onIncidentResolved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),

  save: protectedProcedure
    .input(
      z.object({
        slackEnabled: z.boolean(),
        slackWebhookUrl: z.string().url().optional().nullable(),
        slackChannel: z.string().optional().nullable(),
        onMonitorDown: z.boolean(),
        onMonitorUp: z.boolean(),
        onIncidentCreated: z.boolean(),
        onIncidentResolved: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const existing = await db.query.notificationSettings.findFirst({
        where: (ns, { eq }) => eq(ns.userId, user.id),
      });

      if (existing) {
        const updated = await db
          .update(notificationSettings)
          .set({
            slackEnabled: input.slackEnabled,
            slackWebhookUrl: input.slackWebhookUrl ?? null,
            slackChannel: input.slackChannel ?? null,
            onMonitorDown: input.onMonitorDown,
            onMonitorUp: input.onMonitorUp,
            onIncidentCreated: input.onIncidentCreated,
            onIncidentResolved: input.onIncidentResolved,
          })
          .where(eq(notificationSettings.userId, user.id))
          .returning();
        return updated[0];
      }

      const created = await db
        .insert(notificationSettings)
        .values({
          id: randomBytes(16).toString("hex"),
          userId: user.id,
          slackEnabled: input.slackEnabled,
          slackWebhookUrl: input.slackWebhookUrl ?? null,
          slackChannel: input.slackChannel ?? null,
          onMonitorDown: input.onMonitorDown,
          onMonitorUp: input.onMonitorUp,
          onIncidentCreated: input.onIncidentCreated,
          onIncidentResolved: input.onIncidentResolved,
        })
        .returning();
      return created[0];
    }),

  testSlack: protectedProcedure
    .input(
      z.object({
        message: z.string().default("Test notification from Hawk"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const user = session.user;

      const settings = await db.query.notificationSettings.findFirst({
        where: (ns, { eq }) => eq(ns.userId, user.id),
      });
      if (!settings?.slackEnabled) {
        throw new Error("Slack notifications are disabled");
      }

      const result = await sendSlackMessage(
        settings.slackWebhookUrl ?? undefined,
        {
          text: input.message,
          channel: settings.slackChannel ?? undefined,
        },
      );

      if (!result.ok) {
        throw new Error(result.error ?? "Failed to send Slack message");
      }

      return { success: true };
    }),
});
