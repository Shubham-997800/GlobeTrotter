import { describe, expect, it } from "vitest";

import { formatCount, formatRelativeTime } from "./community-format";

describe("formatCount", () => {
  it("leaves small numbers untouched", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(42)).toBe("42");
    expect(formatCount(999)).toBe("999");
  });

  it("compacts thousands with one decimal under 10K", () => {
    expect(formatCount(1200)).toBe("1.2K");
    expect(formatCount(9800)).toBe("9.8K");
  });

  it("rounds to whole K at 10K and above", () => {
    expect(formatCount(12_400)).toBe("12K");
    expect(formatCount(999_000)).toBe("999K");
  });

  it("compacts millions", () => {
    expect(formatCount(1_500_000)).toBe("1.5M");
    expect(formatCount(24_000_000)).toBe("24M");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-08-22T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it("says just now under a minute", () => {
    expect(formatRelativeTime(ago(5_000), now)).toBe("just now");
  });

  it("formats minutes, hours and days", () => {
    expect(formatRelativeTime(ago(2 * 60_000), now)).toBe("2m ago");
    expect(formatRelativeTime(ago(3 * 3_600_000), now)).toBe("3h ago");
    expect(formatRelativeTime(ago(2 * 86_400_000), now)).toBe("2d ago");
  });

  it("formats weeks then falls back to a date label", () => {
    expect(formatRelativeTime(ago(2 * 7 * 86_400_000), now)).toBe("2w ago");
    const stale = formatRelativeTime(ago(60 * 86_400_000), now);
    expect(stale).not.toMatch(/ago/);
  });

  it("returns an empty string for invalid input", () => {
    expect(formatRelativeTime("not-a-date", now)).toBe("");
  });
});
