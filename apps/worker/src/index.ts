import { Hono } from "hono";
import { logger } from "hono/logger";

import { Monitor } from "@hawk/types";

const app = new Hono();

app.use(logger())

app.get("/", (c) => {
  const monitor: Monitor = "HTTP";
  return c.text("Hello Hono!");
});


export default app;
