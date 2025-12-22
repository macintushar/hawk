import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";

import { Monitor } from "@hawk/types";

const app = new Hono();

app.use(logger())

app.get("/", (c) => {
  const monitor: Monitor = "HTTP";
  return c.text("Hello Hono!");
});

app.use("*", serveStatic({ root: "./public" }))

export default app;
