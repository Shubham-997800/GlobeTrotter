/**
 * Pure derivations for the Trip Details hub. Everything here is computed
 * from real persisted data (TripRecord + ItineraryRecord) — no invented
 * numbers, so the mock service can be swapped for a live API untouched.
 */

import type {
  ItineraryActivity,
  ItineraryDay,
  ItineraryRecord,
} from "./itinerary.types";
import {
  itineraryProgress,
  itineraryTotals as baseItineraryTotals,
  sortDayActivities,
  type ItineraryTotals,
} from "./itinerary.utils";
import type { TripRecord } from "./trips.types";

export { baseItineraryTotals as itineraryTotals };

export interface TripStatsModel extends ItineraryTotals {
  totalDays: number;
  plannedDays: number;
  planningPercent: number;
}

export function buildTripStats(
  trip: TripRecord,
  itinerary: Pick<ItineraryRecord, "days" | "activities"> | null | undefined,
): TripStatsModel {
  const days = itinerary?.days ?? [];
  const activities = itinerary?.activities ?? [];
  const progress = itineraryProgress({ days, activities }, trip);
  const totals = baseItineraryTotals({
    tripId: trip.id,
    stops: [],
    days,
    activities,
    updatedAt: "",
  });
  return {
    ...totals,
    totalDays: progress.totalDays,
    plannedDays: progress.plannedDays,
    planningPercent: progress.percent,
  };
}

export interface NextActivityResult {
  activity: ItineraryActivity;
  day: ItineraryDay;
}

export function findNextActivity(
  itinerary: Pick<ItineraryRecord, "days" | "activities"> | null | undefined,
  now: Date = new Date(),
): NextActivityResult | null {
  if (!itinerary) return null;
  const todayKey = now.toISOString().slice(0, 10);
  const minutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();

  const upcomingDays = [...itinerary.days]
    .filter((day) => day.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const day of upcomingDays) {
    const sorted = sortDayActivities(itinerary.activities, day.id);
    const candidates =
      day.date === todayKey
        ? sorted.filter((activity) => {
            const [endH, endM] = activity.endTime.split(":").map(Number);
            if (!Number.isFinite(endH)) return true;
            return endH * 60 + (Number.isFinite(endM) ? endM : 0) > minutesNow;
          })
        : sorted;
    if (candidates.length > 0) {
      return { activity: candidates[0], day };
    }
  }
  return null;
}

const CATEGORY_LABELS: Record<string, string> = {
  attractions: "Attractions",
  food: "Food & Dining",
  adventure: "Adventure",
  nature: "Nature",
  culture: "Culture",
  shopping: "Shopping",
  nightlife: "Nightlife",
  transport: "Transport",
  stay: "Stay",
  custom: "Custom",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export interface CategoryTotal {
  category: string;
  label: string;
  count: number;
  costInr: number;
}

export function categoryTotals(
  activities: ItineraryActivity[],
): CategoryTotal[] {
  const byCategory = new Map<string, CategoryTotal>();
  for (const activity of activities) {
    const existing = byCategory.get(activity.category) ?? {
      category: activity.category,
      label: categoryLabel(activity.category),
      count: 0,
      costInr: 0,
    };
    existing.count += 1;
    existing.costInr += activity.estimatedCostInr;
    byCategory.set(activity.category, existing);
  }
  return [...byCategory.values()].sort((a, b) => b.costInr - a.costInr);
}

export interface DayPreview {
  day: ItineraryDay;
  activityCount: number;
  costInr: number;
}

export function previewDays(
  itinerary: Pick<ItineraryRecord, "days" | "activities"> | null | undefined,
  limit = 3,
): DayPreview[] {
  if (!itinerary) return [];
  return [...itinerary.days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
    .map((day) => {
      const dayActivities = itinerary.activities.filter(
        (activity) => activity.dayId === day.id,
      );
      return {
        day,
        activityCount: dayActivities.length,
        costInr: dayActivities.reduce(
          (sum, activity) => sum + activity.estimatedCostInr,
          0,
        ),
      };
    });
}