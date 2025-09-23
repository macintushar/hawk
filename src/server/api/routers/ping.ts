import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { monitoringService } from "@/lib/monitoring-service";
import { utcNow } from "@/lib/date-utils";

export const pingRouter = createTRPCRouter({
  // Public endpoint for cron jobs to trigger monitoring checks
  checkAll: publicProcedure.mutation(async () => {
    try {
      await monitoringService.checkAllDueMonitors();
      return {
        success: true,
        message: "All due monitors have been checked",
      };
    } catch (error) {
      console.error("Error checking monitors:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),

  // Health check endpoint
  health: publicProcedure.query(() => {
    return {
      status: "healthy",
      timestamp: utcNow(),
    };
  }),
});
