import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationsService } from "./notifications.data";

const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationsService.list(),
  });
}

export function useUnreadCount() {
  const query = useNotifications();
  const unread = query.data?.filter((n) => !n.read).length ?? 0;
  return { unread, ...query };
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => invalidate(),
  });
}

export function useMarkNotificationUnread() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markUnread(id),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Could not update that notification."),
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      invalidate();
      toast.success("All notifications marked as read.");
    },
    onError: () => toast.error("Could not mark notifications as read."),
  });
}

export function useDeleteNotification() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: string) => notificationsService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Notification deleted.");
    },
    onError: () => toast.error("Could not delete that notification."),
  });
}

export function useClearNotifications() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => notificationsService.clearAll(),
    onSuccess: () => {
      invalidate();
      toast.success("Notifications cleared.");
    },
    onError: () => toast.error("Could not clear notifications."),
  });
}
