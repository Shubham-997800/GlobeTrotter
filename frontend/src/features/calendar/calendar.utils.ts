import { parseDateOnly } from "@/features/trips/trips.utils";
import { resolveTripStatus } from "@/features/trips/my-trips.logic";
import type { TripRecord } from "@/features/trips/trips.types";
import type { ItineraryActivity } from "./calendar.types";
import type {
  CalendarEvent,
  CalendarEventType,
  CalendarFiltersState,
  EventTypeFilterId,
  ScheduleConflict,
} from "./calendar.types";

/**
 * Pure date/time math for the calendar module. Every date-only value is
 * a `YYYY-MM-DD` string handled as **UTC midnight** — the same
 * timezone-safe convention used across My Trips (`trips.utils.ts`) — so
 * a cell can never drift a day because of the viewer's offset.
 */

const DAY_MS = 86_400_000;

/* ── Date keys ─────────────────────────────────────────────────── */

/** Formats a UTC-midnight Date back into `YYYY-MM-DD`. */
export function utcToKey(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's date in the viewer's timezone, as a date key. */
export function todayKey(now: Date = new Date()): string {
  return utcToKey(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
  );
}

export function isValidKey(key: string): boolean {
  return parseDateOnly(key) !== null;
}

export function addDaysToKey(key: string, days: number): string {
  const base = parseDateOnly(key);
  if (!base) return key;
  return utcToKey(new Date(base.getTime() + days * DAY_MS));
}

/** Whole-day difference (`toKey - fromKey`). */
export function daysBetweenKeys(fromKey: string, toKey: string): number {
  const from = parseDateOnly(fromKey);
  const to = parseDateOnly(toKey);
  if (!from || !to) return 0;
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/** 0 = Monday … 6 = Sunday (the app renders Monday-first grids). */
export function mondayIndex(key: string): number {
  const date = parseDateOnly(key);
  if (!date) return 0;
  return (date.getUTCDay() + 6) % 7;
}

/* ── Month grid ────────────────────────────────────────────────── */

export interface MonthCell {
  key: string;
  dayOfMonth: number;
  inMonth: boolean;
}

/**
 * Builds the flat 42-cell Monday-first matrix covering
 * `year/monthIndex` (monthIndex is 0-based). Leading/trailing cells
 * come from neighbouring months so every week is complete.
 */
export function buildMonthMatrix(year: number, monthIndex: number): MonthCell[] {
  const firstOfMatrix = new Date(Date.UTC(year, monthIndex, 1));
  const lead = (firstOfMatrix.getUTCDay() + 6) % 7;
  const gridStart = new Date(firstOfMatrix.getTime() - lead * DAY_MS);

  return Array.from({ length: 42 }, (_, offset) => {
    const date = new Date(gridStart.getTime() + offset * DAY_MS);
    return {
      key: utcToKey(date),
      dayOfMonth: date.getUTCDate(),
      inMonth:
        date.getUTCMonth() === monthIndex && date.getUTCFullYear() === year,
    };
  });
}

export function monthTitle(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

/** Fixed Monday-first short weekday labels for the grid header. */
export function shortWeekdayLabels(): string[] {
  const monday = new Date(Date.UTC(2024, 0, 1)); // a known Monday
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" })
      .format(new Date(monday.getTime() + i * DAY_MS)),
  );
}

/** "3 – 9 Aug 2026"-style label spanning a week or arbitrary range. */
export function rangeTitle(startKey: string, endKey: string): string {
  const start = parseDateOnly(startKey);
  const end = parseDateOnly(endKey);
  if (!start || !end) return "";
  const fmt = (opts: Intl.DateTimeFormatOptions, date: Date) =>
    new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(date);
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${fmt({ day: "numeric" }, start)} – ${fmt(
      { day: "numeric", month: "long", year: "numeric" },
      end,
    )}`;
  }
  return `${fmt({ day: "numeric", month: "short" }, start)} – ${fmt(
    { day: "numeric", month: "short", year: "numeric" },
    end,
  )}`;
}

export function dayTitle(key: string): string {
  const date = parseDateOnly(key);
  if (!date) return key;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/* ── Time-of-day helpers ───────────────────────────────────────── */

export const HHMM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Minutes since midnight for an `HH:mm` string; NaN when invalid. */
export function minutesFromTime(time: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return Number.NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function timeFromMinutes(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(totalMinutes)));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Human label like "7:30 AM" without dragging in a date library. */
export function formatTimeLabel(time: string | undefined): string {
  if (!time || !HHMM_PATTERN.test(time)) return "";
  const minutes = minutesFromTime(time);
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}${mins > 0 ? `:${String(mins).padStart(2, "0")}` : ""} ${period}`;
}

/* ── Week-view geometry ────────────────────────────────────────── */

/** Grid window: 06:00 → 24:00, one row per hour. */
export const DAY_START_HOUR = 6;
export const HOUR_HEIGHT_PX = 56;

export function weekDayKeys(selectedKey: string): string[] {
  const offset = mondayIndex(selectedKey);
  const monday = addDaysToKey(selectedKey, -offset);
  return Array.from({ length: 7 }, (_, i) => addDaysToKey(monday, i));
}

export function eventTopPx(event: Pick<CalendarEvent, "startTime">): number | null {
  if (!event.startTime) return null;
  const minutes = minutesFromTime(event.startTime);
  if (Number.isNaN(minutes)) return null;
  const bounded = Math.max(minutes, DAY_START_HOUR * 60);
  return ((bounded - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT_PX;
}

export function eventHeightPx(
  event: Pick<CalendarEvent, "startTime" | "endTime">,
): number {
  const start = event.startTime ? minutesFromTime(event.startTime) : Number.NaN;
  const end = event.endTime ? minutesFromTime(event.endTime) : Number.NaN;
  const duration =
    Number.isNaN(start) || Number.isNaN(end) ? 60 : Math.max(15, end - start);
  return Math.max(28, (duration / 60) * HOUR_HEIGHT_PX - 2);
}

/**
 * Greedy column assignment for overlapping timed events within one
 * day. Returns each event paired with its lane and the total lanes in
 * its overlap cluster so widths shrink instead of stacking blindly.
 */
export function layoutTimedEvents<T extends CalendarEvent>(
  events: T[],
): { event: T; lane: number; lanes: number }[] {
  const sorted = [...events]
    .filter((event) => event.startTime)
    .sort((a, b) => {
      const diff =
        minutesFromTime(a.startTime!) - minutesFromTime(b.startTime!);
      return diff !== 0
        ? diff
        : minutesFromTime(b.endTime ?? "23:59") -
            minutesFromTime(a.endTime ?? "23:59");
    });

  const result: { event: T; lane: number; lanes: number }[] = [];
  let cluster: { item: T; index: number }[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const laneEnds: number[] = [];
    const placed: { index: number; lane: number }[] = [];
    for (const entry of cluster) {
      const start = minutesFromTime(entry.item.startTime!);
      let lane = laneEnds.findIndex((end) => end <= start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = minutesFromTime(entry.item.endTime ?? "23:59");
      placed.push({ index: entry.index, lane });
    }
    for (const { index, lane } of placed) {
      result.push({ event: sorted[index], lane, lanes: laneEnds.length });
    }
    cluster = [];
    clusterEnd = -1;
  };

  sorted.forEach((event, index) => {
    const start = minutesFromTime(event.startTime!);
    if (cluster.length > 0 && start >= clusterEnd) flush();
    cluster.push({ item: event, index });
    clusterEnd = Math.max(clusterEnd, minutesFromTime(event.endTime ?? "23:59"));
  });
  if (cluster.length > 0) flush();

  return result;
}

/* ── Conflicts ─────────────────────────────────────────────────── */

function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Finds conflicts for a candidate slot against already-known events on
 * the same date. Skips the event being edited and non-timed records.
 * Duplicate detection catches an exact title + start time repeat.
 */
export function findConflicts(
  candidate: {
    eventId?: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
  },
  existing: CalendarEvent[],
): { conflicts: ScheduleConflict[]; duplicate: boolean; invalidRange: boolean } {
  const start = minutesFromTime(candidate.startTime);
  const end = minutesFromTime(candidate.endTime);
  const invalidRange =
    Number.isNaN(start) || Number.isNaN(end) || end <= start;

  if (invalidRange) {
    return { conflicts: [], duplicate: false, invalidRange: true };
  }

  const conflicts: ScheduleConflict[] = [];
  let duplicate = false;
  const normalizedTitle = candidate.title.trim().toLowerCase();

  for (const event of existing) {
    if (event.id === candidate.eventId) continue;
    if (event.date !== candidate.date) continue;
    if (!event.startTime || !event.endTime) continue;

    if (
      !duplicate &&
      normalizedTitle &&
      event.title.trim().toLowerCase() === normalizedTitle &&
      event.startTime === candidate.startTime
    ) {
      duplicate = true;
    }

    const eventStart = minutesFromTime(event.startTime);
    const eventEnd = minutesFromTime(event.endTime);
    if (overlaps(start, end, eventStart, eventEnd) && conflicts.length < 5) {
      conflicts.push({
        eventId: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        date: event.date,
      });
    }
  }

  return { conflicts, duplicate, invalidRange };
}

/* ── Filters ───────────────────────────────────────────────────── */

/** Maps an itinerary activity category onto a semantic event type. */
export function eventTypeForActivity(
  category: ItineraryActivity["category"],
): Extract<CalendarEventType, "activity" | "food"> {
  return category === "food" ? "food" : "activity";
}

export function eventMatchesTypeFilter(
  event: CalendarEvent,
  filter: EventTypeFilterId,
): boolean {
  if (filter === "all") return true;
  if (event.type === "trip") return false;
  return event.type === filter;
}

/**
 * Applies the full filter bar to a composed event list. Activities
 * inherit their parent trip's lifecycle bucket; standalone events only
 * survive the "All trips" setting since they have no trip to derive from.
 */
export function applyCalendarFilters(
  events: CalendarEvent[],
  filters: CalendarFiltersState,
  tripsById: Map<string, TripRecord>,
  now: Date = new Date(),
): CalendarEvent[] {
  const matchesBucket = (tripId: string | undefined): boolean => {
    if (filters.trips === "all") return true;
    if (!tripId) return false;
    const trip = tripsById.get(tripId);
    if (!trip) return true; // unknown parent — keep visible rather than lose data
    const status = resolveTripStatus(trip, now);
    if (status === "draft") return false;
    return status === filters.trips;
  };

  return events.filter(
    (event) =>
      matchesBucket(event.tripId) &&
      eventMatchesTypeFilter(event, filters.eventType) &&
      (filters.status === "all" || event.status === filters.status),
  );
}
