import { Users, Map, MapPin, Ticket, TrendingUp, Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "../components/StatCard";
import { useAdminDashboard } from "../useAdmin";

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Total Trips"
          value={stats?.totalTrips ?? 0}
          icon={<Map className="h-4 w-4" />}
        />
        <StatCard
          title="Destinations"
          value={stats?.totalDestinations ?? 0}
          icon={<MapPin className="h-4 w-4" />}
        />
        <StatCard
          title="Activities"
          value={stats?.totalActivities ?? 0}
          icon={<Ticket className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular destinations */}
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
                {data.popularDestinations.map((d) => (
                  <div key={d.destination} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {d.destination.replace(/-/g, " ")}
                    </span>
                    <Badge variant="secondary">{d.count} trips</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trip data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.activityFeed?.length ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.activityFeed.slice(0, 10).map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === "user_registered" ? "default" : "secondary"} className="text-[10px]">
                        {item.type === "user_registered" ? "User" : "Trip"}
                      </Badge>
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-16">
                      {new Date(item.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role breakdown */}
      {stats?.roleBreakdown && Object.keys(stats.roleBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {Object.entries(stats.roleBreakdown).map(([role, count]) => (
                <div key={role} className="flex items-center gap-2">
                  <Badge variant={role === "admin" ? "default" : "outline"}>
                    {role}
                  </Badge>
                  <span className="text-sm font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
