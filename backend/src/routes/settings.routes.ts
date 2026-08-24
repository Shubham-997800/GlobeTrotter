import { Router } from "express";

import { ApiError, asyncHandler } from "../lib/api-error.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { DEFAULT_SETTINGS } from "../lib/default-settings.js";

export const settingsRouter = Router();

/* Settings live as a JSONB blob on profiles so new keys ship without
   migrations — mirrors the frontend `SettingsState` shape. */

interface ProfileSettings {
  app_settings?: Record<string, unknown> | null;
}

settingsRouter.get(
  "/users/me/settings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .select("app_settings")
      .eq("id", req.userId!)
      .maybeSingle<ProfileSettings>();
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json({ settings: { ...DEFAULT_SETTINGS, ...(data?.app_settings ?? {}) } });
  }),
);

settingsRouter.put(
  "/users/me/settings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = req.body;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new ApiError("INVALID_REQUEST", "Body must be a settings object.");
    }
    const { error } = await getSupabaseAdmin()
      .from("profiles")
      .upsert(
        { id: req.userId!, app_settings: body },
        { onConflict: "id" },
      );
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json({ settings: body });
  }),
);
