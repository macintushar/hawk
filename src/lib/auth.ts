import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db"; // your drizzle instance
import { env } from "@/env";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [bearer()],
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  baseURL: env.BASE_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: env.ENABLE_GITHUB_OAUTH
      ? {
          clientId: env.GITHUB_CLIENT_ID ?? "",
          clientSecret: env.GITHUB_CLIENT_SECRET ?? "",
        }
      : undefined,
  },
});
