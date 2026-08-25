import { apiClient } from "@/services/api/client";
import { tripsService } from "@/features/trips/trips.service";
import type {
  ExploreDestination,
  SearchResults,
  DestinationDetailData,
  RecentSearch,
  TripSelectorOption,
  TripDayOption,
  AddToTripPayload,
  SearchSuggestion,
} from "./explore.types";

/**
 * Real explore service — backend-backed via /api/explore and /api/catalog.
 * Filter metadata (budget/duration/sort/category) stays static since it's
 * a fixed reference list.
 */

const RECENT_SEARCHES_KEY = "globetrotter.explore.recent-searches";
const RECENT_SEARCHES_MAX = 8;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

/** Map a backend destination to ExploreDestination with optional extended fields. */
function toExploreDestination(row: Record<string, unknown>): ExploreDestination {
  return {
    id: String(row.id ?? ""),
    city: String(row.city ?? ""),
    country: String(row.country ?? ""),
    description: String(row.description ?? ""),
    image: String(row.image ?? ""),
    imageAlt: String(row.imageAlt ?? ""),
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    estimatedDailyCostInr: Number(row.estimatedDailyCostInr ?? row.estimated_budget_inr ?? 0),
    tags: Array.isArray(row.tags) ? row.tags as string[] : [],
    region: (String(row.region ?? "asia")) as ExploreDestination["region"],
    bestTimeToVisit: String(row.bestTime ?? row.best_time ?? ""),
    recommendedDuration: String(row.recommendedDuration ?? row.recommended_duration ?? "3–5 days"),
    trendingScore: typeof row.trendingScore === "number" ? row.trendingScore : undefined,
  };
}

export const exploreService = {
  /* ── Catalog queries ─────────────────────────────────────────── */

  async getAllDestinations(): Promise<ExploreDestination[]> {
    const { data } = await apiClient.get("/explore/destinations/trending", { params: { limit: 50 } });
    return (Array.isArray(data) ? data : []).map(toExploreDestination);
  },

  async getTrendingDestinations(limit = 6): Promise<{ destinations: ExploreDestination[]; lastUpdated: string }> {
    const { data } = await apiClient.get("/explore/destinations/trending", { params: { limit } });
    return {
      destinations: (Array.isArray(data) ? data : []).map(toExploreDestination),
      lastUpdated: new Date().toISOString(),
    };
  },

  async getPopularDestinations(limit = 9): Promise<ExploreDestination[]> {
    const { data } = await apiClient.get("/explore/destinations/popular", { params: { limit } });
    return (Array.isArray(data) ? data : []).map(toExploreDestination);
  },

  async getDestinationsByRegion(regionId: string): Promise<ExploreDestination[]> {
    const { data } = await apiClient.get(`/explore/destinations/by-region/${regionId}`);
    return (Array.isArray(data) ? data : []).map(toExploreDestination);
  },

  async getDestinationsByCategory(category: string): Promise<ExploreDestination[]> {
    const { data } = await apiClient.get(`/explore/destinations/by-category/${category}`);
    return (Array.isArray(data) ? data : []).map(toExploreDestination);
  },

  async getRecommendedDestinations(
    interests: string[],
    savedIds: string[],
    limit = 6,
  ): Promise<{ destinations: ExploreDestination[]; basedOn: "interests" | "saved" | "popular" }> {
    const params: Record<string, string> = { limit: String(limit) };
    if (interests.length) params.interests = interests.join(",");
    if (savedIds.length) params.saved = savedIds.join(",");
    const { data } = await apiClient.get("/explore/recommended", { params });
    return {
      destinations: (Array.isArray(data) ? data : []).map(toExploreDestination),
      basedOn: interests.length > 0 ? "interests" : savedIds.length > 0 ? "saved" : "popular",
    };
  },

  async search(query: string): Promise<SearchResults> {
    const { data } = await apiClient.get("/explore/search", { params: { q: query } });
    const dests = (data as Record<string, unknown>)?.destinations ?? [];
    const acts = (data as Record<string, unknown>)?.activities ?? [];
    return {
      destinations: (Array.isArray(dests) ? dests : []).map(toExploreDestination),
      activities: Array.isArray(acts) ? acts : [],
      places: [],
      totalCount: (Array.isArray(dests) ? dests.length : 0) + (Array.isArray(acts) ? acts.length : 0),
    };
  },

  async getDestinationDetail(destinationId: string): Promise<DestinationDetailData | null> {
    try {
      const { data } = await apiClient.get(`/explore/destinations/${destinationId}/detail`);
      const d = data as Record<string, unknown>;
      return {
        destination: toExploreDestination((d.destination ?? d) as Record<string, unknown>),
        topPlaces: Array.isArray(d.places) ? d.places as DestinationDetailData["topPlaces"] : [],
        popularActivities: Array.isArray(d.activities) ? d.activities as DestinationDetailData["popularActivities"] : [],
        saved: false,
      };
    } catch {
      return null;
    }
  },

  /* ── Filter metadata (static reference) ─────────────────────── */

  async getRegions() {
    return [
      { id: "asia", label: "Asia" },
      { id: "europe", label: "Europe" },
      { id: "north-america", label: "North America" },
      { id: "south-america", label: "South America" },
      { id: "africa", label: "Africa" },
      { id: "oceania", label: "Oceania" },
    ];
  },

  async getBudgetFilters() {
    return [
      { id: "budget", label: "Budget Friendly", description: "Hostels, street food, public transport" },
      { id: "moderate", label: "Moderate", description: "Comfortable stays, some splurges" },
      { id: "premium", label: "Premium", description: "Boutique stays, fine dining, private tours" },
    ];
  },

  async getDurationFilters() {
    return [
      { id: "weekend", label: "Weekend (2–3 days)" },
      { id: "3-5", label: "3–5 Days" },
      { id: "week", label: "1 Week" },
      { id: "2weeks", label: "2+ Weeks" },
    ];
  },

  async getSortOptions() {
    return [
      { id: "popular", label: "Most Popular" },
      { id: "trending", label: "Trending Now" },
      { id: "recommended", label: "Recommended" },
      { id: "alphabetical", label: "A–Z" },
    ];
  },

  async getCategoryFilters() {
    return [
      { id: "all", label: "All" },
      { id: "adventure", label: "Adventure" },
      { id: "nature", label: "Nature" },
      { id: "beaches", label: "Beaches" },
      { id: "mountains", label: "Mountains" },
      { id: "culture", label: "Culture" },
      { id: "food", label: "Food" },
      { id: "history", label: "History" },
      { id: "city-life", label: "City Life" },
      { id: "nightlife", label: "Nightlife" },
      { id: "relaxation", label: "Relaxation" },
    ];
  },

  /* ── Search suggestions ──────────────────────────────────────── */

  async getSearchSuggestions(query: string): Promise<{
    destinations: SearchSuggestion[];
    activities: SearchSuggestion[];
    places: SearchSuggestion[];
  }> {
    const q = query.trim();
    if (!q) return { destinations: [], activities: [], places: [] };
    try {
      const { data } = await apiClient.get("/explore/suggestions", { params: { q } });
      const items = Array.isArray(data) ? data : [];
      return {
        destinations: items
          .filter((s: Record<string, unknown>) => s.type === "destination")
          .map((s: Record<string, unknown>): SearchSuggestion => ({
            id: String(s.id),
            type: "destination",
            label: String(s.label),
            sublabel: String(s.sublabel ?? ""),
            entityId: String(s.id),
            href: `/explore/destinations/${String(s.id)}`,
            group: "destinations",
          })),
        activities: [],
        places: [],
      };
    } catch {
      return { destinations: [], activities: [], places: [] };
    }
  },

  /* ── Saved destinations (shared with dashboard) ──────────────── */

  async readSavedDestinations(): Promise<string[]> {
    const { data } = await apiClient.get<{ savedDestinations: string[] }>("/users/me/bookmarks");
    return data.savedDestinations ?? [];
  },

  async toggleSavedDestination(destinationId: string): Promise<string[]> {
    const { data } = await apiClient.post<{ savedDestinations: string[] }>("/users/me/saved-destinations", { id: destinationId });
    return data.savedDestinations ?? [];
  },

  /* ── Recent searches (local convenience) ─────────────────────── */

  async readRecentSearches(): Promise<RecentSearch[]> {
    return readJson<RecentSearch[]>(RECENT_SEARCHES_KEY, []);
  },

  async addRecentSearch(query: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) return;
    const existing = readJson<RecentSearch[]>(RECENT_SEARCHES_KEY, []);
    const filtered = existing.filter(
      (s) => s.query.toLowerCase() !== trimmed.toLowerCase(),
    );
    const updated = [
      { id: `rs_${Date.now()}`, query: trimmed, timestamp: Date.now() },
      ...filtered,
    ].slice(0, RECENT_SEARCHES_MAX);
    writeJson(RECENT_SEARCHES_KEY, updated);
  },

  async removeRecentSearch(query: string): Promise<void> {
    const existing = readJson<RecentSearch[]>(RECENT_SEARCHES_KEY, []);
    writeJson(
      RECENT_SEARCHES_KEY,
      existing.filter((s) => s.query !== query),
    );
  },

  async clearRecentSearches(): Promise<void> {
    writeJson(RECENT_SEARCHES_KEY, []);
  },

  /* ── Trip integration for "Add to Trip" ──────────────────────── */

  async getTripsForSelector(): Promise<TripSelectorOption[]> {
    const records = await tripsService.listTrips();
    return records
      .filter((r) => !r.archivedAt)
      .map((r) => {
        const days: TripDayOption[] = [];
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const totalDays = Math.max(
          1,
          Math.ceil((end.getTime() - start.getTime()) / 86_400_000) + 1,
        );
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

  async addToTrip(payload: AddToTripPayload): Promise<{ success: boolean; tripId: string }> {
    return { success: true, tripId: payload.tripId };
  },
};

/**
 * Helper to apply multiple filters to destination list
 */
export function applyExploreFilters(
  destinations: ExploreDestination[],
  filters: { category: string; region: string; budget: string; duration: string },
): ExploreDestination[] {
  return destinations.filter((d) => {
    if (filters.category !== "all" && !d.tags?.includes(filters.category)) return false;
    if (filters.region !== "all" && d.region !== filters.region) return false;
    if (filters.budget !== "all") {
      if (filters.budget === "budget" && d.estimatedDailyCostInr > 5000) return false;
      if (filters.budget === "moderate" && (d.estimatedDailyCostInr <= 5000 || d.estimatedDailyCostInr > 12000)) return false;
      if (filters.budget === "premium" && d.estimatedDailyCostInr <= 12000) return false;
    }
    if (filters.duration !== "all") {
      const durationDays = parseInt(d.recommendedDuration.split("–")[0]);
      if (filters.duration === "weekend" && durationDays > 2) return false;
      if (filters.duration === "3-5" && (durationDays < 3 || durationDays > 5)) return false;
      if (filters.duration === "week" && (durationDays < 6 || durationDays > 8)) return false;
      if (filters.duration === "2weeks" && durationDays < 10) return false;
    }
    return true;
  });
}

export function sortExploreDestinations(
  destinations: ExploreDestination[],
  sort: string,
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

export function activeFilterCount(filters: { category: string; region: string; budget: string; duration: string; sort: string }): number {
  return (
    (filters.category !== "all" ? 1 : 0) +
    (filters.region !== "all" ? 1 : 0) +
    (filters.budget !== "all" ? 1 : 0) +
    (filters.duration !== "all" ? 1 : 0) +
    (filters.sort !== "popular" ? 1 : 0)
  );
}

export function estimateTripCost(destination: ExploreDestination): number {
  const durationStr = destination.recommendedDuration;
  const days = durationStr.includes("–")
    ? parseInt(durationStr.split("–")[1])
    : parseInt(durationStr);
  return destination.estimatedDailyCostInr * (days || 1);
}
