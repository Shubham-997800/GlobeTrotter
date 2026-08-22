/**
 * Seeds the Supabase catalog tables from the frontend's catalog data,
 * guaranteeing the API serves exactly what the UI expects.
 *
 * Usage:  npm run seed     (requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in backend/.env)
 */
import "dotenv/config";

import {
  activities,
  budgetTiers,
  currencies,
  demoRateFromInr,
  destinations,
  interestCatalog,
} from "../../frontend/src/features/trips/trips.data.ts";
import {
  destinations as dashboardDestinations,
  featuredSlides,
  insights,
  notifications,
  quickActions,
  recentActivity,
  regions,
} from "../../frontend/src/features/dashboard/dashboard.data.ts";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "[seed] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — add them to backend/.env first.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function upsertAll(table: string, rows: unknown[], conflictColumn = "id") {
  const { error } = await supabase.from(table).upsert(rows, {
    onConflict: conflictColumn,
    ignoreDuplicates: false,
  });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`[seed] ${table}: ${rows.length} rows`);
}

async function main() {
  await upsertAll("interests", interestCatalog.map((interest, index) => ({
    id: interest.id,
    label: interest.label,
    sort_order: index,
  })));

  await upsertAll("currencies", currencies.map((currency) => ({
    code: currency.code,
    label: currency.label,
    symbol: currency.symbol,
  })), "code");

  const splitOrder = ["stay", "transport", "activities", "food", "other"] as const;
  await upsertAll("budget_tiers", budgetTiers.map((tier, index) => ({
    id: tier.id,
    label: tier.label,
    description: tier.description,
    cost_multiplier: tier.costMultiplier,
    split: Object.fromEntries(splitOrder.map((key) => [key, tier.split[key]])),
    sort_order: index,
  })));

  await upsertAll("destinations", destinations.map((destination) => ({
    id: destination.id,
    city: destination.city,
    country: destination.country,
    description: destination.description,
    image: destination.image,
    image_alt: destination.imageAlt,
    rating: destination.rating,
    reviews: destination.reviews,
    estimated_daily_cost_inr: destination.estimatedDailyCostInr,
    tags: [...destination.tags],
  })));

  await upsertAll("activities", activities.map((activity) => ({
    id: activity.id,
    name: activity.name,
    city: activity.city,
    country: activity.country,
    category: activity.category,
    duration_hours: activity.durationHours,
    cost_inr: activity.costInr,
    description: activity.description,
    image: activity.image,
    image_alt: activity.imageAlt,
  })));

  const { error: configError } = await supabase.from("app_config").upsert({
    key: "demo_rate_from_inr",
    value: demoRateFromInr,
  }, { onConflict: "key" });
  if (configError) throw new Error(`app_config: ${configError.message}`);
  console.log("[seed] app_config: demo_rate_from_inr");

  /* ── Dashboard content (migration-v2 tables) ─────────────────── */

  await upsertAll("regions", regions.map((region, index) => ({
    id: region.id,
    label: region.label,
    blurb: region.blurb,
    sort_order: index,
  })));

  await upsertAll("featured_slides", featuredSlides.map((slide, index) => ({
    id: index + 1,
    badge: slide.badge,
    name: slide.name,
    description: slide.description,
    best_time: slide.bestTime,
    country: slide.country,
    category: slide.category,
    image: slide.image,
    image_alt: slide.imageAlt,
    sort_order: index,
  })));

  await upsertAll("dashboard_destinations", dashboardDestinations.map((destination) => ({
    id: destination.id,
    city: destination.city,
    country: destination.country,
    region: destination.region,
    category: destination.category,
    rating: destination.rating,
    reviews: destination.reviews,
    estimated_budget_inr: destination.estimatedBudgetInr,
    description: destination.description,
    image: destination.image,
    image_alt: destination.imageAlt,
  })));

  await upsertAll("insights", insights.map((insight, index) => ({
    id: insight.id,
    label: insight.label,
    value: insight.value,
    trend: insight.trend,
    trend_direction: insight.trendDirection,
    sort_order: index,
  })));

  await upsertAll("quick_actions", quickActions.map((action, index) => ({
    id: action.id,
    title: action.title,
    description: action.description,
    href: action.href,
    emphasized: action.emphasized ?? false,
    sort_order: index,
  })));

  for (const [key, value] of [
    ["dashboard_notifications", notifications],
    ["dashboard_recent_activity", recentActivity],
  ] as const) {
    const { error } = await supabase.from("app_config").upsert(
      { key, value },
      { onConflict: "key" },
    );
    if (error) throw new Error(`app_config:${key}: ${error.message}`);
    console.log(`[seed] app_config: ${key}`);
  }

  console.log("[seed] Done ✔");
}

main().catch((error) => {
  console.error("[seed] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
