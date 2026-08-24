import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { useAdminAnalytics } from "../useAdmin";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
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
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{data?.totalUsers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Trips</p>
            <p className="text-2xl font-bold">{data?.totalTrips ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Avg Trip Duration</p>
            <p className="text-2xl font-bold">{data?.avgTripDuration ?? 0} days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
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

        {/* Trips Over Time */}
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

        {/* Budget Distribution */}
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

        {/* Trip Status Breakdown */}
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
