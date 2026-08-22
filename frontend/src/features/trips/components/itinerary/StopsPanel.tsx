import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, MapPin, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DestinationSearch } from "@/features/trips/components/DestinationSearch";
import type {
  ItineraryStop,
  StopInput,
} from "@/features/trips/itinerary.types";
import type { Destination } from "@/features/trips/trips.types";
import { stopNights, describeDate } from "@/features/trips/itinerary.utils";
import { stopFormSchema } from "@/features/trips/schemas/itinerary.schema";

interface StopsPanelProps {
  stops: ItineraryStop[];
  tripDates: string[];
  isMutating: boolean;
  onAdd: (input: StopInput) => void;
  onDelete: (stopId: string) => void;
  onMoveUp: (stopId: string) => void;
  onMoveDown: (stopId: string) => void;
}

interface AddStopDraft {
  destination: Destination | null;
  arrivalDate: string;
  departureDate: string;
}

/**
 * Multi-city route management: ordered city stops with add / reorder /
 * remove. Shown in the map view as the route leg planner.
 */
export function StopsPanel({
  stops,
  tripDates,
  isMutating,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
}: StopsPanelProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<AddStopDraft>({
    destination: null,
    arrivalDate: "",
    departureDate: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<"destinationId" | "arrivalDate" | "departureDate", string>>
  >({});

  const schema = useMemo(() => stopFormSchema(tripDates), [tripDates]);

  const openDialog = () => {
    setDraft({ destination: null, arrivalDate: "", departureDate: "" });
    setErrors({});
    setAddOpen(true);
  };

  const submit = () => {
    if (!draft.destination) {
      setErrors((prev) => ({
        ...prev,
        destinationId: "Pick a city to continue.",
      }));
      return;
    }
    const parsed = schema.safeParse({
      destinationId: draft.destination.id,
      arrivalDate: draft.arrivalDate,
      departureDate: draft.departureDate,
    });
    if (!parsed.success) {
      const nextErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          key === "destinationId" ||
          key === "arrivalDate" ||
          key === "departureDate"
        ) {
          nextErrors[key] ??= issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }
    onAdd({
      destinationId: draft.destination.id,
      destinationName: draft.destination.city,
      arrivalDate: parsed.data.arrivalDate,
      departureDate: parsed.data.departureDate,
    });
    setAddOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4 text-travel-blue" aria-hidden="true" />
          Route &amp; stops
        </CardTitle>
        <Button size="sm" variant="outline" onClick={openDialog}>
          <Plus className="size-4" aria-hidden="true" />
          Add stop
        </Button>
      </CardHeader>
      <CardContent>
        {stops.length === 0 ? (
          <p className="rounded-xl border border-dashed border-subtle-border px-4 py-6 text-center text-sm text-muted-foreground">
            No cities yet — add the first stop to shape your route.
          </p>
        ) : (
          <ol className="space-y-2">
            {stops.map((stop, index) => {
              const nights = stopNights(stop);
              return (
                <li
                  key={stop.id}
                  className="flex items-center gap-3 rounded-xl border border-subtle-border bg-card px-3 py-2.5"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-travel-blue-light text-xs font-semibold text-travel-blue">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {stop.destinationName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {describeDate(stop.arrivalDate)?.shortDate ??
                        stop.arrivalDate}{" "}
                      →{" "}
                      {describeDate(stop.departureDate)?.shortDate ??
                        stop.departureDate}
                      {nights > 0 && ` · ${nights} night${nights !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge variant="secondary" className="hidden sm:inline-flex">
                      Leg {index + 1}/{stops.length}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Move ${stop.destinationName} earlier`}
                      disabled={index === 0 || isMutating}
                      onClick={() => onMoveUp(stop.id)}
                    >
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Move ${stop.destinationName} later`}
                      disabled={index === stops.length - 1 || isMutating}
                      onClick={() => onMoveDown(stop.id)}
                    >
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${stop.destinationName}`}
                      disabled={isMutating}
                      onClick={() => onDelete(stop.id)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add a city stop</DialogTitle>
            <DialogDescription>
              Pick the city and when you arrive and leave.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <DestinationSearch
              selected={draft.destination}
              onSelect={(destination) => {
                setDraft((prev) => ({ ...prev, destination }));
                setErrors((prev) => ({ ...prev, destinationId: undefined }));
              }}
              onClear={() =>
                setDraft((prev) => ({ ...prev, destination: null }))
              }
              error={errors.destinationId}
              label="City"
              fieldId="stop-city"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stop-arrival">Arrival</Label>
                <Select
                  value={draft.arrivalDate}
                  onValueChange={(value) => {
                    setDraft((prev) => ({ ...prev, arrivalDate: value }));
                    setErrors((prev) => ({ ...prev, arrivalDate: undefined }));
                  }}
                >
                  <SelectTrigger id="stop-arrival" className="w-full">
                    <SelectValue placeholder="Pick date" />
                  </SelectTrigger>
                  <SelectContent>
                    {tripDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {describeDate(date)?.fullDate ?? date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.arrivalDate ? (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.arrivalDate}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stop-departure">Departure</Label>
                <Select
                  value={draft.departureDate}
                  onValueChange={(value) => {
                    setDraft((prev) => ({ ...prev, departureDate: value }));
                    setErrors((prev) => ({ ...prev, departureDate: undefined }));
                  }}
                >
                  <SelectTrigger id="stop-departure" className="w-full">
                    <SelectValue placeholder="Pick date" />
                  </SelectTrigger>
                  <SelectContent>
                    {tripDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {describeDate(date)?.fullDate ?? date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departureDate ? (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.departureDate}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={isMutating}>
              Add stop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
