import { Router, type Request } from "express";
import { z } from "zod";

import { ApiError, asyncHandler } from "../lib/api-error.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const tripsRouter = Router();

/* ── Schemas (mirror frontend TripDraftValues) ──────────────────── */

const INTEREST_IDS = [
  "adventure",
  "nature",
  "food",
  "culture",
  "history",
  "beaches",
  "mountains",
  "nightlife",
  "shopping",
  "relaxation",
  "city-life",
] as const;

const BUDGET_TIERS = ["budget", "moderate", "premium", "custom"] as const;

const tripDraftSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().default(""),
  coverImage: z.string().trim().max(2048).optional().default(""),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD"),
  destinationId: z.string().trim().min(1).max(120),
  interests: z.array(z.enum(INTEREST_IDS)).max(11).default([]),
  budgetTier: z.enum(BUDGET_TIERS),
  currency: z.string().trim().length(3),
  budgetAmount: z.coerce.number().min(0).max(1_000_000_000),
  status: z.enum(["draft", "planned", "completed"]).optional(),
  activityIds: z.array(z.string().trim().min(1).max(160)).max(500).optional(),
});

/**
 * Narrow patch (status flips from the itinerary builder) AND full-form
 * update (the /trips/:tripId/edit flow sends every TripDraftValues field).
 * `description`/`coverImage` accept "" or null to clear the stored value.
 */
const tripPatchSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  coverImage: z.string().trim().max(2048).nullable().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD").optional(),
  destinationId: z.string().trim().min(1).max(120).optional(),
  interests: z.array(z.enum(INTEREST_IDS)).max(11).optional(),
  budgetTier: z.enum(BUDGET_TIERS).optional(),
  currency: z.string().trim().length(3).optional(),
  budgetAmount: z.coerce.number().min(0).max(1_000_000_000).optional(),
  status: z.enum(["draft", "planned", "completed"]).optional(),
  activityIds: z.array(z.string().trim().min(1).max(160)).max(500).optional(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().trim().min(1).max(80)).min(1).max(200),
});

const bulkArchiveSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  archived: z.boolean(),
});

function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ApiError(
      "INVALID_REQUEST",
      issue ? `${issue.path.join(".") || "body"}: ${issue.message}` : "Invalid request body.",
    );
  }
  return result.data;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface TripRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  start_date: string;
  end_date: string;
  destination_id: string;
  interests: string[] | null;
  budget_tier: string;
  currency: string;
  budget_amount: number | string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  archived_at?: string | null;
  activity_ids?: string[] | null;
}

/** snake_case row → frontend `TripRecord`. */
export function toRecord(row: TripRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    coverImage: row.cover_image || undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    destinationId: row.destination_id,
    interests: (row.interests ?? []) as typeof INTEREST_IDS[number][],
    budgetTier: row.budget_tier as (typeof BUDGET_TIERS)[number],
    currency: row.currency,
    budgetAmount: Number(row.budget_amount ?? 0),
    status: row.status as "draft" | "planned",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    archivedAt: row.archived_at ?? null,
    activityIds: row.activity_ids ?? undefined,
  };
}

export async function fetchOwnedTrip(userId: string, id: string): Promise<TripRow> {  if (!UUID_RE.test(id)) {
    throw new ApiError("NOT_FOUND", "Trip not found.");
  }
  const { data, error } = await getSupabaseAdmin()
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle<TripRow>();
  if (error) throw new ApiError("SERVER_ERROR", error.message);
  if (!data) throw new ApiError("NOT_FOUND", "Trip not found.");
  return data;
}

/* ── Routes (all require a bearer token) ────────────────────────── */

tripsRouter.use(requireAuth);

tripsRouter.get(
  "/",
  asyncHandler(async (req: Request, res) => {
    const { data, error } = await getSupabaseAdmin()
      .from("trips")
      .select("*")
      .eq("user_id", req.userId!)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json((data ?? []).map(toRecord));
  }),
);

tripsRouter.post(
  "/",
  asyncHandler(async (req: Request, res) => {
    const draft = parseBody(tripDraftSchema, req.body);
    const { data, error } = await getSupabaseAdmin()
      .from("trips")
      .insert({
        user_id: req.userId!,
        name: draft.name,
        description: draft.description || null,
        cover_image: draft.coverImage || null,
        start_date: draft.startDate,
        end_date: draft.endDate,
        destination_id: draft.destinationId,
        interests: draft.interests,
        budget_tier: draft.budgetTier,
        currency: draft.currency.toUpperCase(),
        budget_amount: draft.budgetAmount,
        status: draft.status ?? "planned",
        activity_ids: draft.activityIds ?? [],
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single<TripRow>();
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.status(201).json(toRecord(data));
  }),
);

/** Bulk delete that reports partial failures ({ deletedIds, failedIds }). */
tripsRouter.post(
  "/bulk-delete",
  asyncHandler(async (req: Request, res) => {
    const payload = parseBody(bulkDeleteSchema, req.body);
    const admin = getSupabaseAdmin();
    const uuidIds = payload.ids.filter((id) => UUID_RE.test(id));
    const { data: owned, error } = await admin
      .from("trips")
      .select("id")
      .eq("user_id", req.userId!)
      .in("id", uuidIds.length > 0 ? uuidIds : ["00000000-0000-0000-0000-000000000000"]);
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    const ownedIds = new Set((owned ?? []).map((row) => row.id as string));

    let deleteError: { message: string } | null = null;
    if (ownedIds.size > 0) {
      const result = await admin
        .from("trips")
        .delete()
        .eq("user_id", req.userId!)
        .in("id", [...ownedIds]);
      deleteError = result.error;
    }
    if (deleteError) throw new ApiError("SERVER_ERROR", deleteError.message);

    res.json({
      deletedIds: [...ownedIds].filter((id) => payload.ids.includes(id)),
      failedIds: payload.ids.filter((id) => !ownedIds.has(id)),
    });
  }),
);

/** Persists archive state; archived trips leave default views. */
tripsRouter.patch(
  "/bulk-archive",
  asyncHandler(async (req: Request, res) => {
    const payload = parseBody(bulkArchiveSchema, req.body);
    const stamp = payload.archived ? new Date().toISOString() : null;
    const { data, error } = await getSupabaseAdmin()
      .from("trips")
      .update({ archived_at: stamp, updated_at: new Date().toISOString() })
      .eq("user_id", req.userId!)
      .in("id", payload.ids)
      .select("id");
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json((data ?? []).map((row) => row.id as string));
  }),
);

tripsRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res) => {
    const row = await fetchOwnedTrip(req.userId!, req.params.id);
    res.json(toRecord(row));
  }),
);

/** Upsert-style save used by autosave (`PUT /api/trips/:id/draft`). */
/** Narrow field patch (status flips) and full edit-form update. */
tripsRouter.patch(
  "/:id",
  asyncHandler(async (req: Request, res) => {
    const patch = parseBody(tripPatchSchema, req.body);
    const existing = await fetchOwnedTrip(req.userId!, req.params.id);
    const { data, error } = await getSupabaseAdmin()
      .from("trips")
      .update({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description || null }
          : {}),
        ...(patch.coverImage !== undefined
          ? { cover_image: patch.coverImage || null }
          : {}),
        ...(patch.startDate !== undefined ? { start_date: patch.startDate } : {}),
        ...(patch.endDate !== undefined ? { end_date: patch.endDate } : {}),
        ...(patch.destinationId !== undefined ? { destination_id: patch.destinationId } : {}),
        ...(patch.interests !== undefined ? { interests: patch.interests } : {}),
        ...(patch.budgetTier !== undefined ? { budget_tier: patch.budgetTier } : {}),
        ...(patch.currency !== undefined ? { currency: patch.currency.toUpperCase() } : {}),
        ...(patch.budgetAmount !== undefined ? { budget_amount: patch.budgetAmount } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.activityIds !== undefined ? { activity_ids: patch.activityIds } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("user_id", req.userId!)
      .select("*")
      .single<TripRow>();
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json(toRecord(data));
  }),
);

/** Duplicates a trip into a fresh editable copy with a real new ID. */
tripsRouter.post(
  "/:id/duplicate",
  asyncHandler(async (req: Request, res) => {
    const existing = await fetchOwnedTrip(req.userId!, req.params.id);
    const now = new Date().toISOString();
    const { data, error } = await getSupabaseAdmin()
      .from("trips")
      .insert({
        user_id: req.userId!,
        name: `${existing.name} (Copy)`,
        description: existing.description,
        cover_image: existing.cover_image,
        start_date: existing.start_date,
        end_date: existing.end_date,
        destination_id: existing.destination_id,
        interests: existing.interests ?? [],
        budget_tier: existing.budget_tier,
        currency: existing.currency,
        budget_amount: existing.budget_amount,
        status: existing.status,
        created_at: now,
        updated_at: now,
        archived_at: null,
        activity_ids: existing.activity_ids ?? [],
      })
      .select("*")
      .single<TripRow>();
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.status(201).json(toRecord(data));
  }),
);

tripsRouter.put(
  "/:id/draft",
  asyncHandler(async (req: Request, res) => {
    const draft = parseBody(tripDraftSchema, req.body);
    const admin = getSupabaseAdmin();
    const values = {
      name: draft.name,
      description: draft.description || null,
      cover_image: draft.coverImage || null,
      start_date: draft.startDate,
      end_date: draft.endDate,
      destination_id: draft.destinationId,
      interests: draft.interests,
      budget_tier: draft.budgetTier,
      currency: draft.currency.toUpperCase(),
      budget_amount: draft.budgetAmount,
      status: "draft" as const,
      ...(draft.activityIds ? { activity_ids: draft.activityIds } : {}),
    };

    if (req.params.id && UUID_RE.test(req.params.id)) {
      const existing = await fetchOwnedTrip(req.userId!, req.params.id);
      const { data, error } = await admin
        .from("trips")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .eq("user_id", req.userId!)
        .select("*")
        .single<TripRow>();
      if (error) throw new ApiError("SERVER_ERROR", error.message);
      res.json(toRecord(data));
      return;
    }

    // No usable id yet — create a fresh draft record.
    const { data, error } = await admin
      .from("trips")
      .insert({ ...values, user_id: req.userId! })
      .select("*")
      .single<TripRow>();
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.status(201).json(toRecord(data));
  }),
);

tripsRouter.put(
  "/:id",
  asyncHandler(async (req: Request, res) => {
    const draft = parseBody(tripDraftSchema, req.body);
    const existing = await fetchOwnedTrip(req.userId!, req.params.id);
    const { data, error } = await getSupabaseAdmin()
      .from("trips")
      .update({
        name: draft.name,
        description: draft.description || null,
        cover_image: draft.coverImage || null,
        start_date: draft.startDate,
        end_date: draft.endDate,
        destination_id: draft.destinationId,
        interests: draft.interests,
        budget_tier: draft.budgetTier,
        currency: draft.currency.toUpperCase(),
        budget_amount: draft.budgetAmount,
        status: draft.status ?? existing.status,
        ...(draft.activityIds ? { activity_ids: draft.activityIds } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("user_id", req.userId!)
      .select("*")
      .single<TripRow>();
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json(toRecord(data));
  }),
);

tripsRouter.delete(
  "/:id",
  asyncHandler(async (req: Request, res) => {
    const existing = await fetchOwnedTrip(req.userId!, req.params.id);
    const { error } = await getSupabaseAdmin()
      .from("trips")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", req.userId!);
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.status(204).send();
  }),
);
