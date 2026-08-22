export type NotificationType =
  | "trip-reminder"
  | "activity-reminder"
  | "trip-shared"
  | "community-like"
  | "community-comment"
  | "system"
  | "important-alert";

export type NotificationCategory =
  | "trips"
  | "activities"
  | "community"
  | "system";

export interface NotificationActor {
  name: string;
  avatarUrl?: string;
}

/**
 * Persisted notification record. `timestamp` is an ISO string so it can be
 * formatted relatively at render time.
 */
export interface AppNotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  category: NotificationCategory;
  href?: string;
  actor?: NotificationActor;
}

/** Shape consumed by the bell dropdown in the app shell. */
export interface BellNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
}

export const NOTIFICATION_FILTERS = [
  "all",
  "unread",
  "trips",
  "activities",
  "community",
  "system",
] as const;

export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number];
