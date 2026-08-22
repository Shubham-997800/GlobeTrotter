import type {
  ItineraryActivity,
  ItineraryDay,
  ItineraryRecord,
  ItineraryStop,
  ValidationIssue,
} from "./itinerary.types";
import type { TripRecord } from "./trips.types";
import { parseDateOnly } from "./trips.utils";

/* ── Time helpers (HH:mm ↔ minutes) ──────────────────────────── */

export function parseTime(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  const [, hours, minutes] = match.map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatTime(value: string): string {
  return value;
}

/** "09:00 – 11:30 · 2h 30m" style label derived from start/end. */
export function activityDurationLabel(
  startTime: string,
  endTime: string,
): string {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (start === null || end === null || end <= start) return "";
  let minutes = end - start;
  const hours = Math.floor(minutes / 60);
  minutes %= 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function totalDurationLabel(minutes: number): string {
  if (minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/* ── Day derivation & progress ───────────────────────────────── */

export interface DayDateInfo {
  date: string;
  weekday: string;
  shortDate: string;
  fullDate: string;
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "UTC",
});
const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function describeDate(date: string): DayDateInfo | null {
  const parsed = parseDateOnly(date);
  if (!parsed) return null;
  return {
    date,
    weekday: WEEKDAY_FORMATTER.format(parsed),
    shortDate: SHORT_DATE_FORMATTER.format(parsed),
    fullDate: FULL_DATE_FORMATTER.format(parsed),
  };
}

/** Every calendar date between trip start and end (inclusive). */
export function tripDates(trip: Pick<TripRecord, "startDate" | "endDate">): string[] {
  const start = parseDateOnly(trip.startDate);
  const end = parseDateOnly(trip.endDate);
  if (!start || !end || end < start) return [];
  const dates: string[] = [];
  for (let time = start.getTime(); time <= end.getTime(); time += 86_400_000) {
    dates.push(new Date(time).toISOString().slice(0, 10));
  }
  return dates;
}

/** A day is "planned" when it holds at least one meaningful item. */
export function dayIsPlanned(
  day: ItineraryDay,
  activities: ItineraryActivity[],
): boolean {
  return activities.some((activity) => activity.dayId === day.id);
}

export interface ItineraryProgress {
  totalDays: number;
  plannedDays: number;
  percent: number;
}

export function itineraryProgress(
  record: Pick<ItineraryRecord, "days" | "activities">,
  trip: Pick<TripRecord, "startDate" | "endDate">,
): ItineraryProgress {
  const dates = tripDates(trip);
  const days = record.days.length > 0 ? record.days : [];
  const totalDays = dates.length || days.length;
  const plannedDays = days.filter((day) => dayIsPlanned(day, record.activities)).length;
  const percent =
    totalDays === 0 ? 0 : Math.round((plannedDays / totalDays) * 100);
  return { totalDays, plannedDays, percent };
}

/* ── Shared totals (single source for timeline/map/summary) ──── */

export interface DaySummary {
  activityCount: number;
  durationMinutes: number;
  costInr: number;
}

export function summarizeDay(
  activities: ItineraryActivity[],
  dayId: string,
): DaySummary {
  const dayActivities = activities.filter((activity) => activity.dayId === dayId);
  let durationMinutes = 0;
  let costInr = 0;
  for (const activity of dayActivities) {
    const start = parseTime(activity.startTime);
    const end = parseTime(activity.endTime);
    if (start !== null && end !== null && end > start) {
      durationMinutes += end - start;
    }
    costInr += activity.estimatedCostInr;
  }
  return { activityCount: dayActivities.length, durationMinutes, costInr };
}

export interface ItineraryTotals {
  totalCities: number;
  totalActivities: number;
  totalDurationMinutes: number;
  totalCostInr: number;
}

export function itineraryTotals(record: ItineraryRecord): ItineraryTotals {
  let totalDurationMinutes = 0;
  let totalCostInr = 0;
  for (const activity of record.activities) {
    const start = parseTime(activity.startTime);
    const end = parseTime(activity.endTime);
    if (start !== null && end !== null && end > start) {
      totalDurationMinutes += end - start;
    }
    totalCostInr += activity.estimatedCostInr;
  }
  return {
    totalCities: new Set(record.stops.map((stop) => stop.destinationId)).size,
    totalActivities: record.activities.length,
    totalDurationMinutes,
    totalCostInr,
  };
}

/* ── Ordering ────────────────────────────────────────────────── */

/** Reindexes activities so order values stay unique and dense. */
export function normalizeActivityOrder(activities: ItineraryActivity[]): ItineraryActivity[] {
  return [...activities]
    .sort((a, b) => a.order - b.order)
    .map((activity, index) => ({ ...activity, order: index }));
}

/** Reorders one day's activities to match `orderedIds`, densifying orders. */
export function applyActivityOrder(
  activities: ItineraryActivity[],
  dayId: string,
  orderedIds: string[],
): ItineraryActivity[] {
  const rank = new Map(orderedIds.map((id, index) => [id, index]));
  const updated = activities.map((activity) => {
    if (activity.dayId !== dayId) return activity;
    const nextOrder = rank.get(activity.id);
    return nextOrder === undefined
      ? activity
      : { ...activity, order: nextOrder };
  });
  return normalizeActivityOrder(updated.filter((a) => a.dayId === dayId))
    .concat(updated.filter((a) => a.dayId !== dayId));
}

export function sortDayActivities(
  activities: ItineraryActivity[],
  dayId: string,
): ItineraryActivity[] {
  return activities
    .filter((activity) => activity.dayId === dayId)
    .sort((a, b) => a.order - b.order);
}

/** Next free order slot for appending an activity to a day. */
export function nextActivityOrder(
  activities: ItineraryActivity[],
  dayId: string,
): number {
  return activities.filter((activity) => activity.dayId === dayId).length;
}

/* ── Overlap detection ───────────────────────────────────────── */

export interface ActivityOverlap {
  activityId: string;
  otherId: string;
  otherName: string;
  startTime: string;
  endTime: string;
}

/** Finds overlaps between an activity and its day siblings. */
export function findOverlaps(
  activities: ItineraryActivity[],
  activityId: string,
): ActivityOverlap[] {
  const target = activities.find((activity) => activity.id === activityId);
  if (!target) return [];
  const start = parseTime(target.startTime);
  const end = parseTime(target.endTime);
  if (start === null || end === null) return [];
  const overlaps: ActivityOverlap[] = [];
  for (const other of activities) {
    if (
      other.id === target.id ||
      other.dayId !== target.dayId ||
      other.startTime === undefined
    ) {
      continue;
    }
    const otherStart = parseTime(other.startTime);
    const otherEnd = parseTime(other.endTime);
    if (otherStart === null || otherEnd === null) continue;
    if (start < otherEnd && otherStart < end) {
      overlaps.push({
        activityId: target.id,
        otherId: other.id,
        otherName: other.name,
        startTime: other.startTime,
        endTime: other.endTime,
      });
    }
  }
  return overlaps;
}

/** All overlapping pairs on a single day (for inline warnings). */
export function dayOverlapPairs(activities: ItineraryActivity[]): Array<[ItineraryActivity, ItineraryActivity]> {
  const pairs: Array<[ItineraryActivity, ItineraryActivity]> = [];
  for (let i = 0; i < activities.length; i += 1) {
    for (let j = i + 1; j < activities.length; j += 1) {
      const a = activities[i];
      const b = activities[j];
      const aStart = parseTime(a.startTime);
      const aEnd = parseTime(a.endTime);
      const bStart = parseTime(b.startTime);
      const bEnd = parseTime(b.endTime);
      if (
        aStart === null ||
        aEnd === null ||
        bStart === null ||
        bEnd === null
      ) {
        continue;
      }
      if (aStart < bEnd && bStart < aEnd) {
        pairs.push([a, b]);
      }
    }
  }
  return pairs;
}

/* ── Stop helpers ────────────────────────────────────────────── */

export function stopNights(stop: ItineraryStop): number {
  const arrival = parseDateOnly(stop.arrivalDate);
  const departure = parseDateOnly(stop.departureDate);
  if (!arrival || !departure || departure < arrival) return 0;
  return Math.round((departure.getTime() - arrival.getTime()) / 86_400_000) + 1;
}

/* ── Centralized trip status derivation ──────────────────────── */

export type TripDisplayStatus = "Draft" | "Upcoming" | "Ongoing" | "Completed";

/**
 * Single source of truth for status badges. Stored status is authoritative:
 * draft stays Draft; once planned, dates decide Upcoming/Ongoing/Completed.
 */
export function tripDisplayStatus(trip: TripRecord): TripDisplayStatus {
  if (trip.status === "draft") return "Draft";
  const today = new Date().toISOString().slice(0, 10);
  if (today < trip.startDate) return "Upcoming";
  if (today > trip.endDate) return "Completed";
  return "Ongoing";
}

export const TRIP_STATUS_STYLES: Record<TripDisplayStatus, string> = {
  Draft: "border-warning-border bg-warning-bg text-warning-text",
  Upcoming: "border-info-border bg-info-bg text-info-text",
  Ongoing: "border-success-border bg-success-bg text-success-text",
  Completed: "border-subtle-border bg-muted text-muted-foreground",
};

/* ── Whole-itinerary validation ──────────────────────────────── */

export function validateItinerary(
  record: ItineraryRecord,
  trip: TripRecord,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const validDates = new Set(tripDates(trip));

  /* Days outside the trip range should never happen (days derive from
     the range), but custom data could drift — guard anyway. */
  for (const day of record.days) {
    if (!validDates.has(day.date)) {
      issues.push({
        id: `day-out-of-range-${day.id}`,
        severity: "error",
        message: `A scheduled day falls outside the trip dates (${day.date}).`,
        dayId: day.id,
      });
    }
  }

  /* Invalid durations. */
  for (const activity of record.activities) {
    const start = parseTime(activity.startTime);
    const end = parseTime(activity.endTime);
    if (start === null || end === null) {
      issues.push({
        id: `activity-time-format-${activity.id}`,
        severity: "error",
        message: `“${activity.name}” has an invalid time format.`,
        activityId: activity.id,
        dayId: activity.dayId,
      });
    } else if (end <= start) {
      issues.push({
        id: `activity-duration-${activity.id}`,
        severity: "error",
        message: `“${activity.name}” ends before or exactly when it starts.`,
        activityId: activity.id,
        dayId: activity.dayId,
      });
    }
    if (!activity.name.trim()) {
      issues.push({
        id: `activity-name-${activity.id}`,
        severity: "error",
        message: "An activity is missing a name.",
        activityId: activity.id,
        dayId: activity.dayId,
      });
    }
  }

  /* Overlapping times inside each day (warning, not blocker). */
  for (const [a, b] of dayOverlapPairs(record.activities)) {
    issues.push({
      id: `overlap-${a.id}-${b.id}`,
      severity: "warning",
      message: `“${a.name}” overlaps with “${b.name}” (${b.startTime}–${b.endTime}).`,
      activityId: a.id,
      dayId: a.dayId,
    });
  }

  /* Stops: range validity + containment in trip dates. */
  for (const stop of record.stops) {
    const arrival = stop.arrivalDate;
    const departure = stop.departureDate;
    if (departure < arrival) {
      issues.push({
        id: `stop-order-${stop.id}`,
        severity: "error",
        message: `A city stop has a departure before its arrival (${arrival} → ${departure}).`,
        stopId: stop.id,
      });
    }
    if (!validDates.has(arrival) || !validDates.has(departure)) {
      issues.push({
        id: `stop-range-${stop.id}`,
        severity: "error",
        message: "A city stop falls partially outside the trip dates.",
        stopId: stop.id,
      });
    }
  }

  /* Overlapping stop ranges where prohibited. */
  const orderedStops = [...record.stops].sort((a, b) => a.order - b.order);
  for (let i = 0; i < orderedStops.length - 1; i += 1) {
    const current = orderedStops[i];
    const next = orderedStops[i + 1];
    if (next.arrivalDate <= current.departureDate) {
      issues.push({
        id: `stop-overlap-${current.id}-${next.id}`,
        severity: "warning",
        message:
          "Two city stops share dates — adjust arrivals/departures so each city has its own window.",
        stopId: next.id,
      });
    }
  }

  return issues;
}
