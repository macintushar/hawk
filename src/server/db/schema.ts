// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { utcNow } from "@/lib/date-utils";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => /* @__PURE__ */ utcNow())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ utcNow())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ utcNow())
    .notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => /* @__PURE__ */ utcNow())
    .notNull(),
});

export const monitor = sqliteTable("monitor", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  url: text("url").notNull(),
  status: text("status", { enum: ["up", "down", "unknown"] })
    .default("unknown")
    .notNull(),
  lastChecked: integer("last_checked", { mode: "timestamp" }),
  threshold: integer("threshold").default(3).notNull(), // Number of consecutive failures before marking as down
  cronExpression: text("cron_expression").default("*/10 * * * *").notNull(), // Default: every 5 minutes
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ utcNow())
    .notNull(),
});

export const statusPage = sqliteTable("status_page", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ utcNow())
    .notNull(),
});

export const statusPageMonitor = sqliteTable("status_page_monitor", {
  id: text("id").primaryKey(),
  statusPageId: text("status_page_id")
    .notNull()
    .references(() => statusPage.id, { onDelete: "cascade" }),
  monitorId: text("monitor_id")
    .notNull()
    .references(() => monitor.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const incident = sqliteTable("incident", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["investigating", "identified", "monitoring", "resolved"],
  })
    .default("investigating")
    .notNull(),
  statusPageId: text("status_page_id")
    .notNull()
    .references(() => statusPage.id, { onDelete: "cascade" }),
  monitorId: text("monitor_id").references(() => monitor.id, {
    onDelete: "cascade",
  }),
  startedAt: integer("started_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ utcNow())
    .notNull(),
});

export const monitorCheck = sqliteTable("monitor_check", {
  id: text("id").primaryKey(),
  monitorId: text("monitor_id")
    .notNull()
    .references(() => monitor.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["up", "down"] }).notNull(),
  responseTime: integer("response_time"), // in milliseconds
  statusCode: integer("status_code"),
  error: text("error"),
  checkedAt: integer("checked_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const notificationSettings = sqliteTable("notification_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  slackEnabled: integer("slack_enabled", { mode: "boolean" })
    .default(false)
    .notNull(),
  slackWebhookUrl: text("slack_webhook_url"),
  slackChannel: text("slack_channel"),
  onMonitorDown: integer("on_monitor_down", { mode: "boolean" })
    .default(true)
    .notNull(),
  onMonitorUp: integer("on_monitor_up", { mode: "boolean" })
    .default(false)
    .notNull(),
  onIncidentCreated: integer("on_incident_created", { mode: "boolean" })
    .default(true)
    .notNull(),
  onIncidentResolved: integer("on_incident_resolved", { mode: "boolean" })
    .default(true)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => /* @__PURE__ */ utcNow())
    .notNull(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  monitors: many(monitor),
  statusPages: many(statusPage),
  sessions: many(session),
  accounts: many(account),
  notifications: many(notificationSettings),
}));

export const statusPageRelations = relations(statusPage, ({ one, many }) => ({
  user: one(user, { fields: [statusPage.userId], references: [user.id] }),
  incidents: many(incident),
  statusPageMonitors: many(statusPageMonitor),
}));

export const monitorRelations = relations(monitor, ({ one, many }) => ({
  user: one(user, { fields: [monitor.userId], references: [user.id] }),
  monitorChecks: many(monitorCheck),
  incidents: many(incident),
  statusPageMonitors: many(statusPageMonitor),
}));

export const statusPageMonitorRelations = relations(
  statusPageMonitor,
  ({ one }) => ({
    statusPage: one(statusPage, {
      fields: [statusPageMonitor.statusPageId],
      references: [statusPage.id],
    }),
    monitor: one(monitor, {
      fields: [statusPageMonitor.monitorId],
      references: [monitor.id],
    }),
  }),
);

export const incidentRelations = relations(incident, ({ one }) => ({
  statusPage: one(statusPage, {
    fields: [incident.statusPageId],
    references: [statusPage.id],
  }),
  monitor: one(monitor, {
    fields: [incident.monitorId],
    references: [monitor.id],
  }),
}));

export const monitorCheckRelations = relations(monitorCheck, ({ one }) => ({
  monitor: one(monitor, {
    fields: [monitorCheck.monitorId],
    references: [monitor.id],
  }),
}));

export const notificationSettingsRelations = relations(
  notificationSettings,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationSettings.userId],
      references: [user.id],
    }),
  }),
);
