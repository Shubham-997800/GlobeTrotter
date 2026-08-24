import { CalendarDays, Check, Copy, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SharedTripSnapshot } from "../community.types";
import { useCopySharedTrip } from "../useCommunity";
import { formatDateRange } from "@/features/trips/trips.utils";

/**
 * Embedded trip snapshot inside a shared-trip post — cover image,
 * destination, dates and one-click import into the viewer's trips.
 */
export function SharedTripCard({ snapshot }: { snapshot: SharedTripSnapshot }) {
  const copyTrip = useCopySharedTrip();

  const handleCopy = () => {
    copyTrip.mutate(snapshot.tripId, {
      onSuccess: (trip) => {
        if (!trip) {
          toast.error("Could not copy that trip. Please try again.");
          return;
        }
        toast.success(`"${trip.name}" copied to My Trips`, {
          description: "Open My Trips to start planning the details.",
        });
      },
      onError: () => {
        toast.error("Could not copy that trip. Please try again.");
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="relative h-40 bg-muted">
        {snapshot.coverImage ? (
          <img
            src={snapshot.coverImage}
            alt={snapshot.name}
            width="400"
            height="160"
            loading="lazy"
            className="size-full object-cover"
          />
        ) : null}
        <Badge
          variant="soft"
          className="absolute left-3 top-3 bg-background/90 backdrop-blur"
        >
          Trip itinerary
        </Badge>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-card-foreground">
            {snapshot.name}
          </p>
          <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 text-travel-blue" aria-hidden="true" />
              {snapshot.destinationLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays
                className="size-3.5 text-travel-blue"
                aria-hidden="true"
              />
              {formatDateRange(snapshot.startDate, snapshot.endDate)} ·{" "}
              {snapshot.activitiesCount} activities
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          disabled={copyTrip.isPending}
        >
          {copyTrip.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : copyTrip.isSuccess ? (
            <Check className="size-4 text-primary" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          Copy
        </Button>
      </div>
    </div>
  );
}