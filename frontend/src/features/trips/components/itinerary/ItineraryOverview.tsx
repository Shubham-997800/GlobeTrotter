import {
  CheckCircle2,
  CalendarDays,
  ListChecks,
} from "lucide-react";

import type { ItineraryProgress } from "../../itinerary.utils";
import { cn } from "@/lib/utils";

interface ItineraryOverviewProps {
  progress: ItineraryProgress;
  className?: string;
}

/**
 * Page heading + live completion stats derived from itinerary data.
 * Sits under the trip header; the h2 keeps one h1 per page (trip name).
 */
export function ItineraryOverview({ progress, className }: ItineraryOverviewProps) {
  return (
    <section
      aria-label="Itinerary progress"
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Build Your Itinerary
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan your journey day by day
        </p>
      </div>

      <dl className="grid grid-cols-3 items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-travel-blue-light text-travel-blue">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Total Days
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground">
              {progress.totalDays}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Planned Days
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground">
              {progress.plannedDays}
            </dd>
          </div>
        </div>

        {/* Completion */}
        <div className="col-span-3 sm:col-span-3 md:col-span-1 md:w-44">
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Progress
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground">
              {progress.percent}%
            </dd>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Itinerary planning ${progress.percent}% complete`}
            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-[width] duration-500 ease-out",
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="sr-only" aria-live="polite">
            {progress.plannedDays} of {progress.totalDays} days planned
          </p>
        </div>
      </dl>
    </section>
  );
}
