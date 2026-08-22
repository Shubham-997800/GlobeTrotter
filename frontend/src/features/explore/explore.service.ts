import {
  exploreDestinations,
  exploreActivities,
  placeCards,
  getTrendingDestinations,
  getPopularDestinations,
  getDestinationsByRegion,
  getDestinationsByCategory,
  getRecommendedDestinations,
  searchExplore,
  getDestinationDetail,
  readSavedDestinationIds,
  toggleSavedDestination,
  readRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  regions,
  budgetFilters,
  durationFilters,
  sortOptions,
  categoryFilters,
} from "./explore.data";
import type {
  ExploreDestination,
  SearchResults,
  DestinationDetailData,
  ExploreFilters,
  RecentSearch,
  TripSelectorOption,
  TripDayOption,
  AddToTripPayload,
  SearchSuggestion,
} from "./explore.types";
import { tripsService } from "@/features/trips/trips.service";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Explore service — client-side catalog operations standing in for API endpoints.
 * All functions are async to mirror real API shape.
 */
export const exploreService = {
  /* ── Catalog queries ─────────────────────────────────────────── */

  /** Get all explore destinations */
  async getAllDestinations(): Promise<ExploreDestination[]> {
    await delay(100);
    return exploreDestinations;
  },

  /** Get trending destinations */
  async getTrendingDestinations(limit = 6): Promise<{ destinations: ExploreDestination[]; lastUpdated: string }> {
    await delay(200);
    return {
      destinations: getTrendingDestinations(limit),
      lastUpdated: new Date().toISOString(),
    };
  },

  /** Get popular destinations */
  async getPopularDestinations(limit = 9): Promise<ExploreDestination[]> {
    await delay(200);
    return getPopularDestinations(limit);
  },

  /** Get destinations by region */
  async getDestinationsByRegion(regionId: string): Promise<ExploreDestination[]> {
    await delay(200);
    return getDestinationsByRegion(regionId);
  },

  /** Get destinations by category */
  async getDestinationsByCategory(category: string): Promise<ExploreDestination[]> {
    await delay(200);
    return getDestinationsByCategory(category);
  },

  /** Get recommended destinations based on user interests */
  async getRecommendedDestinations(
    interests: string[],
    savedIds: string[],
    limit = 6
  ): Promise<{ destinations: ExploreDestination[]; basedOn: "interests" | "saved" | "popular" }> {
    await delay(300);
    return {
      destinations: getRecommendedDestinations(interests, savedIds, limit),
      basedOn: interests.length > 0 ? "interests" : savedIds.length > 0 ? "saved" : "popular",
    };
  },

  /** Search across destinations, activities, and places */
  async search(query: string): Promise<SearchResults> {
    return searchExplore(query);
  },

  /** Get destination detail with places and activities */
  async getDestinationDetail(destinationId: string): Promise<DestinationDetailData | null> {
    await delay(200);
    return getDestinationDetail(destinationId);
  },

  /* ── Filter metadata ─────────────────────────────────────────── */

  /** Get all regions with counts */
  async getRegions() {
    await delay(50);
    return regions;
  },

  /** Get budget filter options */
  async getBudgetFilters() {
    await delay(50);
    return budgetFilters;
  },

  /** Get duration filter options */
  async getDurationFilters() {
    await delay(50);
    return durationFilters;
  },

  /** Get sort options */
  async getSortOptions() {
    await delay(50);
    return sortOptions;
  },

  /** Get category filters */
  async getCategoryFilters() {
    await delay(50);
    return categoryFilters;
  },

  /* ── Search suggestions ──────────────────────────────────────── */

  /** Get search suggestions for autocomplete */
  async getSearchSuggestions(query: string): Promise<{
    destinations: SearchSuggestion[];
    activities: SearchSuggestion[];
    places: SearchSuggestion[];
  }> {
    await delay(SEARCH_DEBOUNCE_MS);
    const q = query.trim().toLowerCase();
    if (!q) {
      return { destinations: [], activities: [], places: [] };
    }

    const destMatches = exploreDestinations
      .filter(
        (d) =>
          d.city.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.tags.some((tag) => tag.includes(q))
      )
      .slice(0, 5)
      .map((d): SearchSuggestion => ({
        id: d.id,
        type: "destination",
        label: d.city,
        sublabel: d.country,
        image: d.image,
        entityId: d.id,
        href: `/explore/destinations/${d.id}`,
        group: "destinations",
      }));

    const actMatches = exploreActivities
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.category.includes(q)
      )
      .slice(0, 3)
      .map((a): SearchSuggestion => ({
        id: a.id,
        type: "activity",
        label: a.name,
        sublabel: `${a.city}, ${a.country}`,
        image: a.image,
        entityId: a.id,
        href: `/explore/destinations/${a.city.toLowerCase()}?activity=${a.id}`,
        group: "activities",
      }));

    const placeMatches = placeCards
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((p): SearchSuggestion => ({
        id: p.id,
        type: "place",
        label: p.name,
        sublabel: p.category,
        image: p.image,
        entityId: p.id,
        href: `/explore/destinations/${p.destinationId}?place=${p.id}`,
        group: "places",
      }));

    return {
      destinations: destMatches,
      activities: actMatches,
      places: placeMatches,
    };
  },

  /* ── Saved destinations (shared with dashboard) ──────────────── */

  /** Read saved destination IDs */
  async readSavedDestinations(): Promise<string[]> {
    return readSavedDestinationIds();
  },

  /** Toggle saved destination */
  async toggleSavedDestination(destinationId: string): Promise<string[]> {
    return toggleSavedDestination(destinationId);
  },

  /* ── Recent searches ─────────────────────────────────────────── */

  /** Read recent searches */
  async readRecentSearches(): Promise<RecentSearch[]> {
    return readRecentSearches();
  },

  /** Add recent search */
  async addRecentSearch(query: string): Promise<void> {
    addRecentSearch(query);
  },

  /** Remove recent search */
  async removeRecentSearch(query: string): Promise<void> {
    removeRecentSearch(query);
  },

  /** Clear all recent searches */
  async clearRecentSearches(): Promise<void> {
    clearRecentSearches();
  },

  /* ── Trip integration for "Add to Trip" ──────────────────────── */

  /** Get user's trips for trip selector */
  async getTripsForSelector(): Promise<TripSelectorOption[]> {
    await delay(200);
    const records = await tripsService.listTrips();
    return records
      .filter((r) => !r.archivedAt)
      .map((r) => {
        const days: TripDayOption[] = [];
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);

        for (let i = 1; i <= totalDays; i++) {
          const dayDate = new Date(start);
          dayDate.setDate(start.getDate() + i - 1);
          days.push({
            id: `day-${r.id}-${i}`,
            label: `Day ${i}`,
            date: dayDate.toISOString().split("T")[0],
            activitiesCount: 0,
          });
        }

        return {
          id: r.id,
          name: r.name,
          startDate: r.startDate,
          endDate: r.endDate,
          destination: r.destinationId,
          coverImage: r.coverImage,
          days,
          hasItinerary: days.length > 0,
        };
      });
  },

  /** Add destination/activity to trip */
  async addToTrip(payload: AddToTripPayload): Promise<{ success: boolean; tripId: string }> {
    await delay(500);
    return { success: true, tripId: payload.tripId };
  },
};

/**
 * Helper to apply multiple filters to destination list
 */
export function applyExploreFilters(
  destinations: ExploreDestination[],
  filters: ExploreFilters
): ExploreDestination[] {
  return destinations.filter((d) => {
    if (filters.category !== "all" && !d.tags.includes(filters.category)) {
      return false;
    }
    if (filters.region !== "all" && d.region !== filters.region) {
      return false;
    }
    if (filters.budget !== "all") {
      const tier = budgetFilters.find((b) => b.id === filters.budget);
      if (tier) {
        if (tier.id === "budget" && d.estimatedDailyCostInr > 8000) return false;
        if (tier.id === "moderate" && (d.estimatedDailyCostInr < 5000 || d.estimatedDailyCostInr > 12000)) return false;
        if (tier.id === "premium" && d.estimatedDailyCostInr < 10000) return false;
      }
    }
    if (filters.duration !== "all") {
      const durationDays = parseInt(d.recommendedDuration.split("–")[0]);
      if (filters.duration === "weekend" && durationDays > 3) return false;
      if (filters.duration === "3-5" && (durationDays < 3 || durationDays > 5)) return false;
      if (filters.duration === "week" && (durationDays < 6 || durationDays > 8)) return false;
      if (filters.duration === "2weeks" && durationDays < 10) return false;
    }
    return true;
  });
}

/**
 * Sort destinations
 */
export function sortExploreDestinations(
  destinations: ExploreDestination[],
  sort: string
): ExploreDestination[] {
  const sorted = [...destinations];
  switch (sort) {
    case "popular":
      return sorted.sort((a, b) => b.reviews - a.reviews);
    case "trending":
      return sorted.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0));
    case "recommended":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "alphabetical":
      return sorted.sort((a, b) => a.city.localeCompare(b.city));
    default:
      return sorted;
  }
}

/**
 * Mock delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}