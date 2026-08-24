import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTripsForSelector } from "../useExplore";
import { useAddToTrip } from "../useExplore";

interface AddToTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinationId: string;
  destinationName: string;
  /** Called when destination is successfully added to a trip */
  onSuccess?: () => void;
}

export function AddToTripDialog({
  open,
  onOpenChange,
  destinationId,
  destinationName,
  onSuccess,
}: AddToTripDialogProps) {
  const navigate = useNavigate();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createNewTrip, setCreateNewTrip] = useState(false);
  const [newTripName, setNewTripName] = useState("");

  const { data: trips = [], isLoading: tripsLoading } = useTripsForSelector();
  const addToTrip = useAddToTrip();

  // Filter trips by search query
  const filteredTrips = trips.filter(
    (trip) =>
      !searchQuery.trim() ||
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get days for selected trip
  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const availableDays = selectedTrip?.days ?? [];

  const isSubmitting = addToTrip.isPending;

  const handleSubmit = async () => {
    if (!selectedTripId || !selectedDayId) return;

    try {
      await addToTrip.mutateAsync({
        destinationId,
        tripId: selectedTripId,
        dayId: selectedDayId,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add to trip:", error);
    }
  };

  const handleCreateTrip = async () => {
    if (!newTripName.trim()) return;

    navigate(`/trips/create?destination=${destinationId}&tripName=${encodeURIComponent(newTripName)}`);
    onOpenChange(false);
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setSelectedTripId(null);
    setSelectedDayId(null);
    setSearchQuery("");
    setCreateNewTrip(false);
    setNewTripName("");
    onOpenChange(false);
  };

  // Auto-select first trip if only one
  useEffect(() => {
    if (open && trips.length === 1 && !tripsLoading) {
      setSelectedTripId(trips[0].id);
    }
  }, [open, trips, tripsLoading]);

  // Render trip list content
  function TripListContent() {
    if (tripsLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      );
    }

    if (filteredTrips.length === 0) {
      return (
        <div className="py-6 text-center text-sm text-muted-foreground">
          {searchQuery ? (
            <>No trips match &ldquo;{searchQuery}&rdquo;</>
          ) : (
            <>
              You don&apos;t have any trips yet.{" "}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1"
                onClick={() => setCreateNewTrip(true)}
              >
                Create one
              </Button>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredTrips.map((trip) => (
          <button
            key={trip.id}
            type="button"
            onClick={() => {
              setSelectedTripId(trip.id);
              setSelectedDayId(null);
              setCreateNewTrip(false);
            }}
            className={cn(
              "relative w-full text-left rounded-lg border p-3 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedTripId === trip.id
                ? "border-primary bg-primary/5"
                : "border-subtle-border hover:border-primary/40 hover:bg-muted/50",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{trip.name}</p>
                <p className="text-xs text-muted-foreground">
                  {trip.startDate} – {trip.endDate} · {trip.days.length} days
                </p>
                <p className="text-xs text-muted-foreground">
                  {trip.destination}
                </p>
              </div>
              {selectedTripId === trip.id && (
                <div className="flex size-5 items-center justify-center">
                  <div className="size-5 rounded-full border-2 border-primary" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add to Trip</DialogTitle>
          <DialogDescription>
            Choose an existing trip or create a new one for {destinationName}
          </DialogDescription>
        </DialogHeader>

        {!createNewTrip ? (
          <div className="space-y-4">
            {/* Search trips */}
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Search your trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3"
              />
            </div>

            {/* Trip list */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              <TripListContent />
            </div>

            {/* Create new trip option */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCreateNewTrip(true)}
            >
              <Plus className="size-4 mr-2" aria-hidden="true" />
              Create New Trip
            </Button>
          </div>
        ) : (
          // Create new trip form
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-trip-name">Trip Name</Label>
              <Input
                id="new-trip-name"
                placeholder={`My ${destinationName} Trip`}
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                maxLength={100}
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              We&apos;ll create a new trip with {destinationName} as the destination.
              You can customize dates and details after creation.
            </p>
          </div>
        )}

        {/* Day selection */}
        {selectedTripId && !createNewTrip && (
          <div className="space-y-4 border-t border-subtle-border pt-4">
            <Label className="text-sm font-medium">Select Day</Label>
            <div className="relative max-h-48">
              <div className="max-h-48 overflow-y-auto grid gap-2 sm:grid-cols-2">
                {availableDays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={cn(
                      "relative rounded-lg border p-3 text-left transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selectedDayId === day.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-subtle-border hover:border-primary/40 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{day.label}</p>
                        <p className="text-xs text-muted-foreground">{day.date}</p>
                      </div>
                      {selectedDayId === day.id && (
                        <div className="flex size-5 items-center justify-center">
                          <div className="size-5 rounded-full border-2 border-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {availableDays.length === 0 && (
                  <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
                    No itinerary days created yet.
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      asChild
                    >
                      <Link to={`/trips/${selectedTripId}/itinerary`}>
                        Build Itinerary
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              {availableDays.length > 4 && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
              )}
            </div>
          </div>
        )}
      </DialogContent>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        {createNewTrip ? (
          <Button
            onClick={handleCreateTrip}
            disabled={isSubmitting || !newTripName.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create & Add"
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedTripId || !selectedDayId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Adding...
              </>
            ) : (
              "Add to Trip"
            )}
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}