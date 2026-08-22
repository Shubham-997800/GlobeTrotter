import { beforeEach, describe, expect, it } from "vitest";

import { destinations } from "./trips.data";
import { emptyTripDraft } from "./schemas/create-trip.schema";
import { tripsService } from "./trips.service";

const baseDraft = () => ({
  ...emptyTripDraft(),
  name: "  Kyoto Escape  ",
  startDate: "2026-04-01",
  endDate: "2026-04-07",
  destinationId: destinations[0]?.id ?? "",
  interests: ["culture" as const],
  budgetAmount: "120000",
});

describe("tripsService.searchDestinations", () => {
  it("returns no results for an empty query", async () => {
    expect(await tripsService.searchDestinations("   ")).toEqual([]);
  });

  it("matches cities case-insensitively", async () => {
    const results = await tripsService.searchDestinations("kyoto");
    expect(results.some((d) => d.city === "Kyoto")).toBe(true);
  });

  it("matches countries too", async () => {
    const results = await tripsService.searchDestinations("japan");
    expect(results.every((d) => d.country === "Japan")).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});

describe("tripsService.getSuggestedDestinations", () => {
  it("'budget' sorts by daily cost ascending", async () => {
    const results = await tripsService.getSuggestedDestinations("budget", []);
    const costs = results.map((d) => d.estimatedDailyCostInr);
    expect([...costs].sort((a, b) => a - b)).toEqual(costs);
  });

  it("'popular' sorts by review count descending", async () => {
    const results = await tripsService.getSuggestedDestinations("popular", []);
    const reviews = results.map((d) => d.reviews);
    expect([...reviews].sort((a, b) => b - a)).toEqual(reviews);
  });

  it("'interests' only returns destinations sharing at least one tag", async () => {
    const results = await tripsService.getSuggestedDestinations("interests", ["beaches"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((d) => d.tags.includes("beaches"))).toBe(true);
  });

  it("'interests' falls back to top-rated when no interests chosen", async () => {
    const results = await tripsService.getSuggestedDestinations("interests", []);
    const ratings = results.map((d) => d.rating);
    expect([...ratings].sort((a, b) => b - a)).toEqual(ratings);
  });
});

describe("tripsService.getActivities", () => {
  it("'popular' returns at most six activities", async () => {
    const results = await tripsService.getActivities("popular");
    expect(results.length).toBeLessThanOrEqual(6);
  });

  it("filters by category", async () => {
    const results = await tripsService.getActivities("food");
    expect(results.every((a) => a.category === "food")).toBe(true);
  });
});

describe("tripsService drafts and records", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("createTrip persists a planned record with a real id", async () => {
    const record = await tripsService.createTrip(baseDraft());
    expect(record.id).toMatch(/^trip_/);
    expect(record.name).toBe("Kyoto Escape");
    expect(record.status).toBe("planned");
    expect(record.budgetAmount).toBe(120_000);

    const all = await tripsService.listTrips();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(record.id);
  });

  it("createTrip clears the active autosave draft", async () => {
    tripsService.writeActiveDraft(baseDraft());
    await tripsService.createTrip(baseDraft());
    expect(tripsService.readActiveDraft()).toBeNull();
  });

  it("saveTripDraft stores a draft without requiring full fields", async () => {
    const record = await tripsService.saveTripDraft({ ...baseDraft(), budgetAmount: "" });
    expect(record.status).toBe("draft");
    expect(record.budgetAmount).toBe(0);
  });

  it("active draft round-trips through write/read/clear", () => {
    tripsService.writeActiveDraft(baseDraft());
    expect(tripsService.readActiveDraft()?.name).toBe("  Kyoto Escape  ");
    tripsService.clearActiveDraft();
    expect(tripsService.readActiveDraft()).toBeNull();
  });
});

describe("tripsService saved activities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("toggles ids on and off persistently", () => {
    expect(tripsService.readSavedActivityIds()).toEqual([]);

    const added = tripsService.toggleSavedActivity("act_1");
    expect(added).toEqual(["act_1"]);

    // Persisted beyond the return value
    expect(tripsService.readSavedActivityIds()).toEqual(["act_1"]);
    expect(tripsService.toggleSavedActivity("act_2")).toEqual(["act_1", "act_2"]);

    const removed = tripsService.toggleSavedActivity("act_1");
    expect(removed).toEqual(["act_2"]);
  });
});
