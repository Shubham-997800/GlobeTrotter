import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { activities as activityCatalog } from "@/features/trips/trips.data";
import { cn } from "@/lib/utils";
import type { TripCardModel } from "../../my-trips.logic";
import { formatCountdown } from "../../my-trips.logic";
import { TripImage } from "./trip-image";

/** First saved catalog activity for the trip, if any. */
function nextActivity(trip: TripCardModel) {
  const id = trip.record.activityIds?.[0];
  return activityCatalog.find((activity) => activity.id === id) ?? null;
}

/**
 * "Your Next Adventure" hero — the nearest upcoming trip picked by
 * shared logic (never a random one). Hidden entirely when no upcoming
 * trips exist; the grid/tab empty state takes over.
 */
export function UpcomingTripHighlight({ trip }: { trip: TripCardModel }) {
  const countdown = formatCountdown(trip.countdownDays);
  const activity = nextActivity(trip);

  return (
    <section aria-label="Your next adventure">
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-sm">
        <TripImage
          src={trip.image}
          alt={trip.imageAlt}
          eager
          className="h-[19rem] sm:h-[21rem] lg:h-[23rem]"
        />
        {/* Legibility gradients — same language as the dashboard banner */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
        />

        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Your Next Adventure
            </span>
            {countdown ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                <Clock className="size-3.5" aria-hidden="true" />
                {countdown}
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight drop-shadow-sm sm:text-3xl">
            {trip.name}
          </h2>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {trip.city}
              {trip.country ? `, ${trip.country}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {trip.dateRange}
              {trip.duration ? ` · ${trip.duration.days} days` : ""}
            </span>
          </p>

          {/* Planning progress + next activity */}
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-end">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-white/80">
                <span>Planning progress</span>
                <span>{trip.percent}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={trip.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Planning progress ${trip.percent}%`}
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  className={cn(
                    "h-full rounded-full bg-primary transition-[width] duration-500",
                  )}
                  style={{ width: `${trip.percent}%` }}
                />
              </div>
            </div>

            {activity ? (
              <p className="flex min-w-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm backdrop-blur-sm">
                <Ticket className="size-4 shrink-0 text-white/85" aria-hidden="true" />
                <span className="min-w-0 truncate">
                  Up first: <span className="font-medium">{activity.name}</span>
                  <span className="text-white/75"> · {activity.city}</span>
                </span>
              </p>
            ) : (
              <p className="flex min-w-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/85 backdrop-blur-sm">
                <Ticket className="size-4 shrink-0" aria-hidden="true" />
                No activities planned yet
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button asChild size="sm">
              <Link to={`/trips/${trip.record.id}/itinerary`}>
                Continue Planning
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white"
            >
              <Link to={`/trips/${trip.record.id}/itinerary`}>
                View Trip
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
