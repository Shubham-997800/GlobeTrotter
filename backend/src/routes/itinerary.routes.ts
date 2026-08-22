import { Router, type Request } from "express";
import { z } from "zod";

import { ApiError, asyncHandler } from "../lib/api-error.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { fetchOwnedTrip, toRecord, type TripRow } from "./trips.routes.js";

export const itineraryRouter = Router();

/* ── Schemas (mirror frontend ActivityInput / StopInput / patches) ─ */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const ACTIVITY_CATEGORIES = [
  "adventure",
  "culture",
  "food",
  "nature",
  "custom",
] as const;

const activityInputSchema = z.object({
  dayId: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(""),
  category: z.enum(ACTIVITY_CATEGORIES),
  location: z.string().trim().max(200).default(""),
  startTime: z.string().regex(TIME_RE, "startTime must be HH:mm"),
  endTime: z.string().regex(TIME_RE, "endTime must be HH:mm"),
  estimatedCostInr: z.coerce.number().min(0).max(10_000_000),
  image: z.string().trim().max(2048).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  catalogActivityId: z.string().trim().max(160).optional(),
  source: z.enum(["catalog", "custom"]).optional(),
});

const activityPatchSchema = activityInputSchema.partial();

const stopInputSchema = z.object({
  destinationId: z.string().trim().min(1).max(120),
  /** Denormalized display name set from the catalog on add. */
  destinationName: z.string().trim().min(1).max(200),
  arrivalDate: z.string().regex(DATE_RE),
  departureDate: z.string().regex(DATE_RE),
});

const stopPatchSchema = stopInputSchema.partial();

const dayPatchSchema = z.object({
  notes: z.string().max(2000).optional(),
  destinationId: z.string().trim().max(120).nullable().optional(),
});

const orderedIdsSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1).max(160)).min(0).max(500),
});

const moveSchema = z.object({ dayId: z.string().trim().min(1).max(80) });

const duplicateDaySchema = z.object({
  targetDayId: z.string().trim().min(1).max(80),
});

function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ApiError(
      "INVALID_REQUEST",
      issue ? `${issue.path.join(".") || "body"}: ${issue.message}` : "Invalid request body.",
    );
  }
  return result.data;
}

/* ── Itinerary document store (camelCase JSONB, zero remapping) ──── */

interface StoredStop {
  id: string;
  destinationId: string;
  destinationName: string;
  arrivalDate: string;
  departureDate: string;
  order: number;
}

interface StoredDay {
  id: string;
  date: string;
  destinationId: string | null;
  notes: string;
}

interface StoredActivity {
  id: string;
  dayId: string;
  catalogActivityId?: string;
  source?: "catalog" | "custom";
  name: string;
  description: string;
  category: (typeof ACTIVITY_CATEGORIES)[number];
  location: string;
  startTime: string;
  endTime: string;
  estimatedCostInr: number;
  image?: string;
  imageAlt?: string;
  order: number;
}

interface ItineraryDoc {
  stops: StoredStop[];
  days: StoredDay[];
  activities: StoredActivity[];
}

interface ItineraryRow {
  trip_id: string;
  document: ItineraryDoc;
  updated_at: string | null;
}

function enumerateDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  let guard = 0;
  while (cursor.getTime() <= end.getTime() && guard < 370) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return dates.length > 0 ? dates : [startDate];
}

function emptyDoc(): ItineraryDoc {
  return { stops: [], days: [], activities: [] };
}

/** One day per trip date; preserves existing day data by date (mock parity). */
function deriveDays(trip: Pick<TripRow, "start_date" | "end_date">, existing: StoredDay[]): StoredDay[] {
  return enumerateDates(trip.start_date, trip.end_date).map((date) => {
    const previous = existing.find((day) => day.date === date);
    return previous ?? { id: `day_${date}`, date, destinationId: null, notes: "" };
  });
}

async function loadItinerary(userId: string, tripId: string): Promise<{ trip: TripRow; doc: ItineraryDoc }> {
  const trip = await fetchOwnedTrip(userId, tripId);
  const { data, error } = await getSupabaseAdmin()
    .from("trip_itineraries")
    .select("*")
    .eq("trip_id", trip.id)
    .maybeSingle<ItineraryRow>();
  if (error) throw new ApiError("SERVER_ERROR", error.message);
  const doc = data?.document ?? emptyDoc();
  return {
    trip,
    doc: {
      ...doc,
      days: deriveDays(trip, doc.days ?? []),
      activities: doc.activities ?? [],
      stops: doc.stops ?? [],
    },
  };
}

async function saveDoc(tripId: string, doc: ItineraryDoc): Promise<ItineraryDoc> {
  const now = new Date().toISOString();
  const { error } = await getSupabaseAdmin()
    .from("trip_itineraries")
    .upsert(
      { trip_id: tripId, document: doc, updated_at: now },
      { onConflict: "trip_id" },
    );
  if (error) throw new ApiError("SERVER_ERROR", error.message);
  return doc;
}

function recordResponse(tripId: string, doc: ItineraryDoc) {
  return {
    tripId,
    stops: doc.stops,
    days: doc.days,
    activities: doc.activities,
    updatedAt: new Date().toISOString(),
  };
}

function requireActivity(doc: ItineraryDoc, activityId: string): StoredActivity {
  const activity = doc.activities.find((entry) => entry.id === activityId);
  if (!activity) throw new ApiError("NOT_FOUND", "Activity not found.");
  return activity;
}

function requireDay(doc: ItineraryDoc, dayId: string): StoredDay {
  const day = doc.days.find((entry) => entry.id === dayId);
  if (!day) throw new ApiError("NOT_FOUND", "Day not found.");
  return day;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/* ── Document-level routes ───────────────────────────────────────── */

itineraryRouter.use(requireAuth);

itineraryRouter.get(
  "/:id/itinerary",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    res.json(recordResponse(trip.id, doc));
  }),
);

/** Full-document save used by autosave and manual save. */
itineraryRouter.put(
  "/:id/itinerary",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const payload = parseBody(
      z.object({
        stops: z.array(stopInputSchema.extend({ id: z.string().min(1), order: z.number().int() })).default([]),
        days: z
          .array(
            z.object({
              id: z.string().min(1),
              date: z.string().regex(DATE_RE),
              destinationId: z.string().max(120).nullable().default(null),
              notes: z.string().max(2000).default(""),
            }),
          )
          .default([]),
        activities: z.array(activityInputSchema.extend({ id: z.string().min(1), order: z.number().int() })).default([]),
      }),
      req.body,
    );
    const saved = await saveDoc(trip.id, {
      stops: payload.stops,
      days: deriveDays(trip, payload.days),
      activities: payload.activities,
    });
    res.json(recordResponse(trip.id, saved));
  }),
);

/* ── Activities ─────────────────────────────────────────────────── */

itineraryRouter.post(
  "/:id/activities",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const input = parseBody(activityInputSchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    requireDay(doc, input.dayId);
    const activity: StoredActivity = {
      id: newId("act"),
      ...input,
      order: doc.activities.filter((a) => a.dayId === input.dayId).length,
    };
    await saveDoc(trip.id, { ...doc, activities: [...doc.activities, activity] });
    res.status(201).json(activity);
  }),
);

itineraryRouter.patch(
  "/:id/activities/:activityId",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const patch = parseBody(activityPatchSchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    requireActivity(doc, req.params.activityId);
    const activities = doc.activities.map((activity) =>
      activity.id === req.params.activityId ? { ...activity, ...patch } : activity,
    );
    await saveDoc(trip.id, { ...doc, activities });
    res.json(activities.find((a) => a.id === req.params.activityId));
  }),
);

itineraryRouter.delete(
  "/:id/activities/:activityId",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    requireActivity(doc, req.params.activityId);
    await saveDoc(trip.id, {
      ...doc,
      activities: doc.activities.filter((a) => a.id !== req.params.activityId),
    });
    res.status(204).send();
  }),
);

itineraryRouter.post(
  "/:id/activities/:activityId/duplicate",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    const source = requireActivity(doc, req.params.activityId);
    // Insert directly after the source so the copy lands in a sensible spot.
    const siblings = doc.activities
      .filter((a) => a.dayId === source.dayId)
      .sort((a, b) => a.order - b.order);
    const insertAt = siblings.findIndex((a) => a.id === source.id) + 1;
    const copy: StoredActivity = {
      ...source,
      id: newId("act"),
      name: `${source.name} (copy)`,
      order: insertAt,
    };
    const renumbered = siblings.map((sibling, index) =>
      index >= insertAt ? { ...sibling, order: index + 1 } : sibling,
    );
    const activities = [
      ...doc.activities.filter((a) => a.dayId !== source.dayId),
      ...renumbered,
      copy,
    ];
    await saveDoc(trip.id, { ...doc, activities });
    res.status(201).json(copy);
  }),
);

itineraryRouter.post(
  "/:id/activities/:activityId/move",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { dayId } = parseBody(moveSchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    requireActivity(doc, req.params.activityId);
    requireDay(doc, dayId);
    const targetCount = doc.activities.filter((a) => a.dayId === dayId).length;
    const activities = doc.activities.map((activity) =>
      activity.id === req.params.activityId
        ? { ...activity, dayId, order: targetCount }
        : activity,
    );
    const moved = activities.find((a) => a.id === req.params.activityId)!;
    await saveDoc(trip.id, { ...doc, activities });
    res.json(moved);
  }),
);

/* ── Days ───────────────────────────────────────────────────────── */

itineraryRouter.patch(
  "/:id/days/:dayId",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const patch = parseBody(dayPatchSchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    requireDay(doc, req.params.dayId);
    const days = doc.days.map((day) =>
      day.id === req.params.dayId ? { ...day, ...patch } : day,
    );
    await saveDoc(trip.id, { ...doc, days });
    res.json(days.find((day) => day.id === req.params.dayId));
  }),
);

/** Persists a new order for one day's activities (dense unique indexes). */
itineraryRouter.patch(
  "/:id/days/:dayId/activity-order",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { orderedIds } = parseBody(orderedIdsSchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    requireDay(doc, req.params.dayId);
    const rank = new Map(orderedIds.map((id, index) => [id, index]));
    const dayActivities = doc.activities
      .filter((activity) => activity.dayId === req.params.dayId)
      .map((activity) => ({
        ...activity,
        order: rank.get(activity.id) ?? activity.order,
      }))
      .sort((a, b) => a.order - b.order)
      .map((activity, index) => ({ ...activity, order: index }));
    await saveDoc(trip.id, {
      ...doc,
      activities: [
        ...doc.activities.filter((a) => a.dayId !== req.params.dayId),
        ...dayActivities,
      ],
    });
    res.json(recordResponse(trip.id, { ...doc, activities: [...doc.activities.filter((a) => a.dayId !== req.params.dayId), ...dayActivities] }));
  }),
);

itineraryRouter.delete(
  "/:id/days/:dayId/activities",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    requireDay(doc, req.params.dayId);
    await saveDoc(trip.id, {
      ...doc,
      activities: doc.activities.filter((a) => a.dayId !== req.params.dayId),
    });
    res.status(204).send();
  }),
);

/** Copies every activity onto another day with brand-new IDs. */
itineraryRouter.post(
  "/:id/days/:dayId/duplicate",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { targetDayId } = parseBody(duplicateDaySchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    requireDay(doc, req.params.dayId);
    requireDay(doc, targetDayId);
    const source = doc.activities
      .filter((a) => a.dayId === req.params.dayId)
      .sort((a, b) => a.order - b.order);
    const copies = source.map((activity, index) => ({
      ...activity,
      id: newId("act"),
      dayId: targetDayId,
      order:
        doc.activities.filter((a) => a.dayId === targetDayId).length + index,
    }));
    await saveDoc(trip.id, { ...doc, activities: [...doc.activities, ...copies] });
    res.status(201).json(copies);
  }),
);

/* ── Stops (multi-city) ─────────────────────────────────────────── */

itineraryRouter.get(
  "/:id/stops",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    res.json([...doc.stops].sort((a, b) => a.order - b.order));
  }),
);

itineraryRouter.post(
  "/:id/stops",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const input = parseBody(stopInputSchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    const stop: StoredStop = { id: newId("stop"), ...input, order: doc.stops.length };
    const stops = [...doc.stops, stop];
    await saveDoc(trip.id, { ...doc, stops });
    res.status(201).json(stops.sort((a, b) => a.order - b.order));
  }),
);

itineraryRouter.patch(
  "/:id/stops/order",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { orderedIds } = parseBody(orderedIdsSchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    const rank = new Map(orderedIds.map((id, index) => [id, index]));
    const stops = doc.stops
      .map((stop) => ({ ...stop, order: rank.get(stop.id) ?? stop.order }))
      .sort((a, b) => a.order - b.order)
      .map((stop, index) => ({ ...stop, order: index }));
    await saveDoc(trip.id, { ...doc, stops });
    res.json(stops);
  }),
);

itineraryRouter.patch(
  "/:id/stops/:stopId",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const patch = parseBody(stopPatchSchema, req.body);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    const exists = doc.stops.some((stop) => stop.id === req.params.stopId);
    if (!exists) throw new ApiError("NOT_FOUND", "Stop not found.");
    const stops = doc.stops.map((stop) =>
      stop.id === req.params.stopId ? { ...stop, ...patch } : stop,
    );
    await saveDoc(trip.id, { ...doc, stops });
    res.json(stops.sort((a, b) => a.order - b.order));
  }),
);

itineraryRouter.delete(
  "/:id/stops/:stopId",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { doc } = await loadItinerary(req.userId!, trip.id);
    const stops = doc.stops
      .filter((stop) => stop.id !== req.params.stopId)
      .sort((a, b) => a.order - b.order)
      .map((stop, index) => ({ ...stop, order: index }));
    await saveDoc(trip.id, { ...doc, stops });
    res.status(204).send();
  }),
);

/* ── Completion ─────────────────────────────────────────────────── */

/** Marks planning as finished on the actual trip record. */
itineraryRouter.post(
  "/:id/complete",
  asyncHandler(async (req: Request, res) => {
    const trip = await fetchOwnedTrip(req.userId!, req.params.id);
    const { data, error } = await getSupabaseAdmin()
      .from("trips")
      .update({ status: "planned", updated_at: new Date().toISOString() })
      .eq("id", trip.id)
      .eq("user_id", req.userId!)
      .select("*")
      .single<TripRow>();
    if (error) throw new ApiError("SERVER_ERROR", error.message);
    res.json(toRecord(data));
  }),
);
