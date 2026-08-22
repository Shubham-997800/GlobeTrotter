import type { AppNotificationItem, NotificationType } from "./notifications.types";

const STORAGE_KEY = "globetrotter.notifications";
const LATENCY_MS = 400;

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

/** Seed shown the first time the app opens (mirrors dashboard mock data). */
export const seedNotifications: AppNotificationItem[] = [
  {
    id: "ntf_001",
    type: "trip-reminder",
    title: "Trip starts in 3 days",
    description: "Kyoto in Cherry Blossom Season begins on March 28. Finish your packing list.",
    timestamp: hoursAgo(2),
    read: false,
    category: "trips",
    href: "/trips",
  },
  {
    id: "ntf_002",
    type: "activity-reminder",
    title: "Fushimi Inari hike tomorrow",
    description: "Scheduled for 7:00 AM · Kyoto. Leave early to beat the crowds.",
    timestamp: hoursAgo(5),
    read: false,
    category: "activities",
    href: "/calendar",
  },
  {
    id: "ntf_003",
    type: "community-like",
    title: "Aisha liked your post",
    description: "\"Hidden gems of Lisbon\" received a new like.",
    timestamp: hoursAgo(9),
    read: false,
    category: "community",
    href: "/community",
    actor: { name: "Aisha Khan" },
  },
  {
    id: "ntf_004",
    type: "trip-shared",
    title: "Marco shared a trip with you",
    description: "Amalfi Coast Road Trip — view the itinerary he shared.",
    timestamp: hoursAgo(26),
    read: true,
    category: "trips",
    href: "/community",
    actor: { name: "Marco Rossi" },
  },
  {
    id: "ntf_005",
    type: "community-comment",
    title: "New comment on your post",
    description: "Priya asked: \"Is the night market open on Mondays?\"",
    timestamp: hoursAgo(30),
    read: true,
    category: "community",
    href: "/community",
    actor: { name: "Priya Sharma" },
  },
  {
    id: "ntf_006",
    type: "system",
    title: "Weekly travel digest is ready",
    description: "Your trips, budget and community highlights for this week.",
    timestamp: hoursAgo(52),
    read: true,
    category: "system",
    href: "/dashboard",
  },
  {
    id: "ntf_007",
    type: "important-alert",
    title: "Weather alert for Reykjavik",
    description: "Strong winds expected during your Northern Lights outing.",
    timestamp: hoursAgo(70),
    read: true,
    category: "system",
    href: "/trips",
  },
];

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  { label: string }
> = {
  "trip-reminder": { label: "Trip reminder" },
  "activity-reminder": { label: "Activity reminder" },
  "trip-shared": { label: "Trip shared" },
  "community-like": { label: "New like" },
  "community-comment": { label: "New comment" },
  system: { label: "System update" },
  "important-alert": { label: "Important alert" },
};

function readAll(): AppNotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedNotifications;
    const parsed = JSON.parse(raw) as AppNotificationItem[];
    return Array.isArray(parsed) ? parsed : seedNotifications;
  } catch {
    return seedNotifications;
  }
}

function writeAll(items: AppNotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable — mock only
  }
}

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock notifications service — localStorage-backed CRUD. Swap the bodies
 * for apiClient calls when the backend lands.
 */
export const notificationsService = {
  async list(): Promise<AppNotificationItem[]> {
    await delay();
    return [...readAll()].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  async markRead(id: string): Promise<void> {
    await delay(150);
    writeAll(readAll().map((n) => (n.id === id ? { ...n, read: true } : n)));
  },

  async markUnread(id: string): Promise<void> {
    await delay(150);
    writeAll(readAll().map((n) => (n.id === id ? { ...n, read: false } : n)));
  },

  async markAllRead(): Promise<void> {
    await delay(200);
    writeAll(readAll().map((n) => ({ ...n, read: true })));
  },

  async remove(id: string): Promise<void> {
    await delay(150);
    writeAll(readAll().filter((n) => n.id !== id));
  },

  async clearAll(): Promise<void> {
    await delay(200);
    writeAll([]);
  },
};
