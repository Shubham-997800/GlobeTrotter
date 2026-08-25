import { beforeEach, describe, expect, it, vi } from "vitest";

import { destinations, activities } from "./trips.data";
import { emptyTripDraft } from "./schemas/create-trip.schema";
import { tripsService } from "./trips.service";

/* ── In-memory mock stores ─────────────────────────────────────── */

const mockTrips = new Map<string, Record<string, unknown>>();
const mockBookmarks = { savedDestinations: [] as string[], savedActivities: [] as string[] };
let tripSeq = 0;

function resetMocks() {
  mockTrips.clear();
  mockBookmarks.savedDestinations = [];
  mockBookmarks.savedActivities = [];
  tripSeq = 0;
}

/* ── Mock apiClient ────────────────────────────────────────────── */

vi.mock("@/services/api/client", () => ({
  apiClient: {
    async get(url: string, config?: { params?: Record<string, string> }) {
      const p = config?.params ?? {};
      if (url === "/destinations") {
        const q = (p.q ?? "").trim().toLowerCase();
        if (!q) return { data: [] };
        return {
          data: destinations.filter(
            (d) => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q),
          ),
        };
      }
      if (url === "/destinations/recommended") {
        let result = [...destinations];
        switch (p.filter) {
          case "budget":
            result.sort((a, b) => a.estimatedDailyCostInr - b.estimatedDailyCostInr);
            break;
          case "popular":
            result.sort((a, b) => b.reviews - a.reviews);
            break;
          case "interests": {
            const interests = (p.interests ?? "").split(",").filter(Boolean);
            if (interests.length > 0) {
              result = result
                .map((d) => ({ d, score: d.tags.filter((t) => interests.includes(t)).length }))
                .filter((e) => e.score > 0)
                .sort((a, b) => b.score - a.score || b.d.rating - a.d.rating)
                .map((e) => e.d);
            } else {
              result.sort((a, b) => b.rating - a.rating);
            }
            break;
          }
        }
        return { data: result.slice(0, 6) };
      }
      if (url === "/activities") {
        let result = [...activities];
        const cat = p.category;
        if (cat && cat !== "popular") {
          result = result.filter((a) => a.category === cat);
        }
        if (cat === "popular") {
          result = result.sort((a, b) => b.costInr - a.costInr).slice(0, 6);
        }
        return { data: result };
      }
      if (url === "/trips") {
        return { data: [...mockTrips.values()] };
      }
      if (url === "/users/me/bookmarks") {
        return { data: mockBookmarks };
      }
      return { data: null };
    },
    async post(url: string, body?: Record<string, unknown>) {
      if (url === "/trips") {
        const id = `trip_${++tripSeq}`;
        const record = { id, ...body, status: body?.status ?? "planned", createdAt: new Date().toISOString() };
        mockTrips.set(id, record);
        return { data: record };
      }
      if (url === "/users/me/saved-activities") {
        const id = body?.id as string;
        const idx = mockBookmarks.savedActivities.indexOf(id);
        if (idx >= 0) mockBookmarks.savedActivities.splice(idx, 1);
        else mockBookmarks.savedActivities.push(id);
        return { data: mockBookmarks };
      }
      return { data: null };
    },
    async put(url: string, body?: Record<string, unknown>) {
      if (url === "/trips/draft") {
        const id = `trip_${++tripSeq}`;
        const record = { id, ...body, createdAt: new Date().toISOString() };
        mockTrips.set(id, record);
        return { data: record };
      }
      return { data: null };
    },
    async patch() { return { data: null }; },
    async delete() { return { data: null }; },
  },
}));

/* ── Tests ─────────────────────────────────────────────────────── */

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
    resetMocks();
  });

  it("createTrip persists a planned record with a real id", async () => {
    const record = await tripsService.createTrip(baseDraft());
    expect(record.id).toMatch(/^trip_/);
    expect(record.status).toBe("planned");
    expect(record.budgetAmount).toBe(120_000);

    const all = await tripsService.listTrips();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(record.id);
  });

  it("saveTripDraft stores a draft without requiring full fields", async () => {
    const record = await tripsService.saveTripDraft({ ...baseDraft(), budgetAmount: "" });
    expect(record.status).toBe("draft");
    expect(record.budgetAmount).toBe(0);
  });
});

describe("tripsService saved activities", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("toggles ids on and off persistently", async () => {
    expect(await tripsService.readSavedActivityIds()).toEqual([]);

    const added = await tripsService.toggleSavedActivity("act_1");
    expect(added).toEqual(["act_1"]);

    const added2 = await tripsService.toggleSavedActivity("act_2");
    expect(added2).toEqual(["act_1", "act_2"]);

    const removed = await tripsService.toggleSavedActivity("act_1");
    expect(removed).toEqual(["act_2"]);
  });
});
