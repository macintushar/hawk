import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// Monitor schemas
export const createMonitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Invalid URL"),
  threshold: z.number().int().min(1).max(10).default(3),
  cronExpression: z.string().default("*/5 * * * *"), // Default: every 5 minutes
});

export const updateMonitorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").optional(),
  url: z.string().url("Invalid URL").optional(),
  threshold: z.number().int().min(1).max(10).optional(),
  cronExpression: z.string().optional(),
});

export const deleteMonitorSchema = z.object({
  id: z.string(),
});

// Status Page schemas
export const createStatusPageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const updateStatusPageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
});

export const deleteStatusPageSchema = z.object({
  id: z.string(),
});

export const addMonitorToStatusPageSchema = z.object({
  statusPageId: z.string(),
  monitorId: z.string(),
});

export const removeMonitorFromStatusPageSchema = z.object({
  statusPageId: z.string(),
  monitorId: z.string(),
});

// Incident schemas
export const createIncidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  statusPageId: z.string(),
  monitorId: z.string().optional(),
});

export const updateIncidentSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: z
    .enum(["investigating", "identified", "monitoring", "resolved"])
    .optional(),
});

export const deleteIncidentSchema = z.object({
  id: z.string(),
});

export const resolveIncidentSchema = z.object({
  id: z.string(),
});

// Query schemas
export const getMonitorsSchema = z.object({
  statusPageId: z.string().optional(),
});

export const getStatusPagesSchema = z.object({
  includeMonitors: z.boolean().default(false),
});

export const getIncidentsSchema = z.object({
  statusPageId: z.string().optional(),
  status: z
    .enum(["investigating", "identified", "monitoring", "resolved"])
    .optional(),
});
