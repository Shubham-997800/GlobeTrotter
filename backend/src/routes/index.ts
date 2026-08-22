import { Router } from "express";

import { authRouter } from "./auth.routes.js";
import { env } from "../config/env.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "globetrotter-api",
    env: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
  });
});

apiRouter.use("/auth", authRouter);
