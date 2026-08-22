import { CalendarPlus, Map } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyItineraryProps {
  onAddActivity: () => void;
}

/** Empty-day state. The CTA opens the real Add Activity interface. */
export function EmptyItinerary({ onAddActivity }: EmptyItineraryProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-subtle-border px-6 py-12 text-center"
    >
      {/* Simple inline illustration built from theme tokens */}
      <span
        aria-hidden="true"
        className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-subtle text-primary"
      >
        <Map className="h-9 w-9" />
        <span className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-travel-blue text-travel-blue-foreground">
          <CalendarPlus className="h-4 w-4" />
        </span>
      </span>
      <h4 className="text-base font-semibold text-foreground">
        No Activities Yet
      </h4>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Search the catalog, pick a suggestion or create something custom —
        your day takes shape in minutes.
      </p>
      <Button className="mt-5" onClick={onAddActivity}>
        <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        Add First Activity
      </Button>
    </div>
  );
}
