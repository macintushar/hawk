import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import { monitorRouter } from "./routers/monitor";
import { statusRouter } from "./routers/status";
import { pingRouter } from "./routers/ping";
import { statusPageRouter } from "./routers/status-page";
import { incidentRouter } from "./routers/incident";
import { notificationsRouter } from "./routers/notifications";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  monitor: monitorRouter,
  status: statusRouter,
  ping: pingRouter,
  statusPage: statusPageRouter,
  incident: incidentRouter,
  notifications: notificationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
