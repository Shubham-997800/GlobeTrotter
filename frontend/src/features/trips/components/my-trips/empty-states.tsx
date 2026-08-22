import { Link } from "react-router-dom";
import {
  Compass,
  FilterX,
  Luggage,
  PlaneTakeoff,
  SearchX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TripEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; to?: string; onClick?: () => void };
}

/** Shared visual language for every My Trips empty state. */
export function TripEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: TripEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-subtle-border px-6 py-14 text-center">
      <div className="relative" aria-hidden="true">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary-light dark:bg-primary/15">
          <Icon className="size-7 text-primary" />
        </span>
        <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-travel-blue-light text-travel-blue dark:bg-travel-blue/20">
          <Compass className="size-3.5" />
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? (
        action.to ? (
          <Button asChild size="sm" className="mt-6">
            <Link to={action.to}>{action.label}</Link>
          </Button>
        ) : (
          <Button size="sm" className="mt-6" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}

/** Zero trips at all — the "start traveling" moment. */
export function NoTripsState() {
  return (
    <TripEmptyState
      icon={Luggage}
      title="No trips yet"
      description="Every great journey starts with a single plan. Where will you go first?"
      action={{ label: "Create Your First Trip", to: "/trips/create" }}
    />
  );
}

/** Filters/search matched nothing — different from having no trips. */
export function NoResultsState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <TripEmptyState
      icon={SearchX}
      title="No Matching Trips"
      description="No trips match the filters you've applied. Try adjusting your search or clearing the filters."
      action={{ label: "Clear Filters", onClick: onClearFilters }}
    />
  );
}

export function NoUpcomingState() {
  return (
    <TripEmptyState
      icon={PlaneTakeoff}
      title="Plan Your Next Adventure"
      description="Nothing on the horizon yet — your next story is waiting to be written."
      action={{ label: "Plan a New Trip", to: "/trips/create" }}
    />
  );
}

export function NoDraftsState() {
  return (
    <TripEmptyState
      icon={FilterX}
      title="All Your Trips Are Complete"
      description="No work-in-progress drafts right now. Start a new plan anytime."
      action={{ label: "Start a New Plan", to: "/trips/create" }}
    />
  );
}
