import { budgetTier as findBudgetTier, destinations } from "./trips.data";
import type {
  Destination,
  MyTripStatus,
  MyTripsDateFilterId,
  MyTripsFilters,
  MyTripsSortId,
} from "./trips.types";
import type { TripRecord } from "./trips.types";
import {
  estimateSpendingInr,
  formatDateOnly,
  formatDateRange,
  formatMoney,
  formatMoneyRaw,
  parseDateOnly,
  tripDuration,
  type TripDuration,
} from "./trips.utils";

/**
 * Single source of truth for My Trips business rules:
 * status resolution, countdowns, stats, planning completion,
 * filtering and sorting. Every surface (cards, tabs, stats,
 * highlight, drafts) consumes these helpers — never re-implements them.
 */

const DAY_MS = 86_400_000;

/** Shared cover fallback so no trip ever renders a broken image. */
export const TRIP_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200";

/* ── Timezone-safe "today" ─────────────────────────────────────── */

/**
 * Today's calendar date pinned to UTC midnight. All comparisons happen
 * against `parseDateOnly` results (also UTC midnight) so a trip can never
 * flip status early/late because of the viewer's timezone offset.
 */
export function todayUtcMidnight(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/* ── Status ────────────────────────────────────────────────────── */

export interface TripCounts {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  drafts: number;
  archived: number;
}

/**
 * Draft comes from the persisted record; every other status derives from
 * date-only math. This mirrors the dashboard's derivation but stays
 * off-by-one safe across timezones.
 */
export function resolveTripStatus(
  record: Pick<TripRecord, "status" | "startDate" | "endDate">,
  now: Date = new Date(),
): MyTripStatus {
  if (record.status === "draft") return "draft";
  const start = parseDateOnly(record.startDate);
  const end = parseDateOnly(record.endDate);
  if (!start || !end) return "upcoming";
  const today = todayUtcMidnight(now).getTime();
  if (today < start.getTime()) return "upcoming";
  if (today > end.getTime()) return "completed";
  return "ongoing";
}

/** Whole-day countdown until `startDate` (0 = today, never negative). */
export function daysUntilStart(record: TripRecord, now: Date = new Date()): number | null {
  const start = parseDateOnly(record.startDate);
  if (!start) return null;
  const diff = Math.round(
    (start.getTime() - todayUtcMidnight(now).getTime()) / DAY_MS,
  );
  return Math.max(0, diff);
}

export function formatCountdown(days: number | null): string {
  if (days === null) return "";
  if (days === 0) return "Starts today";
  if (days === 1) return "Tomorrow";
  return `${days} days to go`;
}

export function isArchived(record: TripRecord): boolean {
  return Boolean(record.archivedAt);
}

/** Non-archived trips feed stats, tabs, grid and the highlight. */
export function activeTrips(records: TripRecord[]): TripRecord[] {
  return records.filter((trip) => !isArchived(trip));
}

export function computeTripCounts(records: TripRecord[], now: Date = new Date()): TripCounts {
  let upcoming = 0;
  let ongoing = 0;
  let completed = 0;
  let drafts = 0;
  let archived = 0;
  let live = 0;

  for (const record of records) {
    if (isArchived(record)) {
      archived += 1;
      continue;
    }
    live += 1;
    switch (resolveTripStatus(record, now)) {
      case "draft":
        drafts += 1;
        break;
      case "upcoming":
        upcoming += 1;
        break;
      case "ongoing":
        ongoing += 1;
        break;
      case "completed":
        completed += 1;
        break;
    }
  }

  return { total: live, upcoming, ongoing, completed, drafts, archived };
}

/** Nearest upcoming non-draft, non-archived trip — deterministic pick. */
export function findNextUpcoming(
  records: TripRecord[],
  now: Date = new Date(),
): TripRecord | null {
  return (
    activeTrips(records)
      .filter((record) => resolveTripStatus(record, now) === "upcoming")
      .sort((a, b) => {
        const byStart = (parseDateOnly(a.startDate)?.getTime() ?? Infinity) -
          (parseDateOnly(b.startDate)?.getTime() ?? Infinity);
        return byStart !== 0 ? byStart : a.id.localeCompare(b.id);
      })[0] ?? null
  );
}

/* ── Planning progress & draft completion ─────────────────────── */

export type ChecklistField =
  | "name"
  | "dates"
  | "destination"
  | "budget"
  | "interests"
  | "activities";

export interface ChecklistItem {
  field: ChecklistField;
  met: boolean;
  /** Relative weight — sums to 100 across all items. */
  weight: number;
}

function hasValidDates(record: TripRecord): boolean {
  const start = parseDateOnly(record.startDate);
  const end = parseDateOnly(record.endDate);
  return Boolean(start && end && end >= start);
}

/**
 * The ONE definition of planning completeness, shared by trip-card
 * progress bars, the draft section's completion %, missing-info chips
 * and the highlight. Weights are explicit so percentages are honest.
 */
export function tripChecklist(record: TripRecord): ChecklistItem[] {
  return [
    { field: "name", met: record.name.trim().length > 0, weight: 15 },
    { field: "dates", met: hasValidDates(record), weight: 20 },
    {
      field: "destination",
      met: destinations.some((destination) => destination.id === record.destinationId),
      weight: 25,
    },
    { field: "budget", met: record.budgetAmount > 0, weight: 15 },
    { field: "interests", met: record.interests.length > 0, weight: 10 },
    {
      field: "activities",
      met: (record.activityIds?.length ?? 0) > 0,
      weight: 15,
    },
  ];
}

export function completionPercent(record: TripRecord): number {
  const items = tripChecklist(record);
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const metWeight = items.reduce(
    (sum, item) => sum + (item.met ? item.weight : 0),
    0,
  );
  return Math.round((metWeight / totalWeight) * 100);
}

const MISSING_LABELS: Record<ChecklistField, string> = {
  name: "Missing trip name",
  dates: "Missing travel dates",
  destination: "Missing destination",
  budget: "Missing budget",
  interests: "No interests selected",
  activities: "No activities added",
};

/** Actionable gaps, derived from the same checklist (never invented). */
export function missingFields(record: TripRecord): ChecklistField[] {
  return tripChecklist(record)
    .filter((item) => !item.met)
    .map((item) => item.field);
}

export function missingFieldLabels(record: TripRecord): string[] {
  return missingFields(record).map((field) => MISSING_LABELS[field]);
}

export function planningStats(record: TripRecord): {
  percent: number;
  daysPlanned: number;
  activitiesCount: number;
} {
  const duration: TripDuration | null = tripDuration(
    record.startDate,
    record.endDate,
  );
  return {
    percent: completionPercent(record),
    daysPlanned: duration?.days ?? 0,
    activitiesCount: record.activityIds?.length ?? 0,
  };
}

/* ── Enriched view model ───────────────────────────────────────── */

export function resolveDestination(destinationId: string): Destination | undefined {
  return destinations.find((destination) => destination.id === destinationId);
}

export interface DestinationOption {
  country: string;
  cities: string[];
  count: number;
}

/** Country/city facets derived from actually-loaded trips. */
export function deriveDestinationOptions(records: TripRecord[]): DestinationOption[] {
  const byCountry = new Map<string, { cities: Set<string>; count: number }>();
  for (const record of records) {
    const destination = resolveDestination(record.destinationId);
    if (!destination) continue;
    const entry =
      byCountry.get(destination.country) ??
      { cities: new Set<string>(), count: 0 };
    entry.cities.add(destination.city);
    entry.count += 1;
    byCountry.set(destination.country, entry);
  }
  return [...byCountry.entries()]
    .map(([country, entry]) => ({
      country,
      cities: [...entry.cities].sort((a, b) => a.localeCompare(b)),
      count: entry.count,
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}

/* ── Filtering ─────────────────────────────────────────────────── */

function monthRangeUtc(now: Date): { start: number; end: number } {
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
  return { start: start.getTime(), end: end.getTime() + DAY_MS - 1 };
}

function yearRangeUtc(now: Date): { start: number; end: number } {
  const start = new Date(Date.UTC(now.getFullYear(), 0, 1));
  const end = new Date(Date.UTC(now.getFullYear(), 11, 31));
  return { start: start.getTime(), end: end.getTime() + DAY_MS - 1 };
}

function rangeOverlapsTrip(
  record: TripRecord,
  range: { start: number; end: number },
): boolean {
  const start = parseDateOnly(record.startDate)?.getTime();
  const end = parseDateOnly(record.endDate)?.getTime();
  if (!start || !end) return false;
  // Inclusive overlap between the trip span and the requested window.
  return start <= range.end && end >= range.start;
}

export function matchesDateFilter(
  record: TripRecord,
  dateFilter: MyTripsDateFilterId,
  customRange: { from: string; to: string } | undefined,
  now: Date = new Date(),
): boolean {
  const start = parseDateOnly(record.startDate)?.getTime();
  switch (dateFilter) {
    case "all":
      return true;
    case "upcoming":
      return start !== undefined && start >= todayUtcMidnight(now).getTime();
    case "month":
      return rangeOverlapsTrip(record, monthRangeUtc(now));
    case "year":
      return rangeOverlapsTrip(record, yearRangeUtc(now));
    case "custom": {
      if (!customRange?.from || !customRange.to) return true;
      const from = parseDateOnly(customRange.from)?.getTime();
      const to = parseDateOnly(customRange.to)?.getTime();
      if (from === undefined || to === undefined) return true;
      return rangeOverlapsTrip(record, { start: from, end: to + DAY_MS - 1 });
    }
  }
}

function matchesSearch(record: TripRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const destination = resolveDestination(record.destinationId);
  return [
    record.name,
    destination?.city,
    destination?.country,
    record.description,
  ]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(q));
}

/**
 * Intersection of every active filter. Archive scoping first, then
 * status tab, search, destination facet and finally the date window.
 */
export function applyMyTripsFilters(
  records: TripRecord[],
  filters: MyTripsFilters,
  now: Date = new Date(),
): TripRecord[] {
  const scoped = filters.status === "archived"
    ? records.filter(isArchived)
    : records.filter((record) => !isArchived(record));

  return scoped.filter((record) => {
    if (filters.status !== "all" && filters.status !== "archived") {
      if (filters.status === "draft") {
        if (resolveTripStatus(record, now) !== "draft") return false;
      } else if (
        record.status === "draft" ||
        resolveTripStatus(record, now) !== filters.status
      ) {
        return false;
      }
    }

    if (filters.search && !matchesSearch(record, filters.search)) return false;

    if (filters.country) {
      const destination = resolveDestination(record.destinationId);
      if (destination?.country !== filters.country) return false;
    }

    return matchesDateFilter(record, filters.dateFilter, filters.customRange, now);
  });
}

/* ── Sorting (stable, derived — never mutates query data) ──────── */

export function sortMyTrips<T extends TripRecord>(
  records: T[],
  sort: MyTripsSortId,
): T[] {
  const sorted = [...records];
  const byId = (a: T, b: T) => a.id.localeCompare(b.id);
  const timestamp = (value: string | undefined) =>
    value ? Date.parse(value) : 0;

  switch (sort) {
    case "recent":
      sorted.sort(
        (a, b) => timestamp(b.createdAt) - timestamp(a.createdAt) || byId(a, b),
      );
      break;
    case "updated":
      sorted.sort(
        (a, b) =>
          Math.max(timestamp(b.updatedAt), timestamp(b.createdAt)) -
            Math.max(timestamp(a.updatedAt), timestamp(a.createdAt)) ||
          byId(a, b),
      );
      break;
    case "alpha":
      sorted.sort(
        (a, b) => a.name.localeCompare(b.name) || byId(a, b),
      );
      break;
    case "upcoming": {
      const today = todayUtcMidnight().getTime();
      sorted.sort((a, b) => {
        const aStart = parseDateOnly(a.startDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bStart = parseDateOnly(b.startDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const aFuture = aStart >= today ? 0 : 1;
        const bFuture = bStart >= today ? 0 : 1;
        if (aFuture !== bFuture) return aFuture - bFuture;
        // Future trips: soonest first · past trips: latest ending first.
        if (aFuture === 0) return aStart - bStart || byId(a, b);
        const aEnd = parseDateOnly(a.endDate)?.getTime() ?? 0;
        const bEnd = parseDateOnly(b.endDate)?.getTime() ?? 0;
        return bEnd - aEnd || byId(a, b);
      });
      break;
    }
  }
  return sorted;
}

/* ── Labels & misc formatting ──────────────────────────────────── */

export function formatRelativeTime(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return "";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.round((now.getTime() - then) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateOnly(iso.slice(0, 10));
}

/** Human label for a raw destination id when the catalog moved on. */
export function destinationIdLabel(destinationId: string): string {
  if (!destinationId) return "";
  return destinationId
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/* ── Card view model ──────────────────────────────────────────── */

export interface TripCardModel {
  record: TripRecord;
  status: MyTripStatus;
  name: string;
  description: string;
  city: string;
  country: string;
  image: string;
  imageAlt: string;
  /** "12 Apr 2026 – 20 Apr 2026" */
  dateRange: string;
  startDateIso: string;
  duration: TripDuration | null;
  daysPlanned: number;
  activitiesCount: number;
  percent: number;
  missingLabels: string[];
  budgetTotalLabel: string;
  /** Honest heuristic estimate — null when it cannot be computed. */
  budgetEstimateLabel: string | null;
  countdownDays: number | null;
  updatedAtLabel: string;
}

/** Enriches a raw record once so every card/list surface stays in sync. */
export function createTripCardModel(
  record: TripRecord,
  now: Date = new Date(),
): TripCardModel {
  const destination = resolveDestination(record.destinationId);
  const duration = tripDuration(record.startDate, record.endDate);
  const tier = findBudgetTier(record.budgetTier);
  const { percent, daysPlanned, activitiesCount } = planningStats(record);

  const estimateInr = estimateSpendingInr({
    destination,
    duration,
    tier,
  });

  return {
    record,
    status: resolveTripStatus(record, now),
    name: record.name || "Untitled Trip",
    description: record.description ?? "",
    city: destination?.city ?? destinationIdLabel(record.destinationId),
    country: destination?.country ?? "",
    image: record.coverImage || destination?.image || TRIP_FALLBACK_IMAGE,
    imageAlt:
      destination?.imageAlt ?? `${record.name || "Trip"} cover photograph`,
    dateRange: formatDateRange(record.startDate, record.endDate),
    startDateIso: record.startDate,
    duration,
    daysPlanned,
    activitiesCount,
    percent,
    missingLabels: missingFieldLabels(record),
    budgetTotalLabel: formatMoneyRaw(record.budgetAmount, record.currency),
    budgetEstimateLabel:
      estimateInr !== null ? formatMoney(estimateInr, record.currency) : null,
    countdownDays: daysUntilStart(record, now),
    updatedAtLabel: formatRelativeTime(
      record.updatedAt ?? record.createdAt,
      now,
    ),
  };
}
