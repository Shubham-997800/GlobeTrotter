import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Wallet } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/features/dashboard/components/States";
import { useItinerary, useTrip } from "@/features/trips/useItinerary";
import { currencySymbol } from "@/features/trips/trips.data";

export function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const tripQuery = useTrip(tripId);
  const itineraryQuery = useItinerary(tripId);
  const trip = tripQuery.data;
  const itinerary = itineraryQuery.data;

  const data = useMemo(() => {
    if (!trip || !itinerary) return null;
    const costs = itinerary.activities.reduce(
      (sum, a) => sum + a.estimatedCostInr,
      0,
    );
    const categories: Record<string, number> = {};
    for (const a of itinerary.activities) {
      categories[a.category] =
        (categories[a.category] ?? 0) + a.estimatedCostInr;
    }
    return {
      budget: trip.budgetAmount,
      currency: trip.currency,
      spent: costs,
      remaining: trip.budgetAmount - costs,
      pct: trip.budgetAmount > 0 ? (costs / trip.budgetAmount) * 100 : 0,
      categories,
    };
  }, [trip, itinerary]);

  const isLoading = tripQuery.isLoading || itineraryQuery.isLoading;

  return (
    <AppShell
      crumbs={[
        { label: "Home", to: "/dashboard" },
        { label: "My Trips", to: "/trips" },
        { label: trip?.name ?? "Trip", to: trip ? `/trips/${trip.id}` : "/trips" },
        { label: "Budget" },
      ]}
    >
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-1 -ml-2 text-muted-foreground"
          asChild
        >
          <Link to={trip ? `/trips/${trip.id}` : "/trips"}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to trip
          </Link>
        </Button>

        {tripQuery.isError ? (
          <ErrorState
            title="Trip not found"
            description="This trip may have been deleted."
            onRetry={() => void tripQuery.refetch()}
          />
        ) : null}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">
                  {currencySymbol(data.currency)}
                  {data.budget.toLocaleString()}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Est. Activity Cost</p>
                <p className="text-2xl font-bold text-foreground">
                  {currencySymbol(data.currency)}
                  {data.spent.toLocaleString()}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    data.remaining < 0 ? "text-destructive" : "text-foreground",
                  )}
                >
                  {currencySymbol(data.currency)}
                  {data.remaining.toLocaleString()}
                </p>
              </Card>
            </div>

            <Card className="p-5">
              <p className="text-sm font-semibold text-foreground">Budget Progress</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    data.pct > 100 ? "bg-destructive" : "bg-primary",
                  )}
                  style={{ width: `${Math.min(data.pct, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {data.pct.toFixed(0)}% of budget allocated to activities
              </p>
            </Card>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                By Category
              </h3>
              <div className="space-y-2">
                {Object.keys(data.categories).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No activity costs recorded yet.
                  </p>
                ) : (
                  Object.entries(data.categories).map(([cat, amount]) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between rounded-lg border border-subtle-border px-3 py-2.5"
                    >
                      <span className="text-sm capitalize text-foreground">{cat}</span>
                      <span className="text-sm font-medium text-foreground">
                        {currencySymbol(data.currency)}
                        {amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={trip ? `/trips/${trip.id}/itinerary` : "/trips"}>
                  <Wallet className="mr-1.5 h-4 w-4" /> Manage Itinerary
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

export default BudgetPage;
