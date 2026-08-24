import type { Destination as TripsDestination, ActivitySuggestion } from "@/features/trips/trips.types";

/**
 * Explore module types — aligned with existing trips catalog types
 * but extended for discovery UI needs.
 */

export type RegionId =
  | "asia"
  | "europe"
  | "north-america"
  | "south-america"
  | "africa"
  | "oceania";

export type BudgetTierFilter = "budget" | "moderate" | "premium";
export type DurationFilter = "weekend" | "3-5" | "week" | "2weeks";
export type SortOption = "popular" | "trending" | "recommended" | "alphabetical";
export type CategoryFilter =
  | "all"
  | "adventure"
  | "nature"
  | "beaches"
  | "mountains"
  | "culture"
  | "food"
  | "history"
  | "city-life"
  | "nightlife"
  | "relaxation";

export interface ExploreFilters {
  category: CategoryFilter;
  region: RegionId | "all";
  budget: BudgetTierFilter | "all";
  duration: DurationFilter | "all";
  sort: SortOption;
  query?: string;
}

export interface SearchSuggestion {
  id: string;
  type: "destination" | "activity" | "place";
  label: string;
  sublabel?: string;
  image?: string;
  entityId: string;
  href: string;
  group?: "destinations" | "activities" | "places";
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

export interface ExploreDestination extends TripsDestination {
  region: RegionId;
  bestTimeToVisit: string;
  recommendedDuration: string;
  trendingScore?: number;
  matchReasons?: string[];
}

export interface ExploreActivity extends ActivitySuggestion {
  location: string;
  rating?: number;
}

export interface PlaceCard {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  destinationId: string;
}

export interface DestinationDetailData {
  destination: ExploreDestination;
  topPlaces: PlaceCard[];
  popularActivities: ExploreActivity[];
  saved: boolean;
}

export interface SearchResults {
  destinations: ExploreDestination[];
  activities: ExploreActivity[];
  places: PlaceCard[];
  totalCount: number;
}

export interface TrendingDestinationsResponse {
  destinations: ExploreDestination[];
  lastUpdated: string;
}

export interface RecommendedDestinationsResponse {
  destinations: ExploreDestination[];
  basedOn: "interests" | "saved" | "trips" | "popular";
}

export interface AddToTripPayload {
  destinationId: string;
  tripId: string;
  dayId: string;
  activityId?: string;
}

export interface TripDayOption {
  id: string;
  label: string;
  date: string;
  activitiesCount: number;
}

export interface TripSelectorOption {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destination: string;
  coverImage?: string;
  days: TripDayOption[];
  hasItinerary: boolean;
}