import { Hono } from "hono";

import type { Monitor } from "@hawk/types";

const router = new Hono();

router.get("/", (c) => {
  return c.text("Hello Hono!");
});

router.get("/manual-check/:id", (c) => {
  const abc: Monitor = {
    id: "1",
    name: "Test Monitor",
    url: "https://example.com",
    type: "http",
    interval: 60,
    timeout: 10,
    status: "up",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return c.text("Manual Check");
});

export default router;
