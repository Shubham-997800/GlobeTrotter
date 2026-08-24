import { destinations as tripDestinations } from "@/features/trips/trips.data";
import { tripsService } from "@/features/trips/trips.service";
import type {
  Destination as CatalogDestination,
  TripRecord,
} from "@/features/trips/trips.types";
import {
  formatDateOnly,
  parseDateOnly,
} from "@/features/trips/trips.utils";

import {
  destinations,
  featuredSlides,
  notifications,
  quickActions,
  recentActivity,
  regions,
  trips as demoTrips,
} from "./dashboard.data";
import type {
  ActivityEvent,
  AppNotification,
  Destination,
  FeaturedSlide,
  Insight,
  QuickActionDef,
  Region,
  Trip,
} from "./dashboard.types";

const SAVED_DESTINATIONS_KEY = "globetrotter.dashboard.saved-destinations";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800";

export interface DashboardSnapshot {
  featuredSlides: FeaturedSlide[];
  destinations: Destination[];
  regions: Region[];
  myTrips: Trip[];
  recentActivity: ActivityEvent[];
  notifications: AppNotification[];
  insights: Insight[];
  quickActions: QuickActionDef[];
}

/** Simulated network latency until a real backend replaces this module. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveDestination(
  destinationId: string,
): CatalogDestination | undefined {
  const needle = destinationId.trim().toLowerCase();
  return tripDestinations.find((d) => d.city.toLowerCase() === needle);
}

function recordToTrip(record: TripRecord): Trip {
  const start = parseDateOnly(record.startDate);
  const end = parseDateOnly(record.endDate);
  const now = new Date();

  let status: Trip["status"] = "upcoming";
  if (start && end) {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const nowTime = now.getTime();
    if (nowTime < startTime) status = "upcoming";
    else if (nowTime > endTime) status = "completed";
    else status = "ongoing";
  }

  const totalDays =
    start && end
      ? Math.max(
          1,
          Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1,
        )
      : 1;

  let progress = record.status === "draft" ? 0 : 15;
  let currentDay: Trip["currentDay"];
  if (status === "ongoing" && start) {
    const day = Math.min(
      totalDays,
      Math.max(
        1,
        Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1,
      ),
    );
    currentDay = { day, of: totalDays };
    progress = Math.round(((day - 1) / totalDays) * 100);
  } else if (status === "completed") {
    progress = 100;
  }

  const suggested = resolveDestination(record.destinationId);

  return {
    id: record.id,
    name: record.name || "Untitled Trip",
    destinations: [suggested?.city ?? record.destinationId],
    country: suggested?.country ?? "",
    status,
    startDate: formatDateOnly(record.startDate),
    endDate: formatDateOnly(record.endDate),
    progress,
    currentDay,
    budget: { spentInr: 0, totalInr: record.budgetAmount },
    image: record.coverImage || suggested?.image || FALLBACK_IMAGE,
    imageAlt:
      suggested?.imageAlt ?? `${record.name || "Trip"} cover photograph`,
  };
}

export async function loadDashboard(): Promise<DashboardSnapshot> {
  await delay(700);

  const records = await tripsService.listTrips();
  const realTrips = records.map(recordToTrip);
  const myTrips = [...realTrips, ...demoTrips];

  const completedCount = myTrips.filter((t) => t.status === "completed").length;
  const ongoingCount = myTrips.filter((t) => t.status === "ongoing").length;
  const upcomingCount = myTrips.filter((t) => t.status === "upcoming").length;

  const insights: Insight[] = [
    {
      id: "i-1",
      label: "Total Trips",
      value: `${myTrips.length}`,
      trend: `${completedCount} completed`,
      trendDirection: "up",
    },
    {
      id: "i-2",
      label: "Ongoing",
      value: `${ongoingCount}`,
      trend: ongoingCount > 0 ? "Currently traveling" : "No active trips",
      trendDirection: "up",
    },
    {
      id: "i-3",
      label: "Upcoming",
      value: `${upcomingCount}`,
      trend: upcomingCount > 0 ? "Ready to explore" : "Plan your next trip",
      trendDirection: "up",
    },
    {
      id: "i-4",
      label: "Destinations",
      value: `${new Set(myTrips.flatMap((t) => t.destinations)).size}`,
      trend: "Unique cities",
      trendDirection: "up",
    },
  ];

  return {
    featuredSlides,
    destinations,
    regions,
    myTrips,
    recentActivity,
    notifications,
    insights,
    quickActions,
  };
}

/* ── Saved destination bookmarks ─────────────────────────────── */

function readSavedDestinationIds(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_DESTINATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function readSavedDestinations(): string[] {
  return readSavedDestinationIds();
}

export function toggleSavedDestination(destinationId: string): string[] {
  const ids = readSavedDestinationIds();
  const nextIds = ids.includes(destinationId)
    ? ids.filter((id) => id !== destinationId)
    : [...ids, destinationId];
  try {
    window.localStorage.setItem(
      SAVED_DESTINATIONS_KEY,
      JSON.stringify(nextIds),
    );
  } catch {
    // Storage unavailable (private mode) — keep in-memory behaviour only.
  }
  return nextIds;
}
