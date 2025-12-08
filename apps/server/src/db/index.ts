import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sqlite";
import env from "../env";
import libsqlDriver from "./drivers/libsql";

// You can specify any property from the bun:sql connection options
const db = (() => {
  switch (env.DB_HOST) {
    case "sqlite": {
      return libsqlDriver;
    }
    default: {
      return libsqlDriver;
    }
  }
})();

export default db;
