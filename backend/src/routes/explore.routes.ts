import { Router } from "express";
import { z } from "zod";

import { ApiError, asyncHandler } from "../lib/api-error.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const exploreRouter = Router();

/* ── Shapes ─────────────────────────────────────────────────────── */

interface ExploreDestinationRow {
  id: string;
  city: string;
  country: string;
  region: string;
  category: string;
  rating: number | string;
  reviews: number | string;
  estimated_budget_inr: number | string;
  description: string;
  image: string;
  image_alt: string;
}

interface CatalogActivityRow {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  duration_hours: number | string;
  cost_inr: number | string;
  description: string;
  image: string;
  image_alt: string;
}

function mapDestination(row: ExploreDestinationRow) {
  return {
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
  };
}

function mapActivity(row: CatalogActivityRow) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    category: row.category,
    durationHours: Number(row.duration_hours),
    costInr: Number(row.cost_inr),
    description: row.description,
    image: row.image,
    imageAlt: row.image_alt,
  };
}

async function loadDestinations(): Promise<ExploreDestinationRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("dashboard_destinations")
    .select("*");
  if (error) throw new ApiError("SERVER_ERROR", error.message);
  return (data ?? []) as ExploreDestinationRow[];
}

async function loadActivities(): Promise<CatalogActivityRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("activities")
    .select("*");
  if (error) throw new ApiError("SERVER_ERROR", error.message);
  return (data ?? []) as CatalogActivityRow[];
}

/**
 * Bridges user interest ids onto the editorial destination `category`
 * values used by the dashboard/explore dataset. Documented heuristic —
 * revisit if the frontend ships an explicit mapping.
 */
const INTEREST_TO_CATEGORY_KEYWORDS: Record<string, string[]> = {
  adventure: ["adventure"],
  nature: ["nature"],
  food: ["food", "culinary", "dining"],
  culture: ["culture", "heritage"],
  history: ["culture", "heritage", "history"],
  beaches: ["beach", "island"],
  mountains: ["mountain"],
  nightlife: ["city", "nightlife"],
  shopping: ["city", "shopping"],
  relaxation: ["wellness", "beach", "spa"],
  "city-life": ["city"],
};

exploreRouter.use(requireAuth);

/* ── Browse ─────────────────────────────────────────────────────── */

const limitSchema = z.coerce.number().int().min(1).max(50).catch(6);

/** Highest-rated destinations ("Trending this week"). */
exploreRouter.get(
  "/destinations/trending",
  asyncHandler(async (req, res) => {
    const limit = limitSchema.parse(req.query.limit ?? 6);
    const rows = await loadDestinations();
    res.json(
      [...rows]
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .slice(0, limit)
        .map(mapDestination),
    );
  }),
);

/** Most-reviewed destinations ("Popular right now"). */
exploreRouter.get(
  "/destinations/popular",
  asyncHandler(async (req, res) => {
    const limit = limitSchema.parse(req.query.limit ?? 9);
    const rows = await loadDestinations();
    res.json(
      [...rows]
        .sort((a, b) => Number(b.reviews) - Number(a.reviews))
        .slice(0, limit)
        .map(mapDestination),
    );
  }),
);

exploreRouter.get(
  "/destinations/by-region/:regionId",
  asyncHandler(async (req, res) => {
    const rows = await loadDestinations();
    const regionId = req.params.regionId.toLowerCase();
    res.json(
      rows
        .filter((row) => row.region.toLowerCase() === regionId)
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .map(mapDestination),
    );
  }),
);

exploreRouter.get(
  "/destinations/by-category/:category",
  asyncHandler(async (req, res) => {
    const rows = await loadDestinations();
    const category = req.params.category.toLowerCase();
    res.json(
      rows
        .filter((row) => row.category.toLowerCase().includes(category))
        .sort((a, b) => Number(b.reviews) - Number(a.reviews))
        .map(mapDestination),
    );
  }),
);

/**
 * Interest-based recommendations. Scores destinations by keyword overlap
 * between the user's interests and the editorial category, breaks ties
 * by rating, and lightly boosts already-saved destinations.
 */
exploreRouter.get(
  "/recommended",
  asyncHandler(async (req, res) => {
    const limit = limitSchema.parse(req.query.limit ?? 6);
    const interests = String(req.query.interests ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    const savedIds = new Set(
      String(req.query.saved ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    );

    const rows = await loadDestinations();
    const scored = rows.map((row) => {
      const category = row.category.toLowerCase();
      let score = interests.reduce((total, interest) => {
        const keywords = INTEREST_TO_CATEGORY_KEYWORDS[interest];
        return (
          total +
          (keywords?.some((keyword) => category.includes(keyword)) ? 1 : 0)
        );
      }, 0);
      if (savedIds.has(row.id)) score += 0.5;
      return { row, score };
    });

    const matched = scored.filter((entry) => entry.score > 0);
    const result = (matched.length > 0 ? matched : scored)
      .sort(
        (a, b) =>
          b.score - a.score ||
          Number(b.row.rating) - Number(a.row.rating),
      )
      .slice(0, limit)
      .map((entry) => mapDestination(entry.row));
    res.json(result);
  }),
);

/* ── Search ─────────────────────────────────────────────────────── */

/** Mixed search across destinations and catalog activities. */
exploreRouter.get(
  "/search",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "").trim().toLowerCase();
    if (!q) {
      res.json({ destinations: [], activities: [] });
      return;
    }
    const [destinationRows, activityRows] = await Promise.all([
      loadDestinations(),
      loadActivities(),
    ]);
    res.json({
      destinations: destinationRows
        .filter(
          (row) =>
            row.city.toLowerCase().includes(q) ||
            row.country.toLowerCase().includes(q) ||
            row.description.toLowerCase().includes(q),
        )
        .sort((a, b) => Number(b.reviews) - Number(a.reviews))
        .map(mapDestination),
      activities: activityRows
        .filter(
          (row) =>
            row.name.toLowerCase().includes(q) ||
            row.city.toLowerCase().includes(q) ||
            row.country.toLowerCase().includes(q) ||
            row.description.toLowerCase().includes(q),
        )
        .sort((a, b) => Number(b.cost_inr) - Number(a.cost_inr))
        .slice(0, 12)
        .map(mapActivity),
    });
  }),
);

/** Lightweight type-ahead suggestions (cities + countries). */
exploreRouter.get(
  "/suggestions",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "").trim().toLowerCase();
    if (!q) {
      res.json([]);
      return;
    }
    const rows = await loadDestinations();
    const seen = new Set<string>();
    const suggestions: Array<{
      id: string;
      type: "destination";
      label: string;
      sublabel: string;
    }> = [];
    for (const row of rows) {
      const cityMatch = row.city.toLowerCase().includes(q);
      const countryMatch = row.country.toLowerCase().includes(q);
      if (!cityMatch && !countryMatch) continue;
      const dedupeKey = `${row.city}|${row.country}`.toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      suggestions.push({
        id: row.id,
        type: "destination",
        label: cityMatch ? row.city : row.country,
        sublabel: cityMatch ? row.country : `${row.reviews} reviews`,
      });
      if (suggestions.length >= 8) break;
    }
    res.json(suggestions);
  }),
);

/* ── Detail ─────────────────────────────────────────────────────── */

/**
 * Full detail payload for one destination: the record itself plus its
 * catalog activities and related places. Editorial extras (bestTime,
 * curated place cards) stay client-side until the frontend's
 * explore.data lands; the endpoint reserves their shape as null.
 */
exploreRouter.get(
  "/destinations/:id/detail",
  asyncHandler(async (req, res) => {
    const [rows, activities] = await Promise.all([
      loadDestinations(),
      loadActivities(),
    ]);
    const destination = rows.find((row) => row.id === req.params.id);
    if (!destination) throw new ApiError("NOT_FOUND", "Destination not found.");

    const cityLower = destination.city.toLowerCase();
    const countryLower = destination.country.toLowerCase();
    const destinationActivities = activities
      .filter(
        (row) =>
          row.city.toLowerCase() === cityLower &&
          row.country.toLowerCase() === countryLower,
      )
      .sort((a, b) => Number(b.cost_inr) - Number(a.cost_inr))
      .map(mapActivity);

    const related = rows
      .filter(
        (row) =>
          row.id !== destination.id &&
          (row.category.toLowerCase() === destination.category.toLowerCase() ||
            row.region.toLowerCase() === destination.region.toLowerCase()),
      )
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 4)
      .map(mapDestination);

    res.json({
      destination: mapDestination(destination),
      bestTime: null,
      places: [],
      activities: destinationActivities,
      related,
    });
  }),
);

/* ── Region metadata (browse filter chips) ──────────────────────── */

exploreRouter.get(
  "/regions",
  asyncHandler(async (_req, res) => {
    interface RegionRow {
      id: string;
      label: string;
      blurb: string;
    }
    const { data, error } = await getSupabaseAdmin()
      .from("regions")
      .select("*")
      .order("sort_order");
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json(
      ((data ?? []) as RegionRow[]).map((row) => ({
        id: row.id,
        label: row.label,
        blurb: row.blurb,
      })),
    );
  }),
);
