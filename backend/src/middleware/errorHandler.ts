import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { ApiError } from "../lib/api-error.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    code: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }

  console.error("[globetrotter-api]", err);

  const isDev = env.nodeEnv !== "production";
  res.status(500).json({
    code: "SERVER_ERROR",
    message: isDev
      ? String((err as Error)?.message ?? err)
      : "Something went wrong.",
  });
}
