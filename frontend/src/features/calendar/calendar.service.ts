import { destinations } from "@/features/trips/trips.data";
import { itineraryService } from "@/features/trips/itinerary.service";
import type { ItineraryActivity } from "@/features/trips/itinerary.types";
import { tripsService } from "@/features/trips/trips.service";
import type { TripRecord } from "@/features/trips/trips.types";
import { resolveTripStatus } from "@/features/trips/my-trips.logic";
import {
  addDaysToKey,
  daysBetweenKeys,
  eventTypeForActivity,
  findConflicts,
  isValidKey,
  minutesFromTime,
} from "./calendar.utils";
import type {
  CalendarEvent,
  CustomEventInput,
  ScheduleConflict,
  UpdateCustomEventInput,
} from "./calendar.types";

/**
 * Calendar service — composes one normalized event stream out of three
 * sources and owns CRUD for standalone events.
 *
 * Swapping to a real backend:
 *   getEvents(range)          → GET /api/calendar/events?from=&to=
 *   createEvent(input)        → POST   /api/calendar/events
 *   updateEvent(id, patch)    → PATCH  /api/calendar/events/:id
 *   deleteEvent(id)           → DELETE /api/calendar/events/:id
 *   setEventStatus(id, state) → POST   /api/calendar/events/:id/status
 *   moveActivityDate(…)       → POST   /api/activities/:id/move   (itinerary)
 *   updateActivityTime(…)     → PATCH  /api/activities/:id        (itinerary)
 *
 * Trip spans and itinerary activities are derived server-side in that
 * world; until then they are composed here from the existing mock
 * services so both features stay in sync automatically.
 */

const CUSTOM_EVENTS_KEY = "globetrotter.calendar.events";
const MUTATION_LATENCY_MS = 550;
const READ_LATENCY_MS = 350;

/** Demo events seeded once on first run so the calendar feels alive. */
function buildSeedCustomEvents(): CalendarEvent[] {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const currentHour = now.getHours();
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    {
      id: "evt_seed_001",
      source: "custom",
      type: "activity",
      title: "Sunrise city walk",
      date: today,
      startTime: `${pad(Math.max(6, Math.min(currentHour - 1, 22)))}:00`,
      endTime: `${pad(Math.max(7, Math.min(currentHour + 1, 23)))}:00`,
      location: "Old town quarter",
      description: "Easy loop before the heat — coffee stop halfway.",
      status: "planned",
    },
    {
      id: "evt_seed_002",
      source: "custom",
      type: "transport",
      title: "Airport pickup — Sam",
      date: addDaysToKey(today, 2),
      startTime: "14:30",
      endTime: "15:45",
      location: "Terminal 3 arrivals",
      status: "planned",
    },
    {
      id: "evt_seed_003",
      source: "custom",
      type: "accommodation",
      title: "Hotel check-in",
      date: addDaysToKey(today, 5),
      startTime: "15:00",
      endTime: "16:00",
      location: "Riverside Grand",
      status: "planned",
    },
  ];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
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

/* ── Custom event store ────────────────────────────────────────── */

export function readCustomEvents(): CalendarEvent[] {
  const raw = readJson<CalendarEvent[] | null>(CUSTOM_EVENTS_KEY, null);
  if (raw) return raw.filter((event) => isValidKey(event.date));
  // First run — seed demo content (users can delete these freely).
  const seeded = buildSeedCustomEvents();
  writeJson(CUSTOM_EVENTS_KEY, seeded);
  return seeded;
}

function writeCustomEvents(events: CalendarEvent[]): void {
  writeJson(CUSTOM_EVENTS_KEY, events);
}

/* ── Composition ───────────────────────────────────────────────── */

function tripStatusToEventStatus(
  trip: TripRecord,
  now: Date,
): CalendarEvent["status"] | null {
  switch (resolveTripStatus(trip, now)) {
    case "draft":
      return null; // drafts are planning scaffolding, not schedule items
    case "completed":
      return "completed";
    default:
      return "planned";
  }
}

/** One all-day event per covered day keeps every view trivially correct. */
function expandTripSpan(trip: TripRecord, now: Date): CalendarEvent[] {
  const status = tripStatusToEventStatus(trip, now);
  if (status === null) return [];
  if (!isValidKey(trip.startDate) || !isValidKey(trip.endDate)) return [];

  const destination = destinations.find((d) => d.id === trip.destinationId);
  const spanDays = daysBetweenKeys(trip.startDate, trip.endDate) + 1;
  const events: CalendarEvent[] = [];
  for (let offset = 0; offset < spanDays && offset < 60; offset += 1) {
    const date = addDaysToKey(trip.startDate, offset);
    events.push({
      id: `tripspan_${trip.id}_${date}`,
      source: "trip",
      type: "trip",
      title: trip.name,
      date,
      location: destination
        ? `${destination.city}, ${destination.country}`
        : undefined,
      description: trip.description,
      tripId: trip.id,
      tripName: trip.name,
      status,
    });
  }
  return events;
}

function itineraryActivitiesToEvents(
  trip: TripRecord,
  now: Date,
): CalendarEvent[] {
  const record = itineraryService.readItineraryByTrip(trip.id);
  if (!record || record.activities.length === 0) return [];
  const dayDateById = new Map(record.days.map((day) => [day.id, day.date]));
  const status = tripStatusToEventStatus(trip, now) ?? "planned";

  const toEvent = (activity: ItineraryActivity): CalendarEvent | null => {
    const date = dayDateById.get(activity.dayId);
    if (!date || !isValidKey(date)) return null;
    return {
      id: `itin_${activity.id}`,
      source: "itinerary",
      type: eventTypeForActivity(activity.category),
      title: activity.name,
      date,
      startTime: activity.startTime,
      endTime: activity.endTime,
      location: activity.location || undefined,
      description: activity.description || undefined,
      tripId: trip.id,
      tripName: trip.name,
      status,
    };
  };

  return record.activities
    .map(toEvent)
    .filter((event): event is CalendarEvent => event !== null);
}

/* ── Service ───────────────────────────────────────────────────── */

export interface CalendarConflictCheck {
  eventId?: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
}

export const calendarService = {
  /** Full composed stream. The dataset is small; views filter client-side. */
  async getEvents(): Promise<{ events: CalendarEvent[]; custom: CalendarEvent[] }> {
    await delay(READ_LATENCY_MS);
    const now = new Date();
    const trips = await tripsService.listTrips();
    const custom = readCustomEvents();

    const events: CalendarEvent[] = [...custom];
    for (const trip of trips) {
      events.push(...expandTripSpan(trip, now));
      events.push(...itineraryActivitiesToEvents(trip, now));
    }
    return { events, custom };
  },

  async checkConflicts(candidate: CalendarConflictCheck): Promise<{
    conflicts: ScheduleConflict[];
    duplicate: boolean;
    invalidRange: boolean;
  }> {
    const { events } = await this.getEvents();
    return findConflicts(candidate, events);
  },

  /* ── Standalone events ───────────────────────────────────── */

  async createCustomEvent(input: CustomEventInput): Promise<CalendarEvent> {
    await delay(MUTATION_LATENCY_MS);
    const event: CalendarEvent = {
      id: newId("evt"),
      source: "custom",
      type: input.type,
      title: input.title.trim(),
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      location: input.location?.trim() || undefined,
      description: input.description?.trim() || undefined,
      tripId: input.tripId || undefined,
      status: "planned",
    };
    writeCustomEvents([event, ...readCustomEvents()]);
    return event;
  },

  async updateCustomEvent(
    eventId: string,
    patch: UpdateCustomEventInput,
  ): Promise<CalendarEvent> {
    await delay(MUTATION_LATENCY_MS);
    const events = readCustomEvents();
    const index = events.findIndex((event) => event.id === eventId);
    if (index === -1) throw new Error("Event not found.");
    const updated: CalendarEvent = {
      ...events[index],
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.date !== undefined ? { date: patch.date } : {}),
      ...(patch.startTime !== undefined ? { startTime: patch.startTime } : {}),
      ...(patch.endTime !== undefined ? { endTime: patch.endTime } : {}),
      ...(patch.location !== undefined
        ? { location: patch.location.trim() || undefined }
        : {}),
      ...(patch.description !== undefined
        ? { description: patch.description.trim() || undefined }
        : {}),
      ...(patch.tripId !== undefined ? { tripId: patch.tripId || undefined } : {}),
      ...(patch.type !== undefined ? { type: patch.type } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    };
    events[index] = updated;
    writeCustomEvents(events);
    return updated;
  },

  async deleteCustomEvent(eventId: string): Promise<void> {
    await delay(MUTATION_LATENCY_MS);
    writeCustomEvents(
      readCustomEvents().filter((event) => event.id !== eventId),
    );
  },

  /**
   * Drag & drop persistence for standalone events — moves date and/or
   * shifts the time window by whole minutes.
   */
  async moveCustomEvent(
    eventId: string,
    move: { date?: string; shiftMinutes?: number },
  ): Promise<CalendarEvent> {
    await delay(MUTATION_LATENCY_MS);
    const events = readCustomEvents();
    const index = events.findIndex((event) => event.id === eventId);
    if (index === -1) throw new Error("Event not found.");
    const current = events[index];
    const shift = move.shiftMinutes ?? 0;
    const startMinutes = minutesFromTime(current.startTime ?? "09:00");
    const endMinutes = minutesFromTime(current.endTime ?? "10:00");
    const fmt = (total: number) => {
      const clamped = Math.max(0, Math.min(24 * 60, total));
      return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`;
    };
    const updated: CalendarEvent = {
      ...current,
      ...(move.date ? { date: move.date } : {}),
      startTime: fmt(startMinutes + shift),
      endTime: fmt(endMinutes + shift),
    };
    if (minutesFromTime(updated.endTime!) <= minutesFromTime(updated.startTime!)) {
      throw new Error("The moved window would end before it starts.");
    }
    events[index] = updated;
    writeCustomEvents(events);
    return updated;
  },

  /* ── Itinerary-backed mutations (drag support) ───────────── */

  /**
   * Moves a planned activity onto another calendar date by re-binding it
   * to the itinerary day covering that date.
   */
  async moveItineraryActivity(
    tripId: string,
    activityId: string,
    targetDate: string,
  ): Promise<void> {
    await delay(MUTATION_LATENCY_MS);
    const record = itineraryService.readItineraryByTrip(tripId);
    const day = record?.days.find((candidate) => candidate.date === targetDate);
    if (!day) {
      throw new Error("That date sits outside the trip — extend the trip dates first.");
    }
    await itineraryService.moveActivityToDay(tripId, activityId, day.id);
  },

  async updateItineraryActivityTime(
    tripId: string,
    activityId: string,
    times: { startTime: string; endTime: string },
  ): Promise<void> {
    await delay(MUTATION_LATENCY_MS);
    if (
      minutesFromTime(times.endTime) <= minutesFromTime(times.startTime)
    ) {
      throw new Error("End time must be after the start time.");
    }
    await itineraryService.updateActivity(tripId, activityId, times);
  },
};
