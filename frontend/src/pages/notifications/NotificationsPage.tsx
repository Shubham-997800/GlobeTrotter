import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlarmClock,
  AlertTriangle,
  Bell,
  CalendarCheck,
  CheckCheck,
  Filter,
  Heart,
  Inbox,
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
import { ErrorState } from "@/features/dashboard/components/States";
import { formatRelativeTime } from "@/features/community/community-format";
import type {
  AppNotificationItem,
  NotificationCategory,
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
  action?: string;
  actionHref?: string;
}

const TYPE_STYLES: Record<NotificationType, TypeStyle> = {
  "trip-reminder": {
    icon: CalendarCheck,
    iconClass: "bg-primary/10 text-primary",
    action: "View Trip",
    actionHref: "/trips",
  },
  "activity-reminder": {
    icon: AlarmClock,
    iconClass: "bg-activity/10 text-activity",
    action: "View Activity",
    actionHref: "/explore",
  },
  "trip-shared": {
    icon: Share2,
    iconClass: "bg-travel-blue/10 text-travel-blue",
    action: "View Trip",
    actionHref: "/trips",
  },
  "community-like": {
    icon: Heart,
    iconClass: "bg-travel-blue/10 text-travel-blue",
    action: "Open Community",
    actionHref: "/community",
  },
  "community-comment": {
    icon: MessageCircle,
    iconClass: "bg-travel-blue/10 text-travel-blue",
    action: "Open Community",
    actionHref: "/community",
  },
  system: {
    icon: Settings,
    iconClass: "bg-muted text-muted-foreground",
    action: "Open Settings",
    actionHref: "/settings",
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

function groupByTime(items: AppNotificationItem[]): { label: string; items: AppNotificationItem[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const today: AppNotificationItem[] = [];
  const yesterday: AppNotificationItem[] = [];
  const earlier: AppNotificationItem[] = [];

  for (const item of items) {
    const d = new Date(item.timestamp);
    if (d >= todayStart) today.push(item);
    else if (d >= yesterdayStart) yesterday.push(item);
    else earlier.push(item);
  }

  const groups: { label: string; items: AppNotificationItem[] }[] = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (yesterday.length > 0) groups.push({ label: "Yesterday", items: yesterday });
  if (earlier.length > 0) groups.push({ label: "Earlier", items: earlier });
  return groups;
}

function getCategoryCounts(items: AppNotificationItem[]) {
  const counts: Record<string, number> = { all: items.length, unread: 0 };
  for (const item of items) {
    if (!item.read) counts.unread++;
    const cat = item.category as NotificationCategory;
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return counts;
}

/** Notifications — grouped feed, unread states, contextual actions. */
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
  const counts = useMemo(() => getCategoryCounts(items), [items]);

  const visible = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [items, filter],
  );

  const groups = useMemo(() => groupByTime(visible), [visible]);

  const openItem = (item: AppNotificationItem) => {
    if (!item.read) markRead.mutate(item.id);
    if (item.href) navigate(item.href);
  };

  const hasAny = items.length > 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Stay updated with your trips and GlobeTrotter activity.
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
              disabled={!hasAny}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_FILTERS.map((id) => {
            const active = filter === id;
            const c = counts[id] ?? 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary text-white dark:text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {FILTER_LABELS[id]}
                {c > 0 ? (
                  <span
                    className={cn(
                      "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none",
                      active
                        ? "bg-white/25 text-white dark:text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {c}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* List / states */}
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
        ) : !hasAny ? (
          /* No notifications at all */
          <div className="flex flex-col items-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Bell className="size-7 text-primary" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">No notifications yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Trip reminders, community updates and product announcements will
              appear here as they arrive.
            </p>
          </div>
        ) : visible.length === 0 ? (
          /* No results for current filter */
          <div className="flex flex-col items-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">No results</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Nothing matches the "{FILTER_LABELS[filter]}" filter. Try a
              different one.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => setFilter("all")}
            >
              <Filter className="size-4" aria-hidden="true" />
              Show all notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h2>
                <ul className="space-y-2">
                  {group.items.map((item) => (
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
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Clear-all confirmation */}
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
  const navigate = useNavigate();

  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border p-4 transition-colors",
        item.read
          ? "border-border bg-card hover:border-primary/30 hover:bg-surface-hover"
          : "border-primary/20 bg-primary/[0.03] dark:bg-primary/5 hover:border-primary/40",
      )}
    >
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

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpen}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-sm",
                item.read ? "font-medium text-foreground" : "font-semibold text-foreground",
              )}
            >
              {item.title}
            </span>
            {!item.read ? (
              <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-primary" />
            ) : null}
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {item.description}
          </span>
        </button>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-disabled-text">
            {formatRelativeTime(item.timestamp)}
          </span>
          {style.action ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (style.actionHref) navigate(style.actionHref);
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              {style.action}
            </button>
          ) : null}
        </div>
      </div>

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
