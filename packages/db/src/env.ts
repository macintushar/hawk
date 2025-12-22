import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),
    },
    runtimeEnvStrict: {
        DATABASE_URL: process.env.DATABASE_URL,
    },
});

export default env;
