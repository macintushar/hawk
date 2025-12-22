import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        DEPLOYMENT_PLATFORM: z.enum(["vercel", "cloudflare", "docker"]),
        PORT: z.string().optional().default("8787"),
    },

    runtimeEnv: typeof process !== "undefined" ? process.env : {},
    emptyStringAsUndefined: true,
});