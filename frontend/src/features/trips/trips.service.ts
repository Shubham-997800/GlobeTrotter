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
 *   searchActivities()        → GET /api/activities/search?q=&category=
 *   createTrip(draft)         → POST /api/trips          → TripRecord
 *   saveTripDraft(draft)      → PUT  /api/trips/:id/draft → TripRecord
 *   getTrip(id)               → GET  /api/trips/:id       → TripRecord
 *   updateTrip(id, patch)     → PATCH /api/trips/:id      → TripRecord
 *   deleteTrip(id)            → DELETE /api/trips/:id
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

  /**
   * Query-based catalog search used by the itinerary builder's
   * "Search Activities" tab. Client-side filter over the catalog,
   * standing in for a `?q=&category=` endpoint.
   */
  async searchActivities(
    query: string,
    category?: ActivityCategoryId | "all",
  ): Promise<ActivitySuggestion[]> {
    await delay(SEARCH_LATENCY_MS);
    const q = query.trim().toLowerCase();
    return activities.filter((activity) => {
      if (category && category !== "all" && activity.category !== category) {
        return false;
      }
      if (!q) return true;
      return (
        activity.name.toLowerCase().includes(q) ||
        activity.city.toLowerCase().includes(q) ||
        activity.country.toLowerCase().includes(q) ||
        activity.description.toLowerCase().includes(q)
      );
    });
  },

  async listTrips(): Promise<TripRecord[]> {
    return readJson<TripRecord[]>(TRIPS_KEY, []);
  },

  /**
   * Synchronous single-trip reader (localStorage is sync). Powers the
   * edit flow's first paint without an extra async hop.
   */
  readTripById(id: string): TripRecord | null {
    return (
      readJson<TripRecord[]>(TRIPS_KEY, []).find((trip) => trip.id === id) ??
      null
    );
  },

  /** Shared record-shaping logic so create/update/duplicate stay aligned. */
  buildRecord(
    draft: TripDraftValues,
    overrides: Partial<TripRecord> = {},
  ): TripRecord {
    const now = new Date().toISOString();
    return {
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
      budgetAmount: Number(draft.budgetAmount || 0),
      status: "planned",
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  },

  /**
   * Creates a planned trip and returns its record — callers redirect to
   * `/trips/:id/itinerary` using this ID.
   */
  async createTrip(
    draft: TripDraftValues,
    activityIds: string[] = [],
  ): Promise<TripRecord> {
    await delay(MUTATION_LATENCY_MS);
    const record = this.buildRecord(draft, {
      status: "planned",
      activityIds,
      budgetAmount: Number(draft.budgetAmount),
    });
    writeJson(TRIPS_KEY, [record, ...readJson<TripRecord[]>(TRIPS_KEY, [])]);
    localStorage.removeItem(DRAFT_KEY);
    return record;
  },

  async saveTripDraft(
    draft: TripDraftValues,
    activityIds: string[] = [],
  ): Promise<TripRecord> {
    await delay(MUTATION_LATENCY_MS);
    const records = readJson<TripRecord[]>(TRIPS_KEY, []);
    const record = this.buildRecord(draft, {
      status: "draft",
      id: `trip_draft_${Date.now().toString(36)}`,
      activityIds,
    });
    writeJson(TRIPS_KEY, [record, ...records]);
    return record;
  },

  /**
   * Bulk delete that reports partial failures instead of pretending
   * everything succeeded.
   */
  async deleteTrips(ids: string[]): Promise<{
    deletedIds: string[];
    failedIds: string[];
  }> {
    await delay(MUTATION_LATENCY_MS);
    const remaining = readJson<TripRecord[]>(TRIPS_KEY, []);
    const deletedIds: string[] = [];
    const failedIds: string[] = [];
    for (const id of ids) {
      if (remaining.some((trip) => trip.id === id)) deletedIds.push(id);
      else failedIds.push(id);
    }
    writeJson(
      TRIPS_KEY,
      remaining.filter((trip) => !deletedIds.includes(trip.id)),
    );
    return { deletedIds, failedIds };
  },

  /** Duplicates a trip into a fresh editable copy with a real new ID. */
  async duplicateTrip(id: string): Promise<TripRecord | null> {
    await delay(MUTATION_LATENCY_MS);
    const records = readJson<TripRecord[]>(TRIPS_KEY, []);
    const source = records.find((trip) => trip.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const copy: TripRecord = {
      ...source,
      id: `trip_${Date.now().toString(36)}_copy`,
      name: `${source.name} (Copy)`,
      status: source.status === "draft" ? "draft" : "planned",
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    };
    writeJson(TRIPS_KEY, [copy, ...records]);
    return copy;
  },

  /** Persists archive state; archived trips leave the default views. */
  async setTripsArchived(ids: string[], archived: boolean): Promise<string[]> {
    await delay(MUTATION_LATENCY_MS);
    const records = readJson<TripRecord[]>(TRIPS_KEY, []);
    const stamp = archived ? new Date().toISOString() : null;
    const affected = new Set(ids);
    writeJson(
      TRIPS_KEY,
      records.map((trip) =>
        affected.has(trip.id)
          ? { ...trip, archivedAt: stamp, updatedAt: new Date().toISOString() }
          : trip,
      ),
    );
    return ids.filter((id) =>
      records.some((trip) => trip.id === id),
    );
  },

  /* ── Single-trip operations (used by the itinerary builder) ─── */

  async getTrip(tripId: string): Promise<TripRecord | null> {
    await delay(SEARCH_LATENCY_MS);
    return (
      readJson<TripRecord[]>(TRIPS_KEY, []).find(
        (trip) => trip.id === tripId,
      ) ?? null
    );
  },

  /** Full update from the edit flow — reuses the create validation schema. */
  async updateTrip(
    tripId: string,
    draft: TripDraftValues,
    activityIds?: string[],
  ): Promise<TripRecord> {
    await delay(MUTATION_LATENCY_MS);
    const records = readJson<TripRecord[]>(TRIPS_KEY, []);
    const index = records.findIndex((trip) => trip.id === tripId);
    if (index === -1) throw new Error("Trip not found.");
    const updated: TripRecord = {
      ...records[index],
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      coverImage: draft.coverImage || undefined,
      startDate: draft.startDate,
      endDate: draft.endDate,
      destinationId: draft.destinationId,
      interests: draft.interests,
      budgetTier: draft.budgetTier,
      currency: draft.currency,
      budgetAmount: Number(draft.budgetAmount || 0),
      ...(activityIds ? { activityIds } : {}),
      updatedAt: new Date().toISOString(),
    };
    records[index] = updated;
    writeJson(TRIPS_KEY, records);
    return updated;
  },

  /** Narrow field patch (status flips from the itinerary builder, …). */
  async patchTrip(
    tripId: string,
    patch: Partial<Pick<TripRecord, "name" | "description" | "coverImage" | "status">>,
  ): Promise<TripRecord> {
    await delay(MUTATION_LATENCY_MS);
    const records = readJson<TripRecord[]>(TRIPS_KEY, []);
    const index = records.findIndex((trip) => trip.id === tripId);
    if (index === -1) throw new Error("Trip not found.");
    const updated: TripRecord = {
      ...records[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    records[index] = updated;
    writeJson(TRIPS_KEY, records);
    return updated;
  },

  async deleteTrip(tripId: string): Promise<void> {
    await delay(MUTATION_LATENCY_MS);
    writeJson(
      TRIPS_KEY,
      readJson<TripRecord[]>(TRIPS_KEY, []).filter((trip) => trip.id !== tripId),
    );
    // The itinerary document is owned by the trip — cascade the delete.
    localStorage.removeItem(`globetrotter.trips.itinerary.${tripId}`);
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
