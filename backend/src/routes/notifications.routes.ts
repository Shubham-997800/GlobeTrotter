import { Router } from "express";
import { z } from "zod";

import { ApiError, asyncHandler } from "../lib/api-error.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const notificationsRouter = Router();

/* ── Shapes ─────────────────────────────────────────────────────── */

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  href: string | null;
  actor_name: string | null;
  actor_avatar: string | null;
  read: boolean;
  created_at: string;
}

function toApi(row: NotificationRow) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: row.created_at,
    read: row.read,
    category: row.category,
    ...(row.href ? { href: row.href } : {}),
    ...(row.actor_name
      ? { actor: { name: row.actor_name, ...(row.actor_avatar ? { avatarUrl: row.actor_avatar } : {}) } }
      : {}),
  };
}

/* ── Routes ─────────────────────────────────────────────────────── */

notificationsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabaseAdmin()
      .from("notifications")
      .select("*")
      .eq("user_id", req.userId!)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json({ notifications: ((data ?? []) as NotificationRow[]).map(toApi) });
  }),
);

const idParam = z.object({ id: z.string().uuid() });

async function setRead(userId: string, id: string, read: boolean): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("notifications")
    .update({ read })
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw new ApiError("SERVER_ERROR", error.message);
}

function parseId(body: unknown): string {
  const raw =
    typeof body === "object" && body !== null && "id" in body
      ? (body as { id: unknown }).id
      : undefined;
  const result = z.string().uuid().safeParse(raw);
  if (!result.success) {
    throw new ApiError("INVALID_REQUEST", "body.id must be a notification UUID.");
  }
  return result.data;
}

notificationsRouter.post(
  "/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    await setRead(req.userId!, parseId(req.body), true);
    res.json({ ok: true });
  }),
);

notificationsRouter.post(
  "/unread",
  requireAuth,
  asyncHandler(async (req, res) => {
    await setRead(req.userId!, parseId(req.body), false);
    res.json({ ok: true });
  }),
);

notificationsRouter.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await getSupabaseAdmin()
      .from("notifications")
      .update({ read: true })
      .eq("user_id", req.userId!)
      .eq("read", false);
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json({ ok: true });
  }),
);

notificationsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = idParam.safeParse(req.params);
    if (!parsed.success) throw new ApiError("INVALID_REQUEST", ":id must be a UUID.");
    const { error } = await getSupabaseAdmin()
      .from("notifications")
      .delete()
      .eq("user_id", req.userId!)
      .eq("id", parsed.data.id);
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json({ ok: true });
  }),
);

notificationsRouter.delete(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await getSupabaseAdmin()
      .from("notifications")
      .delete()
      .eq("user_id", req.userId!);
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json({ ok: true });
  }),
);
