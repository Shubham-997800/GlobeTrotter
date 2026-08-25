import { Router } from "express";
import { z } from "zod";

import { ApiError, asyncHandler } from "../lib/api-error.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { assertSupabaseConfigured } from "../config/env.js";

export const catalogRouter = Router();

/* ── Row shapes (snake_case in DB) ──────────────────────────────── */

interface DestinationRow {
  id: string;
  city: string;
  country: string;
  description: string;
  image: string;
  image_alt: string;
  rating: number;
  reviews: number;
  estimated_daily_cost_inr?: number;
  estimated_budget_inr?: number;
  tags: string[] | null;
}

interface ActivityRow {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  duration_hours: number;
  cost_inr: number;
  description: string;
  image: string;
  image_alt: string;
}

interface BudgetTierRow {
  id: string;
  label: string;
  description: string;
  cost_multiplier: number | null;
  split: Record<string, number>;
}

function mapDestination(row: DestinationRow) {
  return {
    id: row.id,
    city: row.city,
    country: row.country,
    description: row.description,
    image: row.image,
    imageAlt: row.image_alt,
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    estimatedDailyCostInr: Number(row.estimated_daily_cost_inr ?? row.estimated_budget_inr ?? 0),
    tags: (row.tags ?? []) as string[],
  };
}

function mapActivity(row: ActivityRow) {
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

async function listDestinations(): Promise<DestinationRow[]> {
  const admin = getSupabaseAdmin();
  // Primary source: dashboard_destinations (editorial/curated data).
  const { data: dashData, error: dashError } = await admin
    .from("dashboard_destinations")
    .select("*");
  if (dashError) throw new ApiError("SERVER_ERROR", dashError.message);
  if (dashData && dashData.length > 0) return dashData as DestinationRow[];
  // Fallback to raw catalog table.
  const { data, error } = await admin.from("destinations").select("*");
  if (error) throw new ApiError("SERVER_ERROR", error.message);
  return (data ?? []) as DestinationRow[];
}

/* ── Routes (public — catalog is read-only shared data) ─────────── */

catalogRouter.get(
  "/destinations",
  asyncHandler(async (req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const rows = await listDestinations();
    const q = String(req.query.q ?? "").trim().toLowerCase();
    if (!q) {
      // Match the mock contract: empty query returns [].
      res.json([]);
      return;
    }
    res.json(
      rows
        .filter(
          (row) =>
            row.city.toLowerCase().includes(q) ||
            row.country.toLowerCase().includes(q),
        )
        .map(mapDestination),
    );
  }),
);

catalogRouter.get(
  "/destinations/recommended",
  asyncHandler(async (req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const filter = z
      .enum(["interests", "budget", "popular"])
      .catch("popular")
      .parse(req.query.filter);
    const interests = String(req.query.interests ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const rows = await listDestinations();
    let result = rows;
    switch (filter) {
      case "budget":
        result = [...rows].sort(
          (a, b) => (a.estimated_daily_cost_inr ?? a.estimated_budget_inr ?? 0) - (b.estimated_daily_cost_inr ?? b.estimated_budget_inr ?? 0),
        );
        break;
      case "popular":
        result = [...rows].sort((a, b) => b.reviews - a.reviews);
        break;
      case "interests": {
        if (interests.length === 0) {
          result = [...rows].sort((a, b) => b.rating - a.rating);
        } else {
          result = rows
            .map((row) => ({
              row,
              score: (row.tags ?? []).filter((tag) => interests.includes(tag)).length,
            }))
            .filter((entry) => entry.score > 0)
            .sort(
              (a, b) =>
                b.score - a.score || b.row.rating - a.row.rating,
            )
            .map((entry) => entry.row);
        }
        break;
      }
    }
    res.json(result.slice(0, 6).map(mapDestination));
  }),
);

catalogRouter.get(
  "/activities/search",
  asyncHandler(async (req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const q = String(req.query.q ?? "").trim().toLowerCase();
    const category = z
      .enum(["all", "adventure", "culture", "food", "nature"])
      .catch("all")
      .parse(req.query.category ?? "all");

    const { data, error } = await getSupabaseAdmin()
      .from("activities")
      .select("*");
    if (error) throw new ApiError("SERVER_ERROR", error.message);

    res.json(
      (data ?? [])
        .filter((row) => category === "all" || row.category === category)
        .filter(
          (row) =>
            !q ||
            row.name.toLowerCase().includes(q) ||
            row.city.toLowerCase().includes(q) ||
            row.country.toLowerCase().includes(q) ||
            row.description.toLowerCase().includes(q),
        )
        .map(mapActivity),
    );
  }),
);

catalogRouter.get(
  "/activities",
  asyncHandler(async (req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const category = String(req.query.category ?? "popular").trim();

    const { data, error } = await getSupabaseAdmin()
      .from("activities")
      .select("*");
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    const rows = data ?? [];

    if (category === "popular") {
      res.json(
        [...rows]
          .sort((a, b) => b.cost_inr - a.cost_inr)
          .slice(0, 6)
          .map(mapActivity),
      );
      return;
    }

    const matching = rows.filter((row) => row.category === category);
    res.json(
      (matching.length > 0 ? matching : rows.slice(0, 4)).map(mapActivity),
    );
  }),
);

catalogRouter.get(
  "/meta",
  asyncHandler(async (_req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const admin = getSupabaseAdmin();

    const [tiersResult, interestsResult, currenciesResult, ratesResult] =
      await Promise.all([
        admin.from("budget_tiers").select("*").order("sort_order"),
        admin.from("interests").select("*").order("sort_order"),
        admin.from("currencies").select("*").order("code"),
        admin.from("app_config").select("*").eq("key", "demo_rate_from_inr").maybeSingle(),
      ]);

    for (const result of [tiersResult, interestsResult, currenciesResult]) {
      if (result.error) throw new ApiError("SERVER_ERROR", result.error.message);
    }

    res.json({
      budgetTiers: (tiersResult.data ?? []).map((row: BudgetTierRow & { split: Record<string, number> }) => ({
        id: row.id,
        label: row.label,
        description: row.description,
        costMultiplier: row.cost_multiplier === null ? null : Number(row.cost_multiplier),
        split: row.split,
      })),
      interests: (interestsResult.data ?? []).map((row: { id: string; label: string }) => ({
        id: row.id,
        label: row.label,
      })),
      currencies: (currenciesResult.data ?? []).map(
        (row: { code: string; label: string; symbol: string }) => ({
          code: row.code,
          label: row.label,
          symbol: row.symbol,
        }),
      ),
      demoRateFromInr:
        (ratesResult.data?.value as Record<string, number> | undefined) ?? {},
    });
  }),
);
