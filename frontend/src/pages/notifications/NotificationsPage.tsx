import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlarmClock,
  AlertTriangle,
  BellOff,
  CalendarCheck,
  CheckCheck,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Settings,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/avatar";
import { EmptyState, ErrorState } from "@/features/dashboard/components/States";
import { formatRelativeTime } from "@/features/community/community-format";
import type {
  AppNotificationItem,
  NotificationFilter,
  NotificationType,
} from "@/features/notifications/notifications.types";
import { NOTIFICATION_FILTERS } from "@/features/notifications/notifications.types";
import {
  useClearNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useNotifications,
} from "@/features/notifications/useNotifications";
import { cn } from "@/lib/utils";

interface TypeStyle {
  icon: LucideIcon;
  iconClass: string;
}

const TYPE_STYLES: Record<NotificationType, TypeStyle> = {
  "trip-reminder": {
    icon: CalendarCheck,
    iconClass: "bg-primary/10 text-primary",
  },
  "activity-reminder": {
    icon: AlarmClock,
    iconClass: "bg-activity/10 text-activity",
  },
  "trip-shared": {
    icon: Share2,
    iconClass: "bg-travel-blue/10 text-travel-blue",
  },
  "community-like": {
    icon: Heart,
    iconClass: "bg-travel-blue/10 text-travel-blue",
  },
  "community-comment": {
    icon: MessageCircle,
    iconClass: "bg-travel-blue/10 text-travel-blue",
  },
  system: {
    icon: Settings,
    iconClass: "bg-muted text-muted-foreground",
  },
  "important-alert": {
    icon: AlertTriangle,
    iconClass: "bg-destructive/10 text-destructive",
  },
};

const FILTER_LABELS: Record<NotificationFilter, string> = {
  all: "All",
  unread: "Unread",
  trips: "Trips",
  activities: "Activities",
  community: "Community",
  system: "System",
};

function matchesFilter(
  item: AppNotificationItem,
  filter: NotificationFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "unread") return !item.read;
  return item.category === filter;
}

/** Full notifications page — filters, per-item actions and bulk clearing. */
export function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [clearOpen, setClearOpen] = useState(false);

  const query = useNotifications();
  const markRead = useMarkNotificationRead();
  const markUnread = useMarkNotificationUnread();
  const markAllRead = useMarkAllNotificationsRead();
  const removeOne = useDeleteNotification();
  const clearAll = useClearNotifications();

  const items = query.data ?? [];
  const unreadCount = items.filter((n) => !n.read).length;

  const visible = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [items, filter],
  );

  const openItem = (item: AppNotificationItem) => {
    if (!item.read) markRead.mutate(item.id);
    if (item.href) navigate(item.href);
  };

  return (
    <AppShell
      crumbs={[
        { label: "Home", to: "/dashboard" },
        { label: "Notifications" },
      ]}
    >
      <div className="space-y-6">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Notifications
              </h1>
              <span
                aria-live="polite"
                aria-label={`${unreadCount} unread notifications`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  unreadCount > 0
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {query.isFetching ? (
                  <Loader2
                    className="size-3 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                {unreadCount} unread
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Trip reminders, community activity and product updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={unreadCount === 0 || markAllRead.isPending}
            >
              {markAllRead.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCheck className="size-4" aria-hidden="true" />
              )}
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClearOpen(true)}
              disabled={items.length === 0}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Clear all
            </Button>
          </div>
        </div>

        {/* ── Filters ────────────────────────────────────────── */}
        <div
          role="tablist"
          aria-label="Filter notifications"
          className="flex flex-wrap gap-2"
        >
          {NOTIFICATION_FILTERS.map((id) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary text-white dark:text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {FILTER_LABELS[id]}
              </button>
            );
          })}
        </div>

        {/* ── List / states ──────────────────────────────────── */}
        {query.isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading notifications">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title={
              filter === "unread" ? "No unread notifications" : "You're all caught up"
            }
            description="New trip reminders, likes and comments will show up here."
          />
        ) : (
          <ul className="space-y-2.5">
            {visible.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onOpen={() => openItem(item)}
                onToggleRead={() =>
                  item.read
                    ? markUnread.mutate(item.id)
                    : markRead.mutate(item.id)
                }
                onDelete={() => removeOne.mutate(item.id)}
                busy={markRead.isPending && markRead.variables === item.id}
              />
            ))}
          </ul>
        )}
      </div>

      {/* ── Clear-all confirmation ───────────────────────────── */}
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes every notification, including unread
              ones. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive"
              onClick={(event) => {
                event.preventDefault();
                setClearOpen(false);
                clearAll.mutate();
              }}
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

/* ── Row ─────────────────────────────────────────────────────── */

interface NotificationRowProps {
  item: AppNotificationItem;
  onOpen: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
  busy?: boolean;
}

function NotificationRow({
  item,
  onOpen,
  onToggleRead,
  onDelete,
  busy,
}: NotificationRowProps) {
  const style = TYPE_STYLES[item.type];
  const Icon = style.icon;

  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border p-4 transition-colors",
        item.read
          ? "border-border bg-card hover:border-primary/30 hover:bg-surface-hover"
          : "border-primary/30 bg-primary-subtle dark:bg-primary/5 hover:border-primary/50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity",
          item.read ? "opacity-0" : "opacity-100",
        )}
      />

      {item.actor ? (
        <UserAvatar
          name={item.actor.name}
          src={item.actor.avatarUrl}
          className="size-10 shrink-0"
        />
      ) : (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            style.iconClass,
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm",
              item.read
                ? "font-medium text-foreground"
                : "font-semibold text-foreground",
            )}
          >
            {item.title}
          </span>
          {!item.read ? (
            <span
              aria-label="Unread"
              className="size-2 shrink-0 rounded-full bg-primary"
            />
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
          {item.description}
        </span>
        <span className="mt-1 block text-xs text-disabled-text">
          {formatRelativeTime(item.timestamp)}
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            aria-label={`Actions for ${item.title}`}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <MoreHorizontal className="size-4" aria-hidden="true" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={onToggleRead}>
            <CheckCheck className="size-4" aria-hidden="true" />
            {item.read ? "Mark as unread" : "Mark as read"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={onDelete}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
