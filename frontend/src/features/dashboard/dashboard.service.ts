import { apiClient } from "@/services/api/client";
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

/**
 * Real dashboard service — loads all data from GET /api/dashboard.
 */
export async function loadDashboard(): Promise<DashboardSnapshot> {
  const { data } = await apiClient.get<DashboardSnapshot>("/dashboard");
  return data;
}

/* ── Saved destination bookmarks ─────────────────────────────── */

export async function readSavedDestinations(): Promise<string[]> {
  const { data } = await apiClient.get<{ savedDestinations: string[] }>("/users/me/bookmarks");
  return data.savedDestinations ?? [];
}

export async function toggleSavedDestination(destinationId: string): Promise<string[]> {
  const { data } = await apiClient.post<{ savedDestinations: string[] }>("/users/me/saved-destinations", { id: destinationId });
  return data.savedDestinations ?? [];
}
