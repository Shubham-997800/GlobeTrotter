import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ListChecks,
  MapPin,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TripCardModel } from "../../my-trips.logic";

/**
 * "Incomplete but recoverable" — drafts surface their real completion
 * percentage and the exact missing fields, each chip jumping straight
 * into the edit flow.
 */
export function DraftTripCard({
  trip,
  onDeleteRequest,
}: {
  trip: TripCardModel;
  onDeleteRequest: (trip: TripCardModel) => void;
}) {
  const editTo = `/trips/${trip.record.id}/edit`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-strong-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold tracking-tight text-foreground">
            <Link
              to={editTo}
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {trip.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {trip.city || "Destination not set"}
              {trip.country ? `, ${trip.country}` : ""}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDeleteRequest(trip)}
          aria-label={`Delete draft ${trip.name}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Completion */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">{trip.percent}% complete</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Updated {trip.updatedAtLabel || "recently"}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={trip.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${trip.name} completion`}
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${Math.max(trip.percent, 2)}%` }}
          />
        </div>
      </div>

      {/* Missing information — actionable chips */}
      {trip.missingLabels.length > 0 ? (
        <ul aria-label="Missing information" className="mt-4 flex flex-wrap gap-1.5">
          {trip.missingLabels.map((label) => (
            <li key={label}>
              <Link
                to={editTo}
                className="inline-flex max-w-full items-center truncate rounded-full border border-warning-border bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning-text transition-colors hover:bg-warning-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={`Fix in editor: ${label}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success-text">
          <ListChecks className="size-3.5" aria-hidden="true" />
          Ready to finalize
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        <span className="text-xs text-muted-foreground">
          {trip.daysPlanned > 0 ? `${trip.daysPlanned} travel days` : "No dates yet"}
        </span>
        <Button asChild size="sm">
          <Link to={editTo}>
            Continue Editing
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
