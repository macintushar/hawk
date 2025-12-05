import z from "zod";

export type Monitor = {
  id: string;
  name: string;
  url: string;
  type: string;
  interval: number;
  timeout: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const MonitorCheckParamsSchema = z.object({
  id: z.string(),
});

export const HawkTokenSchema = z.object({
  "x-hawk-token": z.string(),
});
