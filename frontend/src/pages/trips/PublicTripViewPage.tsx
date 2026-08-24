import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Globe2,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useItinerary, useTrip } from "@/features/trips/useItinerary";
import { currencySymbol } from "@/features/trips/trips.data";
import {
  formatDateRange,
  formatMoney,
  tripDuration,
} from "@/features/trips/trips.utils";

function PublicTripHero({
  trip,
}: {
  trip: NonNullable<ReturnType<typeof useTrip>["data"]>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-subtle-border bg-card">
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
        {trip.coverImage ? (
          <img
            src={trip.coverImage}
            alt={trip.name}
            loading="eager"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-5xl">🌍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {trip.name}
            </h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Public Itinerary
            </span>
          </div>
          {trip.description ? (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              {trip.description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-xl border border-subtle-border bg-background px-3 py-2.5">
            <CalendarDays className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Travel Dates</p>
              <p className="truncate text-sm font-medium">
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-subtle-border bg-background px-3 py-2.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="truncate text-sm font-medium">
                {(() => {
                  const d = tripDuration(trip.startDate, trip.endDate);
                  return d
                    ? `${d.days} ${d.days === 1 ? "day" : "days"} · ${d.nights} ${d.nights === 1 ? "night" : "nights"}`
                    : "—";
                })()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-subtle-border bg-background px-3 py-2.5">
            <Wallet className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="truncate text-sm font-medium">
                {formatMoney(trip.budgetAmount, trip.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicTripViewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const tripQuery = useTrip(tripId);
  const itineraryQuery = useItinerary(tripId);

  const trip = tripQuery.data;
  const itinerary = itineraryQuery.data;

  const isLoading = tripQuery.isLoading || itineraryQuery.isLoading;

  return (
    <div className="min-h-dvh bg-background">
      {/* Simple header */}
      <header className="border-b border-subtle-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Globe2 className="h-4 w-4" />
            </span>
            GlobeTrotter
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Sign in to plan your own trip</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-72 rounded-lg" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : tripQuery.isError || !trip ? (
          <div className="rounded-2xl border border-dashed border-subtle-border px-4 py-16 text-center">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold text-foreground">
              Trip not found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This trip may have been removed or the link is incorrect.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/login">Go to GlobeTrotter</Link>
            </Button>
          </div>
        ) : (
          <>
            <PublicTripHero trip={trip} />

            {itinerary ? (
              <>
                {/* Itinerary timeline */}
                <section>
                  <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">
                    Day-by-Day Itinerary
                  </h2>
                  {itinerary.days.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-subtle-border px-4 py-12 text-center">
                      <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-3 text-sm font-medium text-foreground">
                        No itinerary yet
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The planner hasn't added any activities yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {itinerary.days.map((day, i) => {
                        const dayActivities = itinerary.activities
                          .filter((a) => a.dayId === day.id)
                          .sort((a, b) => a.startTime.localeCompare(b.startTime));
                        return (
                          <div key={day.id} className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                {i + 1}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  Day {i + 1}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(day.date).toLocaleDateString(
                                    undefined,
                                    {
                                      weekday: "long",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                              {day.notes ? (
                                <p className="ml-4 text-xs italic text-muted-foreground">
                                  {day.notes}
                                </p>
                              ) : null}
                            </div>

                            {dayActivities.length === 0 ? (
                              <p className="ml-11 text-sm text-muted-foreground">
                                Rest day — no activities planned
                              </p>
                            ) : (
                              <div className="ml-11 space-y-2">
                                {dayActivities.map((activity) => (
                                  <Card
                                    key={activity.id}
                                    className="flex items-center gap-3 p-3"
                                  >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                      {activity.image ? (
                                        <img
                                          src={activity.image}
                                          alt={activity.name}
                                          loading="lazy"
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <Sparkles className="h-4 w-4 text-primary" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium text-foreground">
                                        {activity.name}
                                      </p>
                                      <p className="truncate text-xs text-muted-foreground">
                                        {activity.category} · {activity.location}
                                      </p>
                                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
                                        <Clock className="h-3 w-3" />
                                        {activity.startTime} – {activity.endTime}
                                      </div>
                                    </div>
                                    <div className="hidden text-right sm:block">
                                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {activity.startTime} – {activity.endTime}
                                      </p>
                                    </div>
                                    {activity.estimatedCostInr > 0 ? (
                                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                        {formatMoney(
                                          activity.estimatedCostInr,
                                          trip.currency,
                                        )}
                                      </span>
                                    ) : null}
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Budget summary */}
                {trip.budgetAmount > 0 ? (
                  <section>
                    <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">
                      Budget Overview
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Card className="p-4">
                        <p className="text-xs text-muted-foreground">
                          Total Budget
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {currencySymbol(trip.currency)}
                          {trip.budgetAmount.toLocaleString()}
                        </p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-xs text-muted-foreground">
                          Est. Activity Cost
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {currencySymbol(trip.currency)}
                          {itinerary.activities
                            .reduce((sum, a) => sum + a.estimatedCostInr, 0)
                            .toLocaleString()}
                        </p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-xs text-muted-foreground">
                          Remaining
                        </p>
                        {(() => {
                          const spent = itinerary.activities.reduce(
                            (sum, a) => sum + a.estimatedCostInr,
                            0,
                          );
                          const remaining = trip.budgetAmount - spent;
                          return (
                            <p
                              className={cn(
                                "text-2xl font-bold",
                                remaining < 0
                                  ? "text-destructive"
                                  : "text-foreground",
                              )}
                            >
                              {currencySymbol(trip.currency)}
                              {remaining.toLocaleString()}
                            </p>
                          );
                        })()}
                      </Card>
                    </div>
                  </section>
                ) : null}
              </>
            ) : null}

            {/* CTA */}
            <div className="rounded-2xl border border-subtle-border bg-card p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                Want to plan a trip like this?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your own personalized itinerary on GlobeTrotter.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/register">Start Planning — It's Free</Link>
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
