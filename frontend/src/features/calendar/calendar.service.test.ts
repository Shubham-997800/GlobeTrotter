import { beforeEach, describe, expect, it } from "vitest";

import { calendarService } from "./calendar.service";
import { itineraryService } from "@/features/trips/itinerary.service";
import { tripsService } from "@/features/trips/trips.service";
import type { TripRecord } from "@/features/trips/trips.types";
import { emptyTripDraft } from "@/features/trips/schemas/create-trip.schema";

beforeEach(() => {
  localStorage.clear();
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
