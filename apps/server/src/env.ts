import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3090),
    HOST: z.string().default("http://localhost:3090"),
    BETTER_AUTH_SECRET: z.string().nonoptional(),
    DB_HOST: z.enum(["sqlite", "turso"]).default("sqlite"),
    DB_URL: z.url().default("file:///hawk.db"),
    DB_AUTH_TOKEN: z.string().optional(),
  },
  runtimeEnv: process.env,
});

export default env;
