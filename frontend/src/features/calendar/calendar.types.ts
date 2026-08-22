/**
 * Calendar domain types. Events are composed from three sources and
 * normalized into one shape so views never care where data came from:
 *
 *   trip      → a whole trip span (all-day, derived from TripRecord)
 *   itinerary → an activity planned in the itinerary builder (timed)
 *   custom    → a standalone calendar event (full CRUD lives here)
 */

import type { ItineraryActivity } from "@/features/trips/itinerary.types";

/** Visual/semantic event types mapped to travel entity tokens. */
export type CalendarEventType =
  | "trip"
  | "activity"
  | "food"
  | "transport"
  | "accommodation"
  | "custom";

export type CalendarEventStatus = "planned" | "completed" | "cancelled";

/** Normalized event consumed by every view. */
export interface CalendarEvent {
  id: string;
  source: "trip" | "itinerary" | "custom";
  type: CalendarEventType;
  title: string;
  /** ISO date-only `YYYY-MM-DD`. */
  date: string;
  /** `HH:mm` — omitted for all-day events (trip spans). */
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  tripId?: string;
  tripName?: string;
  status: CalendarEventStatus;
}

/** Payload for creating/updating standalone events. */
export interface CustomEventInput {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  description?: string;
  tripId?: string;
  type: Exclude<CalendarEventType, "trip">;
}

export interface UpdateCustomEventInput extends Partial<CustomEventInput> {
  status?: CalendarEventStatus;
}

/* ── View state ────────────────────────────────────────────────── */

export type CalendarViewId = "month" | "week" | "day";

export type TripFilterId = "all" | "upcoming" | "ongoing" | "completed";

export type EventTypeFilterId =
  | "all"
  | "activity"
  | "food"
  | "transport"
  | "accommodation";

export type StatusFilterId = "all" | "planned" | "completed" | "cancelled";

export interface CalendarFiltersState {
  trips: TripFilterId;
  eventType: EventTypeFilterId;
  status: StatusFilterId;
}

/** A single time-overlap finding, used by the conflict dialog. */
export interface ScheduleConflict {
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
}

/** Drag payload shared by the DnD layer across views. */
export interface EventDragData {
  eventId: string;
  source: CalendarEvent["source"];
  type: CalendarEventType;
  date: string;
  startTime?: string;
  endTime?: string;
  title: string;
  tripId?: string;
}

/** Re-export keeps view components decoupled from the trips feature. */
export type { ItineraryActivity };
