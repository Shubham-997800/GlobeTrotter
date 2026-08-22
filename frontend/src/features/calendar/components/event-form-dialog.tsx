import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TripRecord } from "@/features/trips/trips.types";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../calendar.types";
import { findConflicts, formatTimeLabel, todayKey } from "../calendar.utils";
import {
  CREATABLE_EVENT_TYPES,
  customEventSchema,
  EVENT_DESCRIPTION_MAX,
  EVENT_LOCATION_MAX,
  EVENT_TITLE_MAX,
  type CustomEventFormValues,
} from "../schemas/calendar.schema";
import { ConflictDialog } from "./conflict-dialog";

const TYPE_LABELS: Record<(typeof CREATABLE_EVENT_TYPES)[number], string> = {
  activity: "Activity",
  transport: "Transport",
  accommodation: "Accommodation",
  custom: "Custom",
};

export interface EventFormSavePayload extends CustomEventFormValues {
  eventId?: string;
}

/**
 * Create/edit dialog for standalone events. Conflicts against the
 * composed stream are detected live while typing and confirmed through
 * the ConflictDialog before a forced save.
 */
export function EventFormDialog({
  open,
  editing,
  presetDate,
  allEvents,
  linkableTrips,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: CalendarEvent | null;
  presetDate?: string;
  allEvents: CalendarEvent[];
  linkableTrips: TripRecord[];
  onClose: () => void;
  /** Resolves `true` when the caller persisted the event. */
  onSave: (
    values: EventFormSavePayload,
    options: { force: boolean },
  ) => Promise<boolean>;
}) {
  const [saving, setSaving] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const pendingRef = useRef<EventFormSavePayload | null>(null);
  const forceRef = useRef(false);

  const form = useForm<CustomEventFormValues>({
    resolver: zodResolver(customEventSchema),
    defaultValues: {
      title: "",
      type: "activity",
      date: presetDate ?? todayKey(),
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      description: "",
      tripId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: editing?.title ?? "",
      type:
        editing && editing.type !== "trip" && editing.type !== "food"
          ? editing.type
          : "activity",
      date: editing?.date ?? presetDate ?? todayKey(),
      startTime: editing?.startTime ?? "09:00",
      endTime: editing?.endTime ?? "10:00",
      location: editing?.location ?? "",
      description: editing?.description ?? "",
      tripId: editing?.tripId ?? "",
    });
    pendingRef.current = null;
    forceRef.current = false;
    setConflictOpen(false);
  }, [open, editing, presetDate, form]);

  // Live conflict preview while typing.
  const watched = form.watch();
  const conflictCheck = useMemo(
    () =>
      findConflicts(
        {
          eventId: editing?.id,
          date: watched.date ?? "",
          startTime: watched.startTime ?? "",
          endTime: watched.endTime ?? "",
          title: watched.title ?? "",
        },
        allEvents,
      ),
    [
      watched.date,
      watched.startTime,
      watched.endTime,
      watched.title,
      editing?.id,
      allEvents,
    ],
  );
  const hasWarning =
    (conflictCheck.conflicts.length > 0 || conflictCheck.duplicate) &&
    !conflictCheck.invalidRange;

  const persist = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    const raw = form.getValues();
    const payload: EventFormSavePayload = {
      ...raw,
      location: raw.location || undefined,
      description: raw.description || undefined,
      tripId: raw.tripId ? raw.tripId : undefined,
      eventId: editing?.id,
    };
    setSaving(true);
    const ok = await onSave(payload, { force: forceRef.current });
    setSaving(false);
    forceRef.current = false;
    if (ok) onClose();
  };

  const submitWithConflictGate = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    if (hasWarning && !forceRef.current) {
      pendingRef.current = {
        ...(form.getValues() as CustomEventFormValues),
        location: form.getValues("location") || undefined,
        description: form.getValues("description") || undefined,
        tripId: form.getValues("tripId") || undefined,
        eventId: editing?.id,
      };
      setConflictOpen(true);
      return;
    }
    await persist();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
        <DialogContent className="sm:max-w-lg sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit event" : "New calendar entry"}</DialogTitle>
            <DialogDescription>
              Standalone events live outside any itinerary — perfect for
              flights booked separately, dinners or day plans.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitWithConflictGate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                maxLength={EVENT_TITLE_MAX}
                placeholder="e.g. Sunset boat tour"
                aria-invalid={Boolean(form.formState.errors.title)}
                {...form.register("title")}
              />
              {form.formState.errors.title ? (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.title.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="event-type">Type</Label>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="event-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CREATABLE_EVENT_TYPES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {TYPE_LABELS[value]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-date">Date</Label>
                <Input id="event-date" type="date" {...form.register("date")} />
                {form.formState.errors.date ? (
                  <p className="text-xs text-destructive" role="alert">
                    {form.formState.errors.date.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-start">Starts</Label>
                <Input id="event-start" type="time" step={900} {...form.register("startTime")} />
                {form.formState.errors.startTime ? (
                  <p className="text-xs text-destructive" role="alert">
                    {form.formState.errors.startTime.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-end">Ends</Label>
                <Input id="event-end" type="time" step={900} {...form.register("endTime")} />
                {form.formState.errors.endTime ? (
                  <p className="text-xs text-destructive" role="alert">
                    {form.formState.errors.endTime.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-location">Location (optional)</Label>
              <Input
                id="event-location"
                maxLength={EVENT_LOCATION_MAX}
                placeholder="Address or meeting point"
                {...form.register("location")}
              />
              {form.formState.errors.location ? (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.location.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-notes">Notes (optional)</Label>
              <Textarea
                id="event-notes"
                rows={2}
                maxLength={EVENT_DESCRIPTION_MAX}
                placeholder="Booking references, reminders…"
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.description.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-trip">Link to trip (optional)</Label>
              <Controller
                control={form.control}
                name="tripId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger id="event-trip">
                      <SelectValue placeholder="Not linked" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not linked</SelectItem>
                      {linkableTrips.map((trip) => (
                        <SelectItem key={trip.id} value={trip.id}>
                          {trip.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {hasWarning ? (
              <button
                type="button"
                onClick={() => setConflictOpen(true)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-xl border border-warning-border bg-warning-bg p-3 text-left",
                )}
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <span className="text-xs text-warning-text">
                  Overlaps{" "}
                  {conflictCheck.duplicate ? "a possible duplicate" : ""}
                  {conflictCheck.duplicate && conflictCheck.conflicts.length > 0 ? " and " : ""}
                  {conflictCheck.conflicts.length > 0
                    ? `${conflictCheck.conflicts.length} planned entr${conflictCheck.conflicts.length === 1 ? "y" : "ies"}`
                    : ""}
                  . Review conflicts.
                </span>
              </button>
            ) : null}

            <p className="text-[11px] text-muted-foreground">
              Slot preview:{" "}
              {formatTimeLabel(watched.startTime) || "—"} –{" "}
              {formatTimeLabel(watched.endTime) || "—"}
            </p>
          </form>

          <DialogFooter>
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void submitWithConflictGate()} disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {editing ? "Save changes" : "Add to calendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConflictDialog
        open={conflictOpen}
        conflicts={conflictCheck.conflicts}
        duplicateTitle={conflictCheck.duplicate}
        onEditSchedule={() => {
          setConflictOpen(false);
          forceRef.current = false;
        }}
        onKeepAnyway={() => {
          forceRef.current = true;
          setConflictOpen(false);
          const target =
            pendingRef.current ??
            ({
              ...form.getValues(),
              eventId: editing?.id,
            } as EventFormSavePayload);
          void (async () => {
            setSaving(true);
            const ok = await onSave(target, { force: true });
            setSaving(false);
            forceRef.current = false;
            if (ok) onClose();
          })();
        }}
      />
    </>
  );
}
