import app from "./src";

import "./src/env"
import { env } from "./src/env";


try {
    console.log(`Listening on port ${env.PORT}`);
    console.log(`Running in region: ${env.REGION}`);
    Bun.serve({
        fetch: app.fetch,
        port: env.PORT,
    })
} catch (error) {
    console.error(error);
    process.exit(1);
}   