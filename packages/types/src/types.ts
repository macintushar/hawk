import z from "zod";

export type AllowedHTTPCheckMethods = "GET" | "POST";

export type MonitorTypes = "HTTP";

export type Monitor = {
  id: string;
  name: string;
  url: string;
  type: MonitorTypes;
  token: string;
  method: AllowedHTTPCheckMethods;
  headers?: Record<string, string>;
  body?: string;
  interval: number;
  timeout: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MonitorStatus = "up" | "down";

export const MonitorCheckParamsSchema = z.object({
  id: z.string(),
});

export const HawkTokenSchema = z.object({
  "x-hawk-token": z.string(),
});

export type DB_HOSTS = "sqlite" | "turso" | "d1";
