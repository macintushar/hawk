import app from "./src";
import { PORT } from "./src/constants";

try {
  Bun.serve({
    port: PORT,
    fetch: app.fetch,
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
