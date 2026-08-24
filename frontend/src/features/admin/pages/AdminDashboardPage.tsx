import { Users, Map, MapPin, Ticket, TrendingUp, Activity, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAdminDashboard } from "../useAdmin";

export function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Platform overview and key metrics" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Platform overview and key metrics" />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-destructive font-medium">Failed to load dashboard</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  const kpiCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      bg: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Trips",
      value: stats?.totalTrips ?? 0,
      icon: Map,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Destinations",
      value: stats?.totalDestinations ?? 0,
      icon: MapPin,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Activities",
      value: stats?.totalActivities ?? 0,
      icon: Ticket,
      bg: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  const maxCount = data?.popularDestinations?.length
    ? Math.max(...data.popularDestinations.map(d => d.count))
    : 1;
  const maxRole = stats?.roleBreakdown && Object.values(stats.roleBreakdown).length
    ? Math.max(...Object.values(stats.roleBreakdown).map(Number))
    : 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Platform overview and key metrics" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-2.5 ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Popular Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.popularDestinations?.length ? (
              <div className="space-y-3">
                {data.popularDestinations.map((d, idx) => (
                  <div key={d.destination} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize truncate">
                          {d.destination.replace(/-/g, " ")}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2 shrink-0">{d.count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(d.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trip data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.activityFeed?.length ? (
              <div className="relative space-y-4 max-h-80 overflow-y-auto">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                {data.activityFeed.slice(0, 10).map((item, i) => (
                  <div key={i} className="relative flex gap-3">
                    <div
                      className={`relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-background ${
                        item.type === "user_registered"
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {stats?.roleBreakdown && Object.keys(stats.roleBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.roleBreakdown).map(([role, count]) => {
                const numericCount = count as number;
                return (
                  <div key={role} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{role}</span>
                      <span className="text-sm text-muted-foreground">{numericCount}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          role === "admin"
                            ? "bg-primary"
                            : role === "user"
                              ? "bg-blue-500"
                              : "bg-muted-foreground"
                        }`}
                        style={{ width: `${(numericCount / maxRole) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
