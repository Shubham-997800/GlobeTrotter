import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { useAdminAnalytics } from "../useAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "../components/StatCard";
import { Button } from "@/components/ui/button";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function computeTrend(data: { count: number }[] | undefined): { value: number; direction: "up" | "down" | "neutral" } | undefined {
  if (!data || data.length < 2) return undefined;
  const latest = data[data.length - 1].count;
  const prev = data[data.length - 2].count;
  if (prev === 0) return undefined;
  const pct = Math.round(((latest - prev) / prev) * 100);
  return { value: Math.abs(pct), direction: pct > 0 ? "up" : pct < 0 ? "down" : "neutral" };
}

export function AdminAnalyticsPage() {
  const { data, isLoading, isError, refetch } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid gap-4 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Platform performance and trends" />
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-destructive">Failed to load analytics.</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const userTrend = computeTrend(data?.userGrowth);
  const tripTrend = computeTrend(data?.tripsOverTime);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform performance and trends" />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard title="Total Users" value={data?.totalUsers ?? 0} trend={userTrend} />
        <StatCard title="Total Trips" value={data?.totalTrips ?? 0} trend={tripTrend} />
        <StatCard title="Avg Trip Duration" value={`${data?.avgTripDuration ?? 0} days`} />
        <StatCard title="Budget Tiers" value={data?.budgetDistribution?.length ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <CardContent>
            {data?.userGrowth?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Users" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Trips Over Time</CardTitle></CardHeader>
          <CardContent>
            {data?.tripsOverTime?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.tripsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Trips" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Budget Distribution</CardTitle></CardHeader>
          <CardContent>
            {data?.budgetDistribution?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.budgetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tier, percent }) => `${tier} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="tier"
                  >
                    {data.budgetDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Trip Status</CardTitle></CardHeader>
          <CardContent>
            {data?.statusBreakdown && Object.keys(data.statusBreakdown).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.statusBreakdown).map(([status, count]) => ({ status, count }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                  >
                    {Object.entries(data.statusBreakdown).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
