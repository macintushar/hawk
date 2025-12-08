import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  HawkTokenSchema,
  MonitorCheckParamsSchema,
  type Monitor,
} from "@hawk/types";

import { checkMonitor } from "./handlers/monitor";

const router = new Hono();

router.get("/", (c) => {
  return c.text("Hello Hono!");
});

router.get(
  "/manual-check/:id",
  zValidator("header", HawkTokenSchema),
  zValidator("param", MonitorCheckParamsSchema),
  async (c) => {
    const { "x-hawk-token": token } = c.req.valid("header");
    const { id } = c.req.valid("param");

    const monitors: Monitor[] = [
      {
        id: "1",
        name: "Test Monitor",
        url: "https://api.squared.ai",
        token: "abc123xyz",
        type: "HTTP",
        method: "GET",
        interval: 60,
        timeout: 10,
        status: "up",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const monitor = monitors.find((monitor) => monitor.id === id);

    if (!monitor) {
      return c.json({ error: "Monitor not found" }, 404);
    }

    if (monitor.token !== token) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const result = await checkMonitor(monitor);

    return c.json(result);
  },
);

export default router;
