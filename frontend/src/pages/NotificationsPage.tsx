import { useState } from "react";
import { Bell, Check, CheckCheck, Heart, MessageCircle, Plane, Settings, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/features/dashboard/components/States";
import { notifications as seedNotifications } from "@/features/dashboard/dashboard.data";
import type { AppNotification } from "@/features/dashboard/dashboard.types";

type FilterKey = "all" | "unread" | "trips" | "activities" | "community" | "system";

function iconFor(type: AppNotification["type"]) {
  switch (type) {
    case "trip":
      return <Plane className="h-4 w-4" />;
    case "activity":
      return <Bell className="h-4 w-4" />;
    case "like":
      return <Heart className="h-4 w-4" />;
    case "comment":
      return <MessageCircle className="h-4 w-4" />;
    case "follow":
      return <UserPlus className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
}

export function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>(seedNotifications);
  const [filter, setFilter] = useState<FilterKey>("all");

  const unreadCount = items.filter((n) => n.unread).length;

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return n.unread;
    return n.type === filter;
  });

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const markRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    toast.success("Notifications cleared");
  };

  return (
    <AppShell
      crumbs={[{ label: "Home", to: "/dashboard" }, { label: "Notifications" }]}
      title="Notifications"
      description="Stay up to date with your trips, activities and community."
      actions={
        unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        ) : undefined
      }
    >
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)} className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <TabsList className="flex w-full gap-1 overflow-x-auto sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={filter} className="space-y-2">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              description="New notifications about your trips and community will appear here."
            />
          ) : (
            filtered.map((n) => (
              <Card
                key={n.id}
                className={`flex items-start gap-3 p-4 ${n.unread ? "border-primary/40 bg-primary/5" : ""}`}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {iconFor(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {n.unread ? (
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.timestamp}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {n.unread ? (
                    <Button variant="ghost" size="icon" onClick={() => markRead(n.id)} aria-label="Mark as read">
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="icon" onClick={() => remove(n.id)} aria-label="Remove notification">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}

          {filtered.length > 0 ? (
            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

export default NotificationsPage;
