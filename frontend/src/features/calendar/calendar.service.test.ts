import { beforeEach, describe, expect, it, vi } from "vitest";

import { calendarService } from "./calendar.service";
import { itineraryService } from "@/features/trips/itinerary.service";
import { tripsService } from "@/features/trips/trips.service";
import type { TripRecord } from "@/features/trips/trips.types";
import type { ItineraryRecord, ItineraryActivity } from "@/features/trips/itinerary.types";
import { emptyTripDraft } from "@/features/trips/schemas/create-trip.schema";

/* ── In-memory mock stores ─────────────────────────────────────── */

const mockTrips = new Map<string, Record<string, unknown>>();
const mockItineraries = new Map<string, ItineraryRecord>();
let tripSeq = 0;
let actSeq = 0;

function resetMocks() {
  mockTrips.clear();
  mockItineraries.clear();
  tripSeq = 0;
  actSeq = 0;
  localStorage.clear();
}

function makeDefaultItinerary(tripId: string): ItineraryRecord {
  const startDate = "2026-09-01";
  return {
    tripId,
    days: [
      { id: "day_2026-09-01", tripId, date: startDate, notes: "" },
      { id: "day_2026-09-02", tripId, date: "2026-09-02", notes: "" },
      { id: "day_2026-09-03", tripId, date: "2026-09-03", notes: "" },
    ],
    activities: [],
    stops: [],
  };
}

/* ── Mock apiClient ────────────────────────────────────────────── */

vi.mock("@/services/api/client", () => ({
  apiClient: {
    async get(url: string) {
      // List trips
      if (url === "/trips") {
        return { data: [...mockTrips.values()] };
      }
      // Get itinerary
      const itinMatch = url.match(/^\/trips\/([^/]+)\/itinerary$/);
      if (itinMatch) {
        const tid = itinMatch[1];
        const record = mockItineraries.get(tid);
        if (!record) return { data: makeDefaultItinerary(tid) };
        return { data: record };
      }
      return { data: null };
    },
    async post(url: string, body?: Record<string, unknown>) {
      // Create trip
      if (url === "/trips") {
        const id = `trip_${++tripSeq}`;
        const days = 3;
        const record: TripRecord = {
          id,
          name: String(body?.name ?? ""),
          description: body?.description as string | undefined,
          startDate: String(body?.startDate ?? ""),
          endDate: String(body?.endDate ?? ""),
          destinationId: String(body?.destinationId ?? ""),
          interests: (body?.interests as string[]) ?? [],
          budgetTier: String(body?.budgetTier ?? "moderate"),
          currency: String(body?.currency ?? "INR"),
          budgetAmount: Number(body?.budgetAmount ?? 0),
          status: (body?.status as string) ?? "planned",
          createdAt: new Date().toISOString(),
        } as TripRecord;
        mockTrips.set(id, record);

        // Auto-create itinerary with days
        const itin = makeDefaultItinerary(id);
        mockItineraries.set(id, itin);

        return { data: record };
      }
      // Create activity
      const actMatch = url.match(/^\/trips\/([^/]+)\/activities$/);
      if (actMatch && body) {
        const tid = actMatch[1];
        let record = mockItineraries.get(tid);
        if (!record) {
          record = makeDefaultItinerary(tid);
          mockItineraries.set(tid, record);
        }
        const act: ItineraryActivity = {
          id: `act_${++actSeq}`,
          dayId: String(body.dayId ?? record.days[0].id),
          name: String(body.name ?? ""),
          description: String(body.description ?? ""),
          category: String(body.category ?? "custom") as ItineraryActivity["category"],
          location: String(body.location ?? ""),
          startTime: String(body.startTime ?? "09:00"),
          endTime: String(body.endTime ?? "10:00"),
          estimatedCostInr: Number(body.estimatedCostInr ?? 0),
          source: "custom",
        } as ItineraryActivity;
        record.activities.push(act);
        // Write to localStorage cache so readItineraryByTrip works
        localStorage.setItem(
          `globetrotter.itinerary-cache.${tid}`,
          JSON.stringify(record),
        );
        return { data: act };
      }
      // Move activity
      const moveMatch = url.match(/^\/trips\/([^/]+)\/activities\/([^/]+)\/move$/);
      if (moveMatch && body) {
        const tid = moveMatch[1];
        const aid = moveMatch[2];
        const record = mockItineraries.get(tid);
        if (!record) throw new Error("No itinerary");
        const activity = record.activities.find((a) => a.id === aid);
        if (!activity) throw new Error("Activity not found");
        activity.dayId = String(body.dayId);
        localStorage.setItem(
          `globetrotter.itinerary-cache.${tid}`,
          JSON.stringify(record),
        );
        return { data: activity };
      }
      return { data: null };
    },
    async put(url: string, body?: Record<string, unknown>) {
      // Save itinerary (full document)
      const putItinMatch = url.match(/^\/trips\/([^/]+)\/itinerary$/);
      if (putItinMatch && body) {
        const tid = putItinMatch[1];
        const record = body as ItineraryRecord;
        mockItineraries.set(tid, record);
        localStorage.setItem(
          `globetrotter.itinerary-cache.${tid}`,
          JSON.stringify(record),
        );
        return { data: record };
      }
      // Save draft
      if (url === "/trips/draft") {
        const id = `trip_${++tripSeq}`;
        const record = { id, ...body, createdAt: new Date().toISOString() };
        mockTrips.set(id, record);
        return { data: record };
      }
      return { data: null };
    },
    async patch(url: string, body?: Record<string, unknown>) {
      // Update activity
      const updActMatch = url.match(/^\/trips\/([^/]+)\/activities\/([^/]+)$/);
      if (updActMatch && body) {
        const tid = updActMatch[1];
        const aid = updActMatch[2];
        const record = mockItineraries.get(tid);
        if (!record) throw new Error("No itinerary");
        const activity = record.activities.find((a) => a.id === aid);
        if (!activity) throw new Error("Activity not found");
        Object.assign(activity, body);
        localStorage.setItem(
          `globetrotter.itinerary-cache.${tid}`,
          JSON.stringify(record),
        );
        return { data: activity };
      }
      return { data: null };
    },
    async delete() { return { data: null }; },
  },
}));

/* ── Helpers ───────────────────────────────────────────────────── */

beforeEach(() => {
  resetMocks();
});

async function makeTripWithDays(): Promise<TripRecord> {
  return tripsService.createTrip({
    ...emptyTripDraft(),
    name: "Kyoto drag test",
    startDate: "2026-09-01",
    endDate: "2026-09-03",
    destinationId: "dst_kyoto",
  });
}

/* ── Tests ─────────────────────────────────────────────────────── */

describe("calendarService custom events", () => {
  it("creates, updates and deletes standalone events", async () => {
    const created = await calendarService.createCustomEvent({
      title: "  Airport run  ",
      date: "2026-09-02",
      startTime: "06:30",
      endTime: "07:15",
      type: "transport",
    });

    expect(created.title).toBe("Airport run");
    expect(created.status).toBe("planned");
    expect(created.source).toBe("custom");

    const stored = await calendarService.getEvents();
    expect(stored.custom.some((event) => event.id === created.id)).toBe(true);

    const updated = await calendarService.updateCustomEvent(created.id, {
      title: "Airport express",
      startTime: "05:45",
      status: "completed",
    });
    expect(updated.title).toBe("Airport express");
    expect(updated.startTime).toBe("05:45");
    expect(updated.endTime).toBe("07:15");
    expect(updated.status).toBe("completed");

    await expect(
      calendarService.updateCustomEvent("evt_missing", { title: "X" }),
    ).rejects.toThrow();

    await calendarService.deleteCustomEvent(created.id);
    const after = await calendarService.getEvents();
    expect(after.custom.some((event) => event.id === created.id)).toBe(false);
  });

  it("moves standalone events across dates and shifts times", async () => {
    const created = await calendarService.createCustomEvent({
      title: "Dinner booking",
      date: "2026-09-02",
      startTime: "19:00",
      endTime: "21:00",
      type: "food",
    });

    const moved = await calendarService.moveCustomEvent(created.id, {
      date: "2026-09-03",
      shiftMinutes: -60,
    });
    expect(moved.date).toBe("2026-09-03");
    expect(moved.startTime).toBe("18:00");
    expect(moved.endTime).toBe("20:00");

    await expect(
      calendarService.moveCustomEvent(created.id, { shiftMinutes: 6 * 60 }),
    ).rejects.toThrow();
  });

  it("composes a unique event stream including customs", async () => {
    const custom = await calendarService.createCustomEvent({
      title: "Solo entry",
      date: "2026-09-02",
      startTime: "08:00",
      endTime: "09:00",
      type: "custom",
    });

    const { events } = await calendarService.getEvents();
    const ids = new Set(events.map((event) => event.id));
    expect(ids.size).toBe(events.length);
    expect(ids.has(custom.id)).toBe(true);
    for (const event of events) {
      expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("checks conflicts against the composed stream", async () => {
    const first = await calendarService.createCustomEvent({
      title: "Cooking class",
      date: "2026-09-04",
      startTime: "10:00",
      endTime: "12:00",
      type: "activity",
    });

    const clash = await calendarService.checkConflicts({
      eventId: undefined,
      date: "2026-09-04",
      startTime: "11:00",
      endTime: "13:00",
      title: "Street food walk",
    });
    expect(clash.conflicts.map((conflict) => conflict.eventId)).toContain(
      first.id,
    );

    const duplicate = await calendarService.checkConflicts({
      date: "2026-09-04",
      startTime: "10:00",
      endTime: "13:00",
      title: "cooking CLASS",
    });
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.invalidRange).toBe(false);
  });
});

describe("calendarService itinerary drag support", () => {
  it("moves activities between trip days via calendar dates", async () => {
    const trip = await makeTripWithDays();
    const record = await itineraryService.getItinerary(trip.id);
    expect(record.days.length).toBeGreaterThan(1);

    const activity = await itineraryService.addActivity(trip.id, {
      dayId: record.days[0].id,
      name: "Harbour walk",
      description: "",
      category: "custom",
      location: "",
      startTime: "16:00",
      endTime: "17:30",
      estimatedCostInr: 0,
      source: "custom",
    });

    await calendarService.moveItineraryActivity(
      trip.id,
      activity.id,
      record.days[1].date,
    );

    const movedRecord = await itineraryService.getItinerary(trip.id);
    const moved = movedRecord.activities.find(
      (entry) => entry.id === activity.id,
    );
    expect(moved?.dayId).toBe(record.days[1].id);

    await expect(
      calendarService.moveItineraryActivity(
        trip.id,
        activity.id,
        "2031-01-01",
      ),
    ).rejects.toThrow();
  });

  it("updates activity timings and rejects invalid ranges", async () => {
    const trip = await makeTripWithDays();
    const record = await itineraryService.getItinerary(trip.id);

    const activity = await itineraryService.addActivity(trip.id, {
      dayId: record.days[0].id,
      name: "Temple visit",
      description: "",
      category: "custom",
      location: "",
      startTime: "09:00",
      endTime: "10:00",
      estimatedCostInr: 0,
      source: "custom",
    });

    await calendarService.updateItineraryActivityTime(trip.id, activity.id, {
      startTime: "08:15",
      endTime: "09:45",
    });

    const refreshed = await itineraryService.getItinerary(trip.id);
    const updated = refreshed.activities.find(
      (entry) => entry.id === activity.id,
    );
    expect(updated?.startTime).toBe("08:15");
    expect(updated?.endTime).toBe("09:45");

    await expect(
      calendarService.updateItineraryActivityTime(trip.id, activity.id, {
        startTime: "10:00",
        endTime: "10:00",
      }),
    ).rejects.toThrow();
  });
});
