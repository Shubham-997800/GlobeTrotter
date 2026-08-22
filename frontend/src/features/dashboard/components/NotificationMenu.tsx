import { Bell, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppNotification } from "../dashboard.types";
import { cn } from "@/lib/utils";

interface NotificationMenuProps {
  items: AppNotification[];
}

/** Bell trigger + unread dot + popover with mark-as-read. */
export function NotificationMenu({ items }: NotificationMenuProps) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const unreadCount = items.filter((n) => n.unread && !readIds.has(n.id)).length;

  const markAllRead = () => setReadIds(new Set(items.map((n) => n.id)));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold text-destructive-foreground"
            >
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-sm text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Check className="h-3 w-3" aria-hidden="true" />
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          items.map((n) => {
            const isUnread = n.unread && !readIds.has(n.id);
            return (
              <DropdownMenuItem
                key={n.id}
                onSelect={() => setReadIds((prev) => new Set(prev).add(n.id))}
                className="items-start gap-2.5 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    isUnread ? "bg-primary" : "bg-transparent",
                  )}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {n.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {n.description}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-disabled-text">
                    {n.timestamp}
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
