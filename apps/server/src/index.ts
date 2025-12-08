import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";

import env from "./env";
import router from "./routes";

const app = new Hono();
app.use(logger());

app.use("/favicon.ico", serveStatic({ path: "./favicon.ico" }));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api", router);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
