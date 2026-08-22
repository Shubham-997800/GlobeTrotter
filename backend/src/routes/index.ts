import { Router } from "express";

import { authRouter } from "./auth.routes.js";
import { tripsRouter } from "./trips.routes.js";
import { itineraryRouter } from "./itinerary.routes.js";
import { catalogRouter } from "./catalog.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { exploreRouter } from "./explore.routes.js";
import { env } from "../config/env.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "globetrotter-api",
    env: env.nodeEnv,
    supabaseConfigured: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/trips", tripsRouter, itineraryRouter);
apiRouter.use("/", catalogRouter);
apiRouter.use("/", dashboardRouter);
apiRouter.use("/explore", exploreRouter);
