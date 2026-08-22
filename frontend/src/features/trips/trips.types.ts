/**
 * Trips domain types — kept separate from UI so a real API can replace
 * `trips.data.ts` / `trips.service.ts` without touching any component.
 */

/** Interest ids map 1:1 to the interest catalog in `trips.data.ts`. */
export type InterestId =
  | "adventure"
  | "nature"
  | "food"
  | "culture"
  | "history"
  | "beaches"
  | "mountains"
  | "nightlife"
  | "shopping"
  | "relaxation";

export interface InterestDef {
  id: InterestId;
  label: string;
}

export type BudgetTier = "budget" | "moderate" | "premium" | "custom";

export interface Currency {
  code: string;
  label: string;
  symbol: string;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  description: string;
  image: string;
  imageAlt: string;
  rating: number;
  reviews: number;
  /** Typical per-traveler daily spend in INR — the catalog base currency. */
  estimatedDailyCostInr: number;
  /** Interest ids used for "Based on Interests" recommendations. */
  tags: InterestId[];
}

export type ActivityCategoryId =
  | "popular"
  | "adventure"
  | "culture"
  | "food"
  | "nature";

export interface ActivitySuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  category: Exclude<ActivityCategoryId, "popular">;
  durationHours: number;
  costInr: number;
  description: string;
  image: string;
  imageAlt: string;
}

/** Percentage split of a trip budget across expense categories. */
export type BudgetSplit = Record<
  "stay" | "transport" | "activities" | "food" | "other",
  number
>;

export interface BudgetTierDef {
  id: BudgetTier;
  label: string;
  description: string;
  /** Multiplier applied to destination daily estimates; null → neutral. */
  costMultiplier: number | null;
  split: BudgetSplit;
}

/** Form-level draft shape (all values as stored by React Hook Form). */
export interface TripDraftValues {
  name: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  destinationId: string;
  interests: InterestId[];
  budgetTier: BudgetTier;
  currency: string;
  budgetAmount: string;
}

/** Server-shaped record returned by create/draft mutations. */
export interface TripRecord {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  destinationId: string;
  interests: InterestId[];
  budgetTier: BudgetTier;
  currency: string;
  budgetAmount: number;
  status: "draft" | "planned";
  createdAt: string;
  /** ISO timestamp of the last mutation — drives "Last Updated" labels. */
  updatedAt?: string;
  /** Set when the trip is archived; archived trips leave default views. */
  archivedAt?: string | null;
  /** Catalog activity ids attached during planning (real stored data). */
  activityIds?: string[];
}

/* ── My Trips module contracts ────────────────────────────────── */

/**
 * Lifecycle status. `draft` comes from the backend record; the rest are
 * derived centrally from travel dates (see `my-trips.logic.ts`).
 */
export type MyTripStatus = "draft" | "upcoming" | "ongoing" | "completed";

/** Tab / filter values for My Trips, including backend-owned states. */
export type MyTripsStatusFilter =
  | "all"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "draft"
  | "archived";

export type MyTripsSortId = "recent" | "upcoming" | "updated" | "alpha";

export type MyTripsDateFilterId = "all" | "upcoming" | "month" | "year" | "custom";

export interface MyTripsDateRange {
  from: string;
  to: string;
}

export interface MyTripsFilters {
  search: string;
  status: MyTripsStatusFilter;
  country: string;
  dateFilter: MyTripsDateFilterId;
  customRange?: MyTripsDateRange | undefined;
  sort: MyTripsSortId;
}

export type MyTripsViewMode = "grid" | "list";
