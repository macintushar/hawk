import { drizzle } from "drizzle-orm/libsql";
import env from "../../env";

const libsqlDriver = drizzle({
  connection: {
    url: env.DB_HOST,
    ...(env.DB_AUTH_TOKEN &&
      env.DB_HOST === "turso" && {
        authToken: env.DB_AUTH_TOKEN,
      }),
  },
});

export default libsqlDriver;
