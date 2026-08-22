/**
 * Itinerary domain types — server-shaped records for the day-wise
 * itinerary builder. Kept separate from UI so the mock service can be
 * swapped for a real API without touching components.
 */

import type { ActivityCategoryId } from "./trips.types";

/** Filterable activity categories inside the itinerary builder. */
export type ActivityFilterId =
  | "all"
  | "attractions"
  | "food"
  | "adventure"
  | "nature"
  | "culture"
  | "shopping"
  | "nightlife";

export interface ActivityFilterDef {
  id: ActivityFilterId;
  label: string;
}

/** A city stop in a multi-city trip. Order defines travel sequence. */
export interface ItineraryStop {
  id: string;
  /** Actual destination catalog identifier — never just a display name. */
  destinationId: string;
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  order: number;
}

/** One calendar day of the trip (authoritative range = trip dates). */
export interface ItineraryDay {
  id: string;
  date: string; // YYYY-MM-DD
  /** City assigned to this day — actual destination id or null. */
  destinationId: string | null;
  notes: string;
}

/** An activity scheduled on a day. Costs are stored in INR catalog base. */
export interface ItineraryActivity {
  id: string;
  dayId: string;
  /** Set when added from the activity catalog, absent for custom items. */
  catalogActivityId?: string;
  name: string;
  description: string;
  category: Exclude<ActivityCategoryId, "popular"> | "custom";
  location: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  estimatedCostInr: number;
  image?: string;
  imageAlt?: string;
  order: number;
}

/** Full itinerary document persisted per trip. */
export interface ItineraryRecord {
  tripId: string;
  stops: ItineraryStop[];
  days: ItineraryDay[];
  activities: ItineraryActivity[];
  updatedAt: string;
}

/** Payload used by add/edit activity forms and mutations. */
export interface ActivityInput {
  dayId: string;
  name: string;
  description: string;
  category: ItineraryActivity["category"];
  location: string;
  startTime: string;
  endTime: string;
  estimatedCostInr: number;
  image?: string;
  imageAlt?: string;
  catalogActivityId?: string;
}

/** Payload for creating/updating a city stop. */
export interface StopInput {
  destinationId: string;
  arrivalDate: string;
  departureDate: string;
}

export type ViewMode = "timeline" | "day" | "map";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

/* ── Validation ──────────────────────────────────────────────── */

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  /** Human-readable message identifying the affected item. */
  message: string;
  dayId?: string;
  activityId?: string;
  stopId?: string;
}

export const ACTIVITY_FILTERS: ActivityFilterDef[] = [
  { id: "all", label: "All" },
  { id: "attractions", label: "Attractions" },
  { id: "food", label: "Food & Dining" },
  { id: "adventure", label: "Adventure" },
  { id: "nature", label: "Nature" },
  { id: "culture", label: "Culture" },
  { id: "shopping", label: "Shopping" },
  { id: "nightlife", label: "Nightlife" },
];
