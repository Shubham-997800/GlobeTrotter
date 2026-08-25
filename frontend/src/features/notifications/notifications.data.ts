import { apiClient } from "@/services/api/client";
import type { AppNotificationItem, NotificationType } from "./notifications.types";

export const NOTIFICATION_TYPE_META: Record<NotificationType, { label: string }> = {
  "trip-reminder": { label: "Trip reminder" },
  "activity-reminder": { label: "Activity reminder" },
  "trip-shared": { label: "Trip shared" },
  "community-like": { label: "New like" },
  "community-comment": { label: "New comment" },
  system: { label: "System update" },
  "important-alert": { label: "Important alert" },
};

/**
 * Real notifications service — backend-backed via /api/notifications.
 */
export const notificationsService = {
  async list(): Promise<AppNotificationItem[]> {
    const { data } = await apiClient.get<{ notifications: AppNotificationItem[] }>("/notifications");
    return (data.notifications ?? []).sort(
      (a, b) => b.timestamp.localeCompare(a.timestamp),
    );
  },

  async markRead(id: string): Promise<void> {
    await apiClient.post("/notifications/read", { id });
  },

  async markUnread(id: string): Promise<void> {
    await apiClient.post("/notifications/unread", { id });
  },

  async markAllRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async clearAll(): Promise<void> {
    await apiClient.delete("/notifications");
  },
};
