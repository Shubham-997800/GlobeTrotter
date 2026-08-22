import { describe, expect, it } from "vitest";

import {
  HHMM_PATTERN,
  addDaysToKey,
  applyCalendarFilters,
  buildMonthMatrix,
  dayTitle,
  daysBetweenKeys,
  eventHeightPx,
  eventMatchesTypeFilter,
  eventTopPx,
  eventTypeForActivity,
  findConflicts,
  formatTimeLabel,
  isValidKey,
  layoutTimedEvents,
  minutesFromTime,
  mondayIndex,
  monthTitle,
  rangeTitle,
  timeFromMinutes,
  todayKey,
  utcToKey,
  weekDayKeys,
} from "./calendar.utils";
import type { CalendarEvent } from "./calendar.types";
import type { TripRecord } from "@/features/trips/trips.types";

const NOW = new Date("2026-08-22T12:00:00Z");

const makeEvent = (overrides: Partial<CalendarEvent>): CalendarEvent => ({
  id: "evt_1",
  source: "custom",
  type: "activity",
  title: "Museum visit",
  date: "2026-09-02",
  startTime: "09:00",
  endTime: "10:00",
  status: "planned",
  ...overrides,
});

const makeTrip = (
  overrides: Partial<TripRecord> & { startDate: string; endDate: string },
): TripRecord => ({
  id: "trip_1",
  name: "Kyoto escape",
  destinationId: "dst_kyoto",
  interests: [],
  budgetTier: "moderate",
  currency: "INR",
  budgetAmount: 50_000,
  status: "planned",
  createdAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("date keys", () => {
  it("round-trips UTC dates and adds days", () => {
    expect(utcToKey(new Date(Date.UTC(2026, 7, 22)))).toBe("2026-08-22");
    expect(addDaysToKey("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDaysToKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("computes whole-day differences", () => {
    expect(daysBetweenKeys("2026-08-20", "2026-08-25")).toBe(5);
    expect(daysBetweenKeys("2026-08-25", "2026-08-20")).toBe(-5);
  });

  it("validates keys and maps Monday-first weekday indexes", () => {
    expect(isValidKey("2026-08-22")).toBe(true);
    expect(isValidKey("22-08-2026")).toBe(false);
    expect(mondayIndex("2024-01-01")).toBe(0); // Monday
    expect(mondayIndex("2026-08-23")).toBe(6); // Sunday
  });

  it("derives today's key from local calendar parts", () => {
    expect(todayKey(new Date(2026, 7, 22, 23, 30))).toBe("2026-08-22");
  });
});

describe("month matrix", () => {
  it("builds a 42-cell Monday-first grid for August 2026", () => {
    const cells = buildMonthMatrix(2026, 7);
    expect(cells).toHaveLength(42);
    expect(cells[0].key).toBe("2026-07-27"); // leading Monday
    expect(cells[0].inMonth).toBe(false);
    const first = cells.find((cell) => cell.key === "2026-08-01");
    expect(first?.inMonth).toBe(true);
    expect(first?.dayOfMonth).toBe(1);
  });

  it("labels months and weekdays", () => {
    expect(monthTitle(2026, 7)).toBe("August 2026");
    expect(monthTitle(2026, 0)).toBe("January 2026");
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    expect(labels.every((label) => label.length === 3)).toBe(true);
  });
});

describe("titles", () => {
  it("formats same-month and cross-month ranges", () => {
    expect(rangeTitle("2026-08-03", "2026-08-09")).toBe(
      "3 – 9 August 2026",
    );
    expect(rangeTitle("2026-07-27", "2026-08-02")).toBe(
      "27 Jul – 2 Aug 2026",
    );
  });

  it("formats day titles in UTC", () => {
    expect(dayTitle("2026-08-22")).toBe("Saturday, 22 August 2026");
  });
});

describe("time helpers", () => {
  it("parses strict HH:mm into minutes", () => {
    expect(minutesFromTime("09:30")).toBe(570);
    expect(Number.isNaN(minutesFromTime("9:30"))).toBe(true);
    expect(HHMM_PATTERN.test("23:59")).toBe(true);
    expect(HHMM_PATTERN.test("24:00")).toBe(false);
  });

  it("formats minutes back with clamping", () => {
    expect(timeFromMinutes(570)).toBe("09:30");
    expect(timeFromMinutes(-5)).toBe("00:00");
    expect(timeFromMinutes(1500)).toBe("24:00");
  });

  it("renders friendly 12-hour labels", () => {
    expect(formatTimeLabel("07:30")).toBe("7:30 AM");
    expect(formatTimeLabel("12:00")).toBe("12 PM");
    expect(formatTimeLabel("13:05")).toBe("1:05 PM");
    expect(formatTimeLabel(undefined)).toBe("");
    expect(formatTimeLabel("25:99")).toBe("");
  });
});

describe("week geometry", () => {
  it("returns the Monday-starting week around a key", () => {
    const keys = weekDayKeys("2026-08-22"); // Saturday
    expect(keys[0]).toBe("2026-08-17");
    expect(keys[6]).toBe("2026-08-23");
  });

  it("positions events inside the 06:00–24:00 window", () => {
    expect(eventTopPx({ startTime: undefined })).toBeNull();
    expect(eventTopPx({ startTime: "06:00" })).toBe(0);
    expect(eventTopPx({ startTime: "05:00" })).toBe(0); // clamped
    expect(eventTopPx({ startTime: "08:30" })).toBe(140);
  });

  it("sizes events with sane minimums", () => {
    expect(eventHeightPx({ startTime: "09:00", endTime: "10:00" })).toBe(54);
    expect(eventHeightPx({ startTime: "09:00" })).toBe(54); // default hour
    expect(eventHeightPx({ startTime: "09:00", endTime: "09:05" })).toBe(28);
  });
});

describe("layoutTimedEvents", () => {
  it("assigns lanes only within overlap clusters", () => {
    const a = makeEvent({ id: "a", startTime: "09:00", endTime: "10:00" });
    const b = makeEvent({ id: "b", startTime: "09:30", endTime: "10:30" });
    const c = makeEvent({ id: "c", startTime: "11:00", endTime: "12:00" });
    const allDay = makeEvent({ id: "d", startTime: undefined });

    const placed = layoutTimedEvents([allDay, c, b, a]);
    const byId = new Map(placed.map((entry) => [entry.event.id, entry]));

    expect(byId.get("d")).toBeUndefined(); // all-day excluded
    expect(byId.get("a")?.lane).toBe(0);
    expect(byId.get("b")?.lane).toBe(1);
    expect(byId.get("c")?.lanes).toBe(1); // own cluster
    expect(byId.get("a")?.lanes).toBe(2); // shared cluster width
  });
});

describe("findConflicts", () => {
  const existing = [
    makeEvent({ id: "e1", title: "Temple tour" }),
    makeEvent({
      id: "e2",
      title: "Temple tour",
      startTime: "14:00",
      endTime: "15:00",
      date: "2026-09-03",
    }),
  ];

  it("flags overlapping events on the same date", () => {
    const result = findConflicts(
      { date: "2026-09-02", startTime: "09:30", endTime: "10:30", title: "Lunch" },
      existing,
    );
    expect(result.conflicts.map((conflict) => conflict.eventId)).toEqual(["e1"]);
    expect(result.duplicate).toBe(false);
    expect(result.invalidRange).toBe(false);
  });

  it("skips the edited event and other dates", () => {
    const result = findConflicts(
      {
        eventId: "e1",
        date: "2026-09-02",
        startTime: "09:30",
        endTime: "10:30",
        title: "Temple tour",
      },
      existing,
    );
    expect(result.conflicts).toHaveLength(0);
  });

  it("detects exact duplicate title + start time", () => {
    const result = findConflicts(
      { date: "2026-09-02", startTime: "09:00", endTime: "11:00", title: "temple TOUR" },
      existing,
    );
    expect(result.duplicate).toBe(true);
  });

  it("reports invalid ranges without conflicts", () => {
    const backwards = findConflicts(
      { date: "2026-09-02", startTime: "11:00", endTime: "10:00", title: "X" },
      existing,
    );
    expect(backwards.invalidRange).toBe(true);

    const garbage = findConflicts(
      { date: "2026-09-02", startTime: "aa:00", endTime: "12:00", title: "X" },
      existing,
    );
    expect(garbage.invalidRange).toBe(true);
  });
});

describe("filters", () => {
  it("maps activity categories to event types", () => {
    expect(eventTypeForActivity("food")).toBe("food");
    expect(eventTypeForActivity("attractions" as never)).toBe("activity");
    expect(eventTypeForActivity("custom")).toBe("activity");
  });

  it("matches type filters and always drops trip spans when specific", () => {
    const span = makeEvent({ type: "trip", source: "trip" });
    const food = makeEvent({ type: "food" });
    expect(eventMatchesTypeFilter(span, "all")).toBe(true);
    expect(eventMatchesTypeFilter(span, "food")).toBe(false);
    expect(eventMatchesTypeFilter(food, "food")).toBe(true);
  });

  it("applies the trip bucket from parent trip status", () => {
    const upcomingTrip = makeTrip({
      id: "trip_up",
      startDate: "2026-09-01",
      endDate: "2026-09-05",
    });
    const ongoingTrip = makeTrip({
      id: "trip_on",
      startDate: "2026-08-20",
      endDate: "2026-08-25",
    });
    const draftTrip = makeTrip({
      id: "trip_draft",
      startDate: "2026-09-01",
      endDate: "2026-09-05",
      status: "draft",
    });
    const tripsById = new Map([
      ["trip_up", upcomingTrip],
      ["trip_on", ongoingTrip],
      ["trip_draft", draftTrip],
    ]);

    const events = [
      makeEvent({ id: "standalone", tripId: undefined }),
      makeEvent({ id: "upcoming_span", type: "trip", source: "trip", tripId: "trip_up" }),
      makeEvent({ id: "ongoing_item", source: "itinerary", tripId: "trip_on" }),
      makeEvent({ id: "draft_span", type: "trip", source: "trip", tripId: "trip_draft" }),
    ];

    const upcomingOnly = applyCalendarFilters(
      events,
      { trips: "upcoming", eventType: "all", status: "all" },
      tripsById,
      NOW,
    );
    expect(upcomingOnly.map((event) => event.id)).toEqual(["upcoming_span"]);

    const everything = applyCalendarFilters(
      events,
      { trips: "all", eventType: "all", status: "all" },
      tripsById,
      NOW,
    );
    expect(everything).toHaveLength(4);
  });

  it("filters by status", () => {
    const events = [
      makeEvent({ id: "planned_one", status: "planned" }),
      makeEvent({ id: "done_one", status: "completed" }),
    ];
    const done = applyCalendarFilters(
      events,
      { trips: "all", eventType: "all", status: "completed" },
      new Map(),
      NOW,
    );
    expect(done.map((event) => event.id)).toEqual(["done_one"]);
  });
});
