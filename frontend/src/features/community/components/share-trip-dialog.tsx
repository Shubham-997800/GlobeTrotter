import { useEffect, useState } from "react";
import { CalendarDays, Check, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CommunityUser } from "../community.types";
import { useShareTrip, useShareableTrips } from "../useCommunity";
import { destinations } from "@/features/trips/trips.data";
import { formatDateRange } from "@/features/trips/trips.utils";
import { shareTripSchema } from "../schemas/community.schema";
import type { TripRecord } from "@/features/trips/trips.types";

/**
 * Share one of the viewer's completed/planned trips to the community
 * feed as a shared-trip post with an optional note.
 */
export function ShareTripDialog({
  open,
  viewer,
  onClose,
}: {
  open: boolean;
  viewer: CommunityUser;
  onClose: () => void;
}) {
  const shareableTrips = useShareableTrips(open);
  const shareTrip = useShareTrip();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset transient state whenever the dialog closes.
  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setNote("");
      setIsPrivate(false);
      setError(null);
    }
  }, [open]);

  const submit = () => {
    if (!selectedId) {
      setError("Pick a trip to share first.");
      return;
    }
    const parsed = shareTripSchema.safeParse({
      tripId: selectedId,
      content: note,
      privacy: isPrivate ? "private" : "public",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the details.");
      return;
    }
    shareTrip.mutate(
      { payload: parsed.data, author: viewer },
      {
        onSuccess: (post) => {
          toast.success(`"${post.sharedTrip?.name ?? "Your trip"}" shared with the community`);
          onClose();
        },
        onError: () => setError("Could not share the trip. Please try again."),
      },
    );
  };

  const trips = shareableTrips.data ?? [];

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>Share a trip</DialogTitle>
          <DialogDescription>
            Post a snapshot of your itinerary — travelers can copy it into their own plans.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1" role="radiogroup" aria-label="Choose a trip">
          {shareableTrips.isLoading ? (
            [0, 1].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
          ) : trips.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No trips yet — create one in My Trips and come back to share it.
            </p>
          ) : (
            trips.map((trip) => (
              <TripOption
                key={trip.id}
                trip={trip}
                selected={selectedId === trip.id}
                onSelect={() => setSelectedId(trip.id)}
              />
            ))
          )}
        </div>

        <div className="space-y-3">
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 500))}
            placeholder="Add a note for fellow travelers (optional)…"
            rows={3}
            aria-label="Share note"
          />
          <Label className="flex items-center justify-between gap-3 text-sm font-normal text-foreground">
            Share privately
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              Only you will see this post
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} aria-label="Private share" />
            </span>
          </Label>
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={shareTrip.isPending || !selectedId}>
            {shareTrip.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            Share trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TripOption({
  trip,
  selected,
  onSelect,
}: {
  trip: TripRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const destination = destinations.find((d) => d.id === trip.destinationId);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary-subtle/60 dark:bg-primary/10"
          : "border-border hover:border-strong-border hover:bg-accent",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-strong-border",
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="size-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-card-foreground">{trip.name}</span>
        <span className="mt-0.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-travel-blue" aria-hidden="true" />
            {destination ? `${destination.city}, ${destination.country}` : "Custom destination"}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5 text-travel-blue" aria-hidden="true" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </span>
      </span>
    </button>
  );
}
