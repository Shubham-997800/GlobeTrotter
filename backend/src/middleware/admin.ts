import type { NextFunction, Request, Response } from "express";

import { getSupabaseAdmin } from "../lib/supabase.js";
import { ApiError } from "../lib/api-error.js";

/**
 * Requires the authenticated user to have the `admin` role.
 * Must be used AFTER `requireAuth` middleware (which sets `req.userId`).
 *
 * Fetches the profile role from the database on every request — never trusts
 * frontend-supplied role information.
 */
export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ApiError("UNAUTHORIZED", "Authentication required.");
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("profiles")
      .select("role")
      .eq("id", req.userId)
      .maybeSingle<{ role: string | null }>();

    if (error) {
      throw new ApiError("SERVER_ERROR", "Failed to verify admin role.");
    }

    if (!data || data.role !== "admin") {
      throw new ApiError(
        "FORBIDDEN",
        "You do not have permission to access this resource.",
        403,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
