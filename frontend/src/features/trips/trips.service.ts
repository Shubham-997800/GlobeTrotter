import {
  activities,
  destinations,
} from "./trips.data";
import type {
  ActivityCategoryId,
  ActivitySuggestion,
  Destination,
  TripDraftValues,
  TripRecord,
} from "./trips.types";
import { emptyTripDraft } from "./schemas/create-trip.schema";

/**
 * Mock trips service — the ONLY place with fake persistence logic.
 *
 * Swapping to a real backend:
 *   searchDestinations()      → GET /api/destinations?q=
 *   getSuggestedDestinations()→ GET /api/destinations/recommended
 *   getActivities()           → GET /api/activities?category=
 *   createTrip(draft)         → POST /api/trips          → TripRecord
 *   saveTripDraft(draft)      → PUT  /api/trips/:id/draft → TripRecord
 *   saved activity ids        → GET/PUT /api/users/me/saved-activities
 *   draft restore             → stored server-side per user
 *
 * Until then everything lives in localStorage, mirroring the auth
 * service approach. Delete the mock bodies and keep the exported shape.
 */

const TRIPS_KEY = "globetrotter.trips.records";
const DRAFT_KEY = "globetrotter.trips.active-draft";
const SAVED_ACTIVITIES_KEY = "globetrotter.trips.saved-activity-ids";

const SEARCH_LATENCY_MS = 350;
const MUTATION_LATENCY_MS = 900;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    // storage unavailable — mock only
  }
}

export const tripsService = {
  /** Client-side catalog search standing in for a `?q=` endpoint. */
  async searchDestinations(query: string): Promise<Destination[]> {
    await delay(SEARCH_LATENCY_MS);
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return destinations.filter(
      (destination) =>
        destination.city.toLowerCase().includes(q) ||
        destination.country.toLowerCase().includes(q),
    );
  },

  async getSuggestedDestinations(
    filter: "interests" | "budget" | "popular",
    interests: string[],
  ): Promise<Destination[]> {
    await delay(SEARCH_LATENCY_MS);
    switch (filter) {
      case "budget":
        return [...destinations]
          .sort((a, b) => a.estimatedDailyCostInr - b.estimatedDailyCostInr)
          .slice(0, 6);
      case "popular":
        return [...destinations]
          .sort((a, b) => b.reviews - a.reviews)
          .slice(0, 6);
      case "interests": {
        if (interests.length === 0) {
          return [...destinations].sort((a, b) => b.rating - a.rating).slice(0, 6);
        }
        return [...destinations]
          .map((destination) => ({
            destination,
            score: destination.tags.filter((tag) => interests.includes(tag)).length,
          }))
          .filter((entry) => entry.score > 0)
          .sort(
            (a, b) =>
              b.score - a.score ||
              b.destination.rating - a.destination.rating,
          )
          .map((entry) => entry.destination);
      }
    }
  },

  async getActivities(category: ActivityCategoryId): Promise<ActivitySuggestion[]> {
    await delay(SEARCH_LATENCY_MS);
    if (category === "popular") {
      return [...activities].sort((a, b) => b.costInr - a.costInr).slice(0, 6);
    }
    const matching = activities.filter((activity) => activity.category === category);
    return matching.length > 0 ? matching : activities.slice(0, 4);
  },

  async listTrips(): Promise<TripRecord[]> {
    return readJson<TripRecord[]>(TRIPS_KEY, []);
  },

  /**
   * Creates a planned trip and returns its record — callers redirect to
   * `/app/trips/:id/itinerary` using this ID.
   */
  async createTrip(draft: TripDraftValues): Promise<TripRecord> {
    await delay(MUTATION_LATENCY_MS);
    const record: TripRecord = {
      id: `trip_${Date.now().toString(36)}`,
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      coverImage: draft.coverImage || undefined,
      startDate: draft.startDate,
      endDate: draft.endDate,
      destinationId: draft.destinationId,
      interests: draft.interests,
      budgetTier: draft.budgetTier,
      currency: draft.currency,
      budgetAmount: Number(draft.budgetAmount),
      status: "planned",
      createdAt: new Date().toISOString(),
    };
    writeJson(TRIPS_KEY, [record, ...readJson<TripRecord[]>(TRIPS_KEY, [])]);
    localStorage.removeItem(DRAFT_KEY);
    return record;
  },

  async saveTripDraft(draft: TripDraftValues): Promise<TripRecord> {
    await delay(MUTATION_LATENCY_MS);
    const records = readJson<TripRecord[]>(TRIPS_KEY, []);
    const record: TripRecord = {
      id: `trip_draft_${Date.now().toString(36)}`,
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      startDate: draft.startDate,
      endDate: draft.endDate,
      destinationId: draft.destinationId,
      interests: draft.interests,
      budgetTier: draft.budgetTier,
      currency: draft.currency,
      budgetAmount: Number(draft.budgetAmount || 0),
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    writeJson(TRIPS_KEY, [record, ...records]);
    return record;
  },

  /* ── Local autosave draft (per browser, no network) ─────────── */

  readActiveDraft(): TripDraftValues | null {
    return readJson<TripDraftValues | null>(DRAFT_KEY, null);
  },

  writeActiveDraft(draft: TripDraftValues): void {
    writeJson(DRAFT_KEY, draft);
  },

  clearActiveDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
  },

  resetToEmptyDraft(): TripDraftValues {
    const empty = emptyTripDraft();
    this.writeActiveDraft(empty);
    return empty;
  },

  /* ── Saved-for-later activities ─────────────────────────────── */

  readSavedActivityIds(): string[] {
    return readJson<string[]>(SAVED_ACTIVITIES_KEY, []);
  },

  toggleSavedActivity(activityId: string): string[] {
    const ids = this.readSavedActivityIds();
    const next = ids.includes(activityId)
      ? ids.filter((id) => id !== activityId)
      : [...ids, activityId];
    writeJson(SAVED_ACTIVITIES_KEY, next);
    return next;
  },
};
