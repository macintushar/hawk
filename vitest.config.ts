import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/**/*.{test,spec}.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "**/*.d.ts",
        "**/*.next/**",
        "src/trpc/**",
        "src/styles/**",
        "src/components/ui/**",
        "src/components/theme/**",
        "**/*.js",
        "src/middleware.ts",
        "src/drizzle.config.ts",
        "src/server/db/**",
        "src/server/api/**",
        "src/hooks/**",
        "**config.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
