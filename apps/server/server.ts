import app from "./src";
import env from "./src/env";

try {
  Bun.serve({
    port: env.PORT,
    fetch: app.fetch,
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
