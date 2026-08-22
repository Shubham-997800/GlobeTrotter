import { describe, expect, it } from "vitest";

import {
  budgetSummary,
  estimateSpendingInr,
  formatDateOnly,
  parseDateOnly,
  tripDuration,
} from "./trips.utils";
import type { BudgetTierDef, Destination } from "./trips.types";

const tier = (multiplier: number | null): BudgetTierDef => ({
  id: "moderate",
  label: "Moderate",
  description: "",
  costMultiplier: multiplier,
  split: { stay: 35, transport: 20, activities: 20, food: 20, other: 5 },
});

const destination: Destination = {
  id: "dst_kyoto",
  city: "Kyoto",
  country: "Japan",
  description: "",
  image: "",
  imageAlt: "",
  rating: 4.8,
  reviews: 120,
  estimatedDailyCostInr: 5000,
  tags: ["culture", "history"],
};

describe("parseDateOnly", () => {
  it("parses a YYYY-MM-DD string as UTC midnight", () => {
    const date = parseDateOnly("2026-04-12");
    expect(date).not.toBeNull();
    expect(date?.toISOString()).toBe("2026-04-12T00:00:00.000Z");
  });

  it("returns null for malformed input", () => {
    expect(parseDateOnly("12/04/2026")).toBeNull();
    expect(parseDateOnly("")).toBeNull();
    expect(parseDateOnly("2026-13-01")).toBeNull();
  });
});

describe("tripDuration", () => {
  it("counts a same-day trip as 1 day / 0 nights", () => {
    expect(tripDuration("2026-05-01", "2026-05-01")).toEqual({
      days: 1,
      nights: 0,
    });
  });

  it("computes a classic week as 7 days / 6 nights", () => {
    expect(tripDuration("2026-05-01", "2026-05-07")).toEqual({
      days: 7,
      nights: 6,
    });
  });

  it("is timezone-safe across month and DST boundaries", () => {
    // Feb has 28 days in 2026; US DST starts Mar 8.
    expect(tripDuration("2026-02-27", "2026-03-09")?.days).toBe(11);
  });

  it("returns null when the end precedes the start", () => {
    expect(tripDuration("2026-05-07", "2026-05-01")).toBeNull();
  });

  it("returns null for missing dates", () => {
    expect(tripDuration("", "2026-05-07")).toBeNull();
    expect(tripDuration("2026-05-01", "")).toBeNull();
  });
});

describe("formatDateOnly", () => {
  it("formats without timezone drift", () => {
    expect(formatDateOnly("2026-04-12")).toBe("12 Apr 2026");
  });

  it("falls back to the raw value for invalid input", () => {
    expect(formatDateOnly("not-a-date")).toBe("not-a-date");
  });
});

describe("estimateSpendingInr", () => {
  it("multiplies daily cost by days and the tier multiplier", () => {
    const duration = { days: 7, nights: 6 };
    expect(
      estimateSpendingInr({
        destination,
        duration,
        tier: tier(1.5),
      }),
    ).toBe(52_500);
  });

  it("treats a null multiplier as neutral (×1)", () => {
    expect(
      estimateSpendingInr({ destination, duration: { days: 2, nights: 1 }, tier: tier(null) }),
    ).toBe(10_000);
  });

  it("returns null without a destination or duration", () => {
    expect(estimateSpendingInr({ duration: { days: 2, nights: 1 }, tier: tier(1) })).toBeNull();
    expect(estimateSpendingInr({ destination, duration: null, tier: tier(1) })).toBeNull();
  });
});

describe("budgetSummary", () => {
  it("derives remaining budget from total minus estimate", () => {
    const summary = budgetSummary({
      amount: 60_000,
      destination,
      duration: { days: 7, nights: 6 },
      tier: tier(1),
    });
    expect(summary.total).toBe(60_000);
    expect(summary.estimated).toBe(35_000);
    expect(summary.remaining).toBe(25_000);
  });

  it("keeps remaining null while the estimate is unknown", () => {
    const summary = budgetSummary({
      amount: 10_000,
      destination: undefined,
      duration: null,
      tier: tier(1),
    });
    expect(summary.remaining).toBeNull();
  });
});
