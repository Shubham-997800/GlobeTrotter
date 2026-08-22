import {
  currencySymbol,
  demoRateFromInr,
} from "./trips.data";
import type { BudgetTierDef, Destination } from "./trips.types";

/* ── Dates ────────────────────────────────────────────────────── */

/**
 * Parses a `YYYY-MM-DD` date-only string as UTC midnight. Parsing with
 * `new Date(str)` directly would shift the day in negative-offset
 * timezones — this keeps every calculation off-by-one safe.
 */
export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Reject Date rollover (e.g. "2026-13-01" → Jan 2027, "2026-02-30" → Mar 2)
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export interface TripDuration {
  days: number;
  nights: number;
}

/** Whole-day difference between two `YYYY-MM-DD` strings (UTC math). */
export function tripDuration(
  startDate: string,
  endDate: string,
): TripDuration | null {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end || end < start) return null;
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return { days: nights + 1, nights };
}

/** Formats a `YYYY-MM-DD` string as e.g. "12 Apr 2026" without TZ drift. */
export function formatDateOnly(value: string): string {
  const date = parseDateOnly(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateRange(start: string, end: string): string {
  if (!start || !end) return "";
  return `${formatDateOnly(start)} – ${formatDateOnly(end)}`;
}

/* ── Money ────────────────────────────────────────────────────── */

/** Converts an INR catalog amount into the trip's display currency. */
function convertFromInr(amountInr: number, currency: string): number {
  const rate = demoRateFromInr[currency] ?? 1;
  // Yen has no minor unit worth rounding to.
  const decimals = currency === "JPY" || currency === "INR" ? 0 : 2;
  return Number((amountInr * rate).toFixed(decimals));
}

export function formatMoney(amountInr: number, currency: string): string {
  const value = convertFromInr(amountInr, currency);
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatMoneyRaw(amount: number, currencyCode: string): string {
  return `${currencySymbol(currencyCode)}${new Intl.NumberFormat("en").format(amount)}`;
}

/* ── Budget estimation ────────────────────────────────────────── */

const NEUTRAL_MULTIPLIER = 1;

/**
 * Heuristic spending estimate for the budget summary. Uses the selected
 * destination's per-day cost and the tier multiplier — clearly labelled
 * as an estimate in the UI, never presented as authoritative pricing.
 */
export function estimateSpendingInr(input: {
  destination?: Destination | undefined;
  duration: TripDuration | null;
  tier: BudgetTierDef;
}): number | null {
  if (!input.destination || !input.duration) return null;
  const multiplier = input.tier.costMultiplier ?? NEUTRAL_MULTIPLIER;
  return Math.round(
    input.destination.estimatedDailyCostInr *
      input.duration.days *
      multiplier,
  );
}

export interface BudgetSummary {
  total: number;
  estimated: number | null;
  remaining: number | null;
}

export function budgetSummary(input: {
  amount: number;
  destination?: Destination | undefined;
  duration: TripDuration | null;
  tier: BudgetTierDef;
}): BudgetSummary {
  const estimated =
    estimateSpendingInr({
      destination: input.destination,
      duration: input.duration,
      tier: input.tier,
    }) ?? null;
  return {
    total: input.amount,
    estimated,
    remaining:
      estimated === null ? null : Number((input.amount - estimated).toFixed(2)),
  };
}
