import { Router } from "express";
import { z } from "zod";

import { ApiError, asyncHandler } from "../lib/api-error.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { toRecord, type TripRow } from "./trips.routes.js";

export const dashboardRouter = Router();

/* ── Shapes ─────────────────────────────────────────────────────── */

interface CatalogDestination {
  id: string;
  city: string;
  country: string;
  image: string;
  image_alt: string | null;
}

interface DashboardDestinationRow {
  id: string;
  city: string;
  country: string;
  region: string;
  category: string;
  rating: number;
  reviews: number;
  estimated_budget_inr: number;
  description: string;
  image: string;
  image_alt: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800";

/** Derives the dashboard `Trip` shape from a real trip record (mock parity). */
function recordToDashboardTrip(record: ReturnType<typeof toRecord>, catalog: CatalogDestination[]) {
  const start = new Date(`${record.startDate}T00:00:00Z`).getTime();
  const end = new Date(`${record.endDate}T00:00:00Z`).getTime();
  const hasDates = !Number.isNaN(start) && !Number.isNaN(end);
  const nowTime = Date.now();

  let status: "upcoming" | "ongoing" | "completed" = "upcoming";
  if (hasDates) {
    if (nowTime < start) status = "upcoming";
    else if (nowTime > end) status = "completed";
    else status = "ongoing";
  }

  const totalDays = hasDates
    ? Math.max(1, Math.round((end - start) / 86_400_000) + 1)
    : 1;

  let progress = record.status === "draft" ? 0 : 15;
  let currentDay: { day: number; of: number } | undefined;
  if (status === "ongoing" && hasDates) {
    const day = Math.min(totalDays, Math.max(1, Math.floor((nowTime - start) / 86_400_000) + 1));
    currentDay = { day, of: totalDays };
    progress = Math.round(((day - 1) / totalDays) * 100);
  } else if (status === "completed") {
    progress = 100;
  }

  const suggested = catalog.find(
    (entry) => entry.city.toLowerCase() === record.destinationId.trim().toLowerCase(),
  );

  return {
    id: record.id,
    name: record.name || "Untitled Trip",
    destinations: [suggested?.city ?? record.destinationId],
    country: suggested?.country ?? "",
    status,
    startDate: record.startDate,
    endDate: record.endDate,
    progress,
    currentDay,
    budget: { spentInr: 0, totalInr: record.budgetAmount },
    image: record.coverImage || suggested?.image || FALLBACK_IMAGE,
    imageAlt: suggested?.image_alt ?? `${record.name || "Trip"} cover photograph`,
  };
}

async function loadCatalog(): Promise<CatalogDestination[]> {
  const admin = getSupabaseAdmin();
  // Try dashboard_destinations first (curated data).
  const { data: dashData, error: dashError } = await admin
    .from("dashboard_destinations")
    .select("id, city, country, image, image_alt");
  if (dashError) throw new ApiError("SERVER_ERROR", dashError.message);
  if (dashData && dashData.length > 0) return dashData as CatalogDestination[];
  // Fallback to raw catalog table.
  const { data, error } = await admin
    .from("destinations")
    .select("id, city, country, image, image_alt");
  if (error) throw new ApiError("SERVER_ERROR", error.message);
  return data ?? [];
}

async function loadContent<T>(table: string): Promise<T[]> {
  const { data, error } = await getSupabaseAdmin().from(table).select("*");
  if (error) throw new ApiError("SERVER_ERROR", error.message);
  return (data ?? []) as T[];
}

/* ── Snapshot ───────────────────────────────────────────────────── */

dashboardRouter.get(
  "/dashboard",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const admin = getSupabaseAdmin();

    const [tripsResult, catalog, dashDestinations, slides, regions, insights, quickActions] =
      await Promise.all([
        admin.from("trips").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        loadCatalog(),
        loadContent<DashboardDestinationRow>("dashboard_destinations"),
        loadContent<Record<string, unknown>>("featured_slides"),
        loadContent<Record<string, unknown>>("regions"),
        loadContent<Record<string, unknown>>("insights"),
        loadContent<Record<string, unknown>>("quick_actions"),
      ]);
    if (tripsResult.error) throw new ApiError("SERVER_ERROR", tripsResult.error.message);

    const myTrips = (tripsResult.data ?? [])
      .map((row) => recordToDashboardTrip(toRecord(row as TripRow), catalog));

    // Static editorial content lives in app_config JSON blobs.
    const config = await admin
      .from("app_config")
      .select("key, value")
      .in("key", ["dashboard_notifications", "dashboard_recent_activity"]);
    const configMap = new Map((config.data ?? []).map((row) => [row.key as string, row.value]));

    res.json({
      featuredSlides: slides,
      destinations: dashDestinations.map((row) => ({
        id: row.id,
        city: row.city,
        country: row.country,
        region: row.region,
        category: row.category,
        rating: Number(row.rating),
        reviews: Number(row.reviews),
        estimatedBudgetInr: Number(row.estimated_budget_inr),
        description: row.description,
        image: row.image,
        imageAlt: row.image_alt,
      })),
      regions,
      myTrips,
      recentActivity: configMap.get("dashboard_recent_activity") ?? [],
      notifications: configMap.get("dashboard_notifications") ?? [],
      insights,
      quickActions,
    });
  }),
);

/* ── Per-user bookmarks ─────────────────────────────────────────── */

const toggleSchema = z.object({
  id: z.string().trim().min(1).max(160),
});

interface BookmarkProfile {
  id: string;
  saved_destination_ids?: string[] | null;
  saved_activity_ids?: string[] | null;
}

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id];
}

async function toggleBookmark(
  userId: string,
  column: "saved_destination_ids" | "saved_activity_ids",
  id: string,
): Promise<string[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .select(`id, ${column}`)
    .eq("id", userId)
    .maybeSingle<BookmarkProfile>();
  if (error) throw new ApiError("SERVER_ERROR", error.message);

  const next = toggleInList(data?.[column] ?? [], id);
  const { error: updateError } = await admin
    .from("profiles")
    .upsert({ id: userId, [column]: next }, { onConflict: "id" });
  if (updateError) throw new ApiError("SERVER_ERROR", updateError.message);
  return next;
}

dashboardRouter.get(
  "/users/me/bookmarks",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .select("saved_destination_ids, saved_activity_ids")
      .eq("id", req.userId!)
      .maybeSingle<BookmarkProfile>();
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json({
      savedDestinations: data?.saved_destination_ids ?? [],
      savedActivities: data?.saved_activity_ids ?? [],
    });
  }),
);

dashboardRouter.post(
  "/users/me/saved-destinations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = parseToggle(toggleSchema, req.body);
    const savedDestinations = await toggleBookmark(req.userId!, "saved_destination_ids", id);
    res.json({ savedDestinations });
  }),
);

dashboardRouter.post(
  "/users/me/saved-activities",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = parseToggle(toggleSchema, req.body);
    const savedActivities = await toggleBookmark(req.userId!, "saved_activity_ids", id);
    res.json({ savedActivities });
  }),
);

function parseToggle<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError("INVALID_REQUEST", "body.id is required.");
  }
  return result.data;
}
