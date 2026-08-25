import { apiClient } from "@/services/api/client";
import type { TripRecord } from "./trips.types";
import type {
  ActivityInput,
  ItineraryActivity,
  ItineraryDay,
  ItineraryRecord,
  StopInput,
} from "./itinerary.types";

/**
 * Real itinerary service — all persistence via /api/trips/:id/itinerary
 * and /api/trips/:id/activities, /api/trips/:id/stops etc.
 */

const RECENT_SEARCHES_KEY = "globetrotter.trips.activity-recent-searches";
const RECENT_SEARCHES_MAX = 5;

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

export const itineraryService = {
  async getItinerary(tripId: string): Promise<ItineraryRecord> {
    const { data } = await apiClient.get<ItineraryRecord>(`/trips/${tripId}/itinerary`);
    // Cache for sync readers (calendar composition).
    writeJson(`globetrotter.itinerary-cache.${tripId}`, data);
    return data;
  },

  /** Read cached itinerary synchronously (used by calendar composition). */
  readItineraryByTrip(tripId: string): ItineraryRecord | null {
    return readJson<ItineraryRecord | null>(
      `globetrotter.itinerary-cache.${tripId}`,
      null,
    );
  },

  /** Full-document save used by autosave and manual save. */
  async saveItinerary(record: ItineraryRecord): Promise<ItineraryRecord> {
    const { data } = await apiClient.put<ItineraryRecord>(
      `/trips/${record.tripId}/itinerary`,
      record,
    );
    // Cache for sync readers (calendar).
    writeJson(`globetrotter.itinerary-cache.${record.tripId}`, data);
    return data;
  },

  /* ── Activities ─────────────────────────────────────────────── */

  async addActivity(tripId: string, input: ActivityInput): Promise<ItineraryActivity> {
    const { data } = await apiClient.post<ItineraryActivity>(
      `/trips/${tripId}/activities`,
      input,
    );
    return data;
  },

  async updateActivity(
    tripId: string,
    activityId: string,
    patch: Partial<ActivityInput>,
  ): Promise<ItineraryActivity> {
    const { data } = await apiClient.patch<ItineraryActivity>(
      `/trips/${tripId}/activities/${activityId}`,
      patch,
    );
    return data;
  },

  async deleteActivity(tripId: string, activityId: string): Promise<void> {
    await apiClient.delete(`/trips/${tripId}/activities/${activityId}`);
  },

  async duplicateActivity(
    tripId: string,
    activityId: string,
  ): Promise<ItineraryActivity> {
    const { data } = await apiClient.post<ItineraryActivity>(
      `/trips/${tripId}/activities/${activityId}/duplicate`,
    );
    return data;
  },

  async reorderActivities(
    tripId: string,
    dayId: string,
    orderedIds: string[],
  ): Promise<ItineraryRecord> {
    const { data } = await apiClient.patch<ItineraryRecord>(
      `/trips/${tripId}/days/${dayId}/activity-order`,
      { orderedIds },
    );
    return data;
  },

  async moveActivityToDay(
    tripId: string,
    activityId: string,
    targetDayId: string,
  ): Promise<ItineraryActivity> {
    const { data } = await apiClient.post<ItineraryActivity>(
      `/trips/${tripId}/activities/${activityId}/move`,
      { dayId: targetDayId },
    );
    return data;
  },

  /* ── Days ───────────────────────────────────────────────────── */

  async updateDay(
    tripId: string,
    dayId: string,
    patch: Partial<Pick<ItineraryDay, "notes" | "destinationId">>,
  ): Promise<ItineraryDay> {
    const { data } = await apiClient.patch<ItineraryDay>(
      `/trips/${tripId}/days/${dayId}`,
      patch,
    );
    return data;
  },

  async clearDay(tripId: string, dayId: string): Promise<void> {
    await apiClient.delete(`/trips/${tripId}/days/${dayId}/activities`);
  },

  async duplicateDay(
    tripId: string,
    sourceDayId: string,
    targetDayId: string,
  ): Promise<void> {
    await apiClient.post(`/trips/${tripId}/days/${sourceDayId}/duplicate`, {
      targetDayId,
    });
  },

  /* ── Stops (multi-city) ─────────────────────────────────────── */

  async addStop(tripId: string, input: StopInput): Promise<ItineraryRecord["stops"]> {
    const { data } = await apiClient.post<ItineraryRecord["stops"]>(
      `/trips/${tripId}/stops`,
      input,
    );
    return data;
  },

  async updateStop(
    tripId: string,
    stopId: string,
    patch: Partial<StopInput>,
  ): Promise<ItineraryRecord["stops"]> {
    const { data } = await apiClient.patch<ItineraryRecord["stops"]>(
      `/trips/${tripId}/stops/${stopId}`,
      patch,
    );
    return data;
  },

  async deleteStop(tripId: string, stopId: string): Promise<void> {
    await apiClient.delete(`/trips/${tripId}/stops/${stopId}`);
  },

  async reorderStops(
    tripId: string,
    orderedIds: string[],
  ): Promise<ItineraryRecord["stops"]> {
    const { data } = await apiClient.patch<ItineraryRecord["stops"]>(
      `/trips/${tripId}/stops/order`,
      { orderedIds },
    );
    return data;
  },

  /* ── Completion ─────────────────────────────────────────────── */

  async completeItinerary(tripId: string): Promise<TripRecord> {
    const { data } = await apiClient.post<TripRecord>(`/trips/${tripId}/complete`);
    return data;
  },

  /* ── Recent activity searches (local convenience) ───────────── */

  readRecentSearches(): string[] {
    return readJson<string[]>(RECENT_SEARCHES_KEY, []);
  },

  pushRecentSearch(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return this.readRecentSearches();
    const next = [
      trimmed,
      ...this.readRecentSearches().filter(
        (entry) => entry.toLowerCase() !== trimmed.toLowerCase(),
      ),
    ].slice(0, RECENT_SEARCHES_MAX);
    writeJson(RECENT_SEARCHES_KEY, next);
    return next;
  },
};
