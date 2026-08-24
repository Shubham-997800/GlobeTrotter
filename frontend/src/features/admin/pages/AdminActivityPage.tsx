import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, UserPlus, Map } from "lucide-react";
import { useAdminDashboard } from "../useAdmin";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; badgeVariant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  user_registered: { icon: <UserPlus className="h-4 w-4" />, badgeVariant: "default", label: "User" },
  trip_created: { icon: <Map className="h-4 w-4" />, badgeVariant: "secondary", label: "Trip" },
};

export function AdminActivityPage() {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Activity Feed</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">Failed to load activity feed.</p>
      </div>
    );
  }

  const feed = data?.activityFeed ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Activity Feed</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
          ) : (
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" aria-hidden="true" />

              {feed.map((item, i) => {
                const config = TYPE_CONFIG[item.type] ?? { icon: <Activity className="h-4 w-4" />, badgeVariant: "outline" as const, label: "System" };
                return (
                  <div key={i} className="relative flex gap-4 py-3">
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border">
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={config.badgeVariant} className="text-[10px]">{config.label}</Badge>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
