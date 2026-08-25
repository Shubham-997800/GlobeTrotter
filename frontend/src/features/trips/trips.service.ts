import { apiClient } from "@/services/api/client";
import type {
  ActivityCategoryId,
  ActivitySuggestion,
  Destination,
  TripDraftValues,
  TripRecord,
} from "./trips.types";
import { emptyTripDraft } from "./schemas/create-trip.schema";

/**
 * Real trips service — all persistence via /api/trips and /api/catalog.
 */

/* ── Catalog queries ─────────────────────────────────────────── */

export const tripsService = {
  async searchDestinations(query: string): Promise<Destination[]> {
    const q = query.trim();
    if (!q) return [];
    const { data } = await apiClient.get<Destination[]>("/destinations", { params: { q } });
    return data;
  },

  async getSuggestedDestinations(
    filter: "interests" | "budget" | "popular",
    interests: string[],
  ): Promise<Destination[]> {
    const { data } = await apiClient.get<Destination[]>("/destinations/recommended", {
      params: { filter, interests: interests.join(",") },
    });
    return data;
  },

  async getActivities(category: ActivityCategoryId): Promise<ActivitySuggestion[]> {
    const { data } = await apiClient.get<ActivitySuggestion[]>("/activities", {
      params: { category },
    });
    return data;
  },

  async searchActivities(
    query: string,
    category?: ActivityCategoryId | "all",
  ): Promise<ActivitySuggestion[]> {
    const params: Record<string, string> = {};
    if (query.trim()) params.q = query.trim();
    if (category && category !== "all") params.category = category;
    const { data } = await apiClient.get<ActivitySuggestion[]>("/activities/search", { params });
    return data;
  },

  /* ── Trip CRUD ──────────────────────────────────────────────── */

  async listTrips(): Promise<TripRecord[]> {
    const { data } = await apiClient.get<TripRecord[]>("/trips");
    return data;
  },

  async getTrip(tripId: string): Promise<TripRecord | null> {
    try {
      const { data } = await apiClient.get<TripRecord>(`/trips/${tripId}`);
      return data;
    } catch {
      return null;
    }
  },

  async createTrip(
    draft: TripDraftValues,
    activityIds: string[] = [],
  ): Promise<TripRecord> {
    const { data } = await apiClient.post<TripRecord>("/trips", {
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
      activityIds,
    });
    return data;
  },

  async saveTripDraft(
    draft: TripDraftValues,
    activityIds: string[] = [],
  ): Promise<TripRecord> {
    const { data } = await apiClient.put<TripRecord>("/trips/draft", {
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
      status: "draft",
      activityIds,
    });
    return data;
  },

  async updateTrip(
    tripId: string,
    draft: TripDraftValues,
    activityIds?: string[],
  ): Promise<TripRecord> {
    const body: Record<string, unknown> = {
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
    };
    if (activityIds) body.activityIds = activityIds;
    const { data } = await apiClient.put<TripRecord>(`/trips/${tripId}`, body);
    return data;
  },

  async patchTrip(
    tripId: string,
    patch: Partial<Pick<TripRecord, "name" | "description" | "coverImage" | "status" | "budgetAmount" | "currency">>,
  ): Promise<TripRecord> {
    const { data } = await apiClient.patch<TripRecord>(`/trips/${tripId}`, patch);
    return data;
  },

  async deleteTrip(tripId: string): Promise<void> {
    await apiClient.delete(`/trips/${tripId}`);
  },

  async deleteTrips(ids: string[]): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    if (ids.length === 1) {
      await apiClient.delete(`/trips/${ids[0]}`);
      return { deletedIds: ids, failedIds: [] };
    }
    const { data } = await apiClient.post<{ deletedIds: string[]; failedIds: string[] }>("/trips/bulk-delete", { ids });
    return data;
  },

  async duplicateTrip(id: string): Promise<TripRecord | null> {
    try {
      const { data } = await apiClient.post<TripRecord>(`/trips/${id}/duplicate`);
      return data;
    } catch {
      return null;
    }
  },

  async setTripsArchived(ids: string[], archived: boolean): Promise<string[]> {
    const { data } = await apiClient.patch<string[]>("/trips/bulk-archive", { ids, archived });
    return data;
  },

  /* ── Local autosave draft (per browser, no network) ─────────── */

  readActiveDraft(): TripDraftValues | null {
    try {
      const raw = localStorage.getItem("globetrotter.trips.active-draft");
      return raw ? (JSON.parse(raw) as TripDraftValues) : null;
    } catch {
      return null;
    }
  },

  writeActiveDraft(draft: TripDraftValues): void {
    try {
      localStorage.setItem("globetrotter.trips.active-draft", JSON.stringify(draft));
    } catch {
      // storage unavailable
    }
  },

  clearActiveDraft(): void {
    localStorage.removeItem("globetrotter.trips.active-draft");
  },

  resetToEmptyDraft(): TripDraftValues {
    const empty = emptyTripDraft();
    this.writeActiveDraft(empty);
    return empty;
  },

  /* ── Saved-for-later activities ─────────────────────────────── */

  async readSavedActivityIds(): Promise<string[]> {
    const { data } = await apiClient.get<{ savedActivities: string[] }>("/users/me/bookmarks");
    return data.savedActivities ?? [];
  },

  async toggleSavedActivity(activityId: string): Promise<string[]> {
    const { data } = await apiClient.post<{ savedActivities: string[] }>("/users/me/saved-activities", { id: activityId });
    return data.savedActivities ?? [];
  },
};
