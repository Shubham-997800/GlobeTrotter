import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Luggage,
  MapPin,
  PlaneTakeoff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SafeImg } from "@/components/ui/safe-img";
import { formatInr } from "@/features/dashboard/dashboard.data";
import type { Trip } from "@/features/dashboard/dashboard.types";
import { EmptyState } from "@/features/dashboard/components/States";

interface TripOverviewProps {
  trips: Trip[];
}

function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / max) * 100)));
}

function BudgetMeter({
  spentInr,
  totalInr,
}: {
  spentInr: number;
  totalInr: number;
}) {
  const pct = clampPercent(spentInr, totalInr);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-white/80">Budget</span>
        <span className="tabular-nums text-white/80">
          {formatInr(spentInr)} / {formatInr(totalInr)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Budget used: ${pct}%`}
        aria-valuenow={Math.min(spentInr, totalInr)}
        aria-valuemin={0}
        aria-valuemax={totalInr}
        className="h-1.5 overflow-hidden rounded-full bg-white/20"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-budget to-food transition-all duration-500"
          style={{ width: `${Math.max(pct, spentInr > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function OngoingTripCard({ trip }: { trip: Trip }) {
  return (
    <article className="group relative min-h-[18rem] overflow-hidden rounded-2xl text-white shadow-md">
      <SafeImg
        src={trip.image}
        alt={trip.imageAlt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
      />

      <div className="relative flex h-full min-h-[18rem] flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
            Ongoing
          </span>
          {trip.currentDay ? (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              Day {trip.currentDay.day} of {trip.currentDay.of}
            </span>
          ) : null}
        </div>

        <h3 className="mt-4 text-xl font-bold tracking-tight drop-shadow-sm sm:text-2xl">
          {trip.name}
        </h3>
        <p className="mt-1 text-sm text-white/85">
          {trip.destinations.join(" → ")}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/70">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {trip.startDate} – {trip.endDate}
        </p>

        {/* Trip progress */}
        <div className="mt-4">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="font-medium text-white/80">Trip Progress</span>
            <span className="tabular-nums text-white/80">{trip.progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label={`Trip progress: ${trip.progress}%`}
            aria-valuenow={trip.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-white/20"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-travel-blue to-primary transition-all duration-500"
              style={{ width: `${Math.max(trip.progress, 2)}%` }}
            />
          </div>
        </div>

        {/* Budget */}
        <div className="mt-3">
          <BudgetMeter
            spentInr={trip.budget?.spentInr ?? 0}
            totalInr={trip.budget?.totalInr ?? 0}
          />
        </div>

        <Button asChild size="sm" className="mt-4 self-start">
          <Link to={`/trips/${trip.id}/itinerary`}>
            Continue Trip
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function UpcomingTripCard({ trip }: { trip: Trip }) {
  return (
    <article className="group flex items-center gap-3.5 rounded-xl border border-subtle-border bg-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <SafeImg
        src={trip.image}
        alt={trip.imageAlt}
        loading="lazy"
        className="size-14 shrink-0 rounded-lg object-cover sm:size-16"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {trip.name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {trip.destinations.join(", ")}
          {trip.country ? ` · ${trip.country}` : ""}
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-secondary-text">
          <PlaneTakeoff className="size-3.5" aria-hidden="true" />
          Starts {trip.startDate}
        </p>
      </div>
      <Link
        to={`/trips/${trip.id}/itinerary`}
        className="ml-auto inline-flex shrink-0 items-center rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white dark:bg-primary/15 dark:hover:bg-primary dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        View
      </Link>
    </article>
  );
}

export function TripOverview({ trips }: TripOverviewProps) {
  const ongoing = trips.find((trip) => trip.status === "ongoing");
  const upcoming = trips
    .filter((trip) => trip.status === "upcoming")
    .slice(0, 3);

  return (
    <section aria-labelledby="your-trips-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2
            id="your-trips-heading"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
          >
            Your Trips
            <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary dark:bg-primary/15">
              {trips.length}
            </span>
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pick up where you left off
          </p>
        </div>
        <Link
          to="/trips"
          className="shrink-0 rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View All
        </Link>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={Luggage}
          title="No trips yet"
          description="Every great journey starts with a single plan. Create your first trip and let the adventure begin."
          action={{ label: "Plan a New Trip", to: "/trips/create" }}
        />
      ) : (
        <div className="space-y-3">
          {ongoing ? (
            <OngoingTripCard trip={ongoing} />
          ) : (
            <div className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-subtle-border p-6 text-center">
              <MapPin
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                No trip happening right now.
              </p>
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <Link to="/trips/create">Start planning one</Link>
              </Button>
            </div>
          )}
          {upcoming.length > 0 ? (
            upcoming.map((trip) => (
              <UpcomingTripCard key={trip.id} trip={trip} />
            ))
          ) : null}
        </div>
      )}
    </section>
  );
}
