import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        DEPLOYMENT_PLATFORM: z.enum(["vercel", "docker"]),
        PORT: z.string().optional().default("8787"),
        REGION: z.string(),
    },

    runtimeEnvStrict: {
        DEPLOYMENT_PLATFORM: process.env.DEPLOYMENT_PLATFORM,
        PORT: process.env.PORT,
        REGION: process.env.REGION || process.env.VERCEL_REGION,
    },
    emptyStringAsUndefined: true,
});