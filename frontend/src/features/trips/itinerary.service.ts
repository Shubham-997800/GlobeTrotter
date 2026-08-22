import type { TripRecord } from "./trips.types";
import { tripsService } from "./trips.service";
import type {
  ActivityInput,
  ItineraryActivity,
  ItineraryDay,
  ItineraryRecord,
  StopInput,
} from "./itinerary.types";
import { tripDates } from "./itinerary.utils";

/**
 * Mock itinerary service — same persistence approach as
 * `trips.service.ts` (localStorage until the backend ships).
 *
 * Swapping to a real backend:
 *   getItinerary(tripId)        → GET    /api/trips/:id/itinerary
 *   saveItinerary(record)       → PUT    /api/trips/:id/itinerary  (autosave)
 *   addActivity(input)          → POST   /api/trips/:id/activities
 *   updateActivity(id, patch)   → PATCH  /api/activities/:id
 *   deleteActivity(id)          → DELETE /api/activities/:id
 *   reorderActivities(ids)      → PATCH  /api/days/:id/activity-order
 *   duplicateActivity(id)       → POST   /api/activities/:id/duplicate
 *   moveActivity(id, dayId)     → POST   /api/activities/:id/move
 *   updateDay(dayId, patch)     → PATCH  /api/days/:id
 *   clearDay(dayId)             → DELETE /api/days/:id/activities
 *   duplicateDay(dayId)         → POST   /api/days/:id/duplicate
 *   addStop(input)              → POST   /api/trips/:id/stops
 *   updateStop(id, patch)       → PATCH  /api/stops/:id
 *   deleteStop(id)              → DELETE /api/stops/:id
 *   reorderStops(ids)           → PATCH  /api/trips/:id/stop-order
 *   completeItinerary(tripId)   → POST   /api/trips/:id/complete
 *
 * Days are derived from the authoritative trip date range: one day per
 * calendar date, never more, never fewer.
 */

const itineraryKey = (tripId: string) =>
  `globetrotter.trips.itinerary.${tripId}`;

const RECENT_SEARCHES_KEY = "globetrotter.trips.activity-recent-searches";
const RECENT_SEARCHES_MAX = 5;

const LATENCY_MS = 450;

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

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/** Builds one day per trip date; preserves existing day data by date. */
function deriveDays(
  trip: Pick<TripRecord, "startDate" | "endDate">,
  existing: ItineraryDay[],
): ItineraryDay[] {
  return tripDates(trip).map((date) => {
    const previous = existing.find((day) => day.date === date);
    return (
      previous ?? {
        id: `day_${date}`,
        date,
        destinationId: null,
        notes: "",
      }
    );
  });
}

async function loadRecord(tripId: string): Promise<{
  trip: TripRecord;
  record: ItineraryRecord;
}> {
  const trip = await tripsService.getTrip(tripId);
  if (!trip) throw new Error("Trip not found.");
  const stored =
    readJson<ItineraryRecord | null>(itineraryKey(tripId), null) ??
    ({
      tripId,
      stops: [],
      days: [],
      activities: [],
      updatedAt: "",
    } satisfies ItineraryRecord);
  // Days always mirror the (possibly edited) trip range.
  const record: ItineraryRecord = {
    ...stored,
    tripId,
    days: deriveDays(trip, stored.days),
  };
  return { trip, record };
}

function persist(record: ItineraryRecord): ItineraryRecord {
  const next = { ...record, updatedAt: new Date().toISOString() };
  writeJson(itineraryKey(next.tripId), next);
  return next;
}

export const itineraryService = {
  async getItinerary(tripId: string): Promise<ItineraryRecord> {
    const { record } = await loadRecord(tripId);
    return record;
  },

  /** Full-document save used by autosave and manual save. */
  async saveItinerary(record: ItineraryRecord): Promise<ItineraryRecord> {
    await delay(LATENCY_MS);
    const current = await tripsService.getTrip(record.tripId);
    if (!current) throw new Error("Trip not found.");
    return persist({ ...record, days: deriveDays(current, record.days) });
  },

  /* ── Activities ─────────────────────────────────────────────── */

  async addActivity(tripId: string, input: ActivityInput): Promise<ItineraryActivity> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const activity: ItineraryActivity = {
      id: newId("act"),
      ...input,
      order: record.activities.filter((a) => a.dayId === input.dayId).length,
    };
    const persisted = persist({
      ...record,
      activities: [...record.activities, activity],
    });
    const created = persisted.activities.find((a) => a.id === activity.id);
    if (!created) throw new Error("Activity could not be saved.");
    return created;
  },

  async updateActivity(
    tripId: string,
    activityId: string,
    patch: Partial<ActivityInput>,
  ): Promise<ItineraryActivity> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const activities = record.activities.map((activity) =>
      activity.id === activityId ? { ...activity, ...patch } : activity,
    );
    const updated = activities.find((activity) => activity.id === activityId);
    if (!updated) throw new Error("Activity not found.");
    persist({ ...record, activities });
    return updated;
  },

  async deleteActivity(tripId: string, activityId: string): Promise<void> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    persist({
      ...record,
      activities: record.activities.filter(
        (activity) => activity.id !== activityId,
      ),
    });
  },

  async duplicateActivity(
    tripId: string,
    activityId: string,
  ): Promise<ItineraryActivity> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const source = record.activities.find((a) => a.id === activityId);
    if (!source) throw new Error("Activity not found.");
    // Insert directly after the source so the copy lands in a sensible spot.
    const siblings = record.activities.filter((a) => a.dayId === source.dayId);
    const insertAt = siblings.findIndex((a) => a.id === activityId) + 1;
    const copy: ItineraryActivity = {
      ...source,
      id: newId("act"),
      name: `${source.name} (copy)`,
      order: insertAt,
    };
    const renumbered = siblings.map((sibling) =>
      sibling.order >= insertAt && sibling.id !== copy.id
        ? { ...sibling, order: sibling.order + 1 }
        : sibling,
    );
    const activities = [
      ...record.activities.filter((a) => a.dayId !== source.dayId),
      ...renumbered,
      copy,
    ];
    const persisted = persist({ ...record, activities });
    const created = persisted.activities.find((a) => a.id === copy.id);
    if (!created) throw new Error("Copy could not be saved.");
    return created;
  },

  /** Persists a new order for one day's activities (unique indexes). */
  async reorderActivities(
    tripId: string,
    dayId: string,
    orderedIds: string[],
  ): Promise<ItineraryRecord> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const rank = new Map(orderedIds.map((id, index) => [id, index]));
    const dayActivities = record.activities
      .filter((activity) => activity.dayId === dayId)
      .map((activity) => ({
        ...activity,
        order: rank.get(activity.id) ?? activity.order,
      }))
      .sort((a, b) => a.order - b.order)
      .map((activity, index) => ({ ...activity, order: index }));
    const activities = [
      ...record.activities.filter((activity) => activity.dayId !== dayId),
      ...dayActivities,
    ];
    return persist({ ...record, activities });
  },

  async moveActivityToDay(
    tripId: string,
    activityId: string,
    targetDayId: string,
  ): Promise<ItineraryActivity> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const targetCount = record.activities.filter(
      (activity) => activity.dayId === targetDayId,
    ).length;
    const activities = record.activities.map((activity) =>
      activity.id === activityId
        ? { ...activity, dayId: targetDayId, order: targetCount }
        : activity,
    );
    const moved = activities.find((activity) => activity.id === activityId);
    if (!moved) throw new Error("Activity not found.");
    persist({ ...record, activities });
    return moved;
  },

  /* ── Days ───────────────────────────────────────────────────── */

  async updateDay(
    tripId: string,
    dayId: string,
    patch: Partial<Pick<ItineraryDay, "notes" | "destinationId">>,
  ): Promise<ItineraryDay> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const days = record.days.map((day) =>
      day.id === dayId ? { ...day, ...patch } : day,
    );
    const updated = days.find((day) => day.id === dayId);
    if (!updated) throw new Error("Day not found.");
    persist({ ...record, days });
    return updated;
  },

  async clearDay(tripId: string, dayId: string): Promise<void> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    persist({
      ...record,
      activities: record.activities.filter((a) => a.dayId !== dayId),
    });
  },

  /**
   * Copies every activity onto another day with brand-new IDs.
   * The trip's date range is authoritative, so days are never added or
   * removed — duplication targets an existing day instead.
   */
  async duplicateDay(
    tripId: string,
    sourceDayId: string,
    targetDayId: string,
  ): Promise<void> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const source = record.activities.filter((a) => a.dayId === sourceDayId);
    const copies = source.map((activity, index) => ({
      ...activity,
      id: newId("act"),
      dayId: targetDayId,
      order:
        record.activities.filter((a) => a.dayId === targetDayId).length + index,
    }));
    persist({ ...record, activities: [...record.activities, ...copies] });
  },

  /* ── Stops (multi-city) ─────────────────────────────────────── */

  async addStop(tripId: string, input: StopInput): Promise<ItineraryRecord["stops"]> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const stop = {
      id: newId("stop"),
      ...input,
      order: record.stops.length,
    };
    const stops = [...record.stops, stop];
    persist({ ...record, stops });
    return stops;
  },

  async updateStop(
    tripId: string,
    stopId: string,
    patch: Partial<StopInput>,
  ): Promise<ItineraryRecord["stops"]> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const stops = record.stops.map((stop) =>
      stop.id === stopId ? { ...stop, ...patch } : stop,
    );
    persist({ ...record, stops });
    return stops;
  },

  async deleteStop(tripId: string, stopId: string): Promise<void> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    // Reindex remaining stops so order values stay dense and unique.
    const stops = record.stops
      .filter((stop) => stop.id !== stopId)
      .sort((a, b) => a.order - b.order)
      .map((stop, index) => ({ ...stop, order: index }));
    persist({ ...record, stops });
  },

  async reorderStops(
    tripId: string,
    orderedIds: string[],
  ): Promise<ItineraryRecord["stops"]> {
    await delay(LATENCY_MS);
    const { record } = await loadRecord(tripId);
    const rank = new Map(orderedIds.map((id, index) => [id, index]));
    const stops = record.stops
      .map((stop) => ({ ...stop, order: rank.get(stop.id) ?? stop.order }))
      .sort((a, b) => a.order - b.order)
      .map((stop, index) => ({ ...stop, order: index }));
    persist({ ...record, stops });
    return stops;
  },

  /* ── Completion ─────────────────────────────────────────────── */

  /** Marks planning as finished on the actual trip record. */
  async completeItinerary(tripId: string): Promise<TripRecord> {
    await delay(LATENCY_MS);
    return tripsService.patchTrip(tripId, { status: "planned" });
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
