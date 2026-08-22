import { useEffect, useState } from "react";
import {
  Clock3,
  Coins,
  ListChecks,
  MapPin,
  NotebookPen,
  Pencil,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DestinationSearch } from "@/features/trips/components/DestinationSearch";
import type { Destination } from "@/features/trips/trips.types";
import { destinations } from "@/features/trips/trips.data";
import { formatMoney } from "@/features/trips/trips.utils";
import {
  describeDate,
  summarizeDay,
  totalDurationLabel,
} from "@/features/trips/itinerary.utils";
import type {
  ItineraryActivity,
  ItineraryDay,
  ValidationIssue,
} from "@/features/trips/itinerary.types";
import { cn } from "@/lib/utils";

interface DayDetailsProps {
  dayIndex: number;
  day: ItineraryDay;
  activities: ItineraryActivity[];
  currency: string;
  issues: ValidationIssue[];
  isSavingDay: boolean;
  onUpdateDay: (
    patch: { notes?: string; destinationId?: string | null },
    options?: { silent?: boolean },
  ) => void;
}

/**
 * Selected-day header, calculated summary and inline editor for the
 * day's city + notes. All totals derive from the shared utilities.
 */
export function DayDetails({
  dayIndex,
  day,
  activities,
  currency,
  issues,
  isSavingDay,
  onUpdateDay,
}: DayDetailsProps) {
  const [editing, setEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState(day.notes);
  const [locationDraft, setLocationDraft] = useState<Destination | null>(
    () => destinations.find((d) => d.id === day.destinationId) ?? null,
  );

  const dateInfo = describeDate(day.date);
  const summary = summarizeDay(activities, day.id);
  const selectedDestination =
    destinations.find((d) => d.id === day.destinationId) ?? null;

  // Re-sync drafts when switching days or after external updates.
  useEffect(() => {
    setNotesDraft(day.notes);
    setLocationDraft(
      destinations.find((d) => d.id === day.destinationId) ?? null,
    );
    setEditing(false);
  }, [day.id, day.notes, day.destinationId]);

  /* Notes autosave — debounced, silent (no toast spam). */
  useEffect(() => {
    if (!editing || notesDraft === day.notes) return;
    const timer = setTimeout(() => {
      onUpdateDay({ notes: notesDraft }, { silent: true });
    }, 900);
    return () => clearTimeout(timer);
  }, [notesDraft, editing, day.notes, onUpdateDay]);

  const saveLocation = () => {
    onUpdateDay({ destinationId: locationDraft?.id ?? null });
    setEditing(false);
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                Day {dayIndex + 1}
              </span>
              <h3 className="text-base font-semibold text-foreground sm:text-lg">
                {dateInfo?.fullDate ?? day.date}
              </h3>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
              {selectedDestination
                ? `${selectedDestination.city}, ${selectedDestination.country}`
                : "No city assigned yet"}
            </p>
          </div>

          <Button
            size="sm"
            variant={editing ? "secondary" : "ghost"}
            onClick={() => setEditing((prev) => !prev)}
            aria-expanded={editing}
            aria-controls={`day-editor-${day.id}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            {editing ? "Close editor" : "Edit Day"}
          </Button>
        </div>

        {/* Summary chips */}
        <dl className="mt-4 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-secondary-text">
            <ListChecks className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <dt className="sr-only">Total activities</dt>
            <dd>
              {summary.activityCount}{" "}
              {summary.activityCount === 1 ? "activity" : "activities"}
            </dd>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-secondary-text">
            <Clock3 className="h-3.5 w-3.5 text-travel-blue" aria-hidden="true" />
            <dt className="sr-only">Estimated duration</dt>
            <dd>~{totalDurationLabel(summary.durationMinutes)}</dd>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-secondary-text">
            <Coins className="h-3.5 w-3.5 text-budget" aria-hidden="true" />
            <dt className="sr-only">Estimated cost</dt>
            <dd>
              ≈{" "}
              {summary.costInr > 0
                ? formatMoney(summary.costInr, currency)
                : "No cost yet"}
            </dd>
          </div>
        </dl>

        {/* Inline warnings for this day */}
        {issues.length > 0 ? (
          <ul
            aria-label="Scheduling warnings for this day"
            className="mt-4 space-y-1.5"
          >
            {issues.map((issue) => (
              <li
                key={issue.id}
                role={issue.severity === "error" ? "alert" : "status"}
                className={cn(
                  "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
                  issue.severity === "error"
                    ? "border-error-border bg-error-bg text-error-text"
                    : "border-warning-border bg-warning-bg text-warning-text",
                )}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Editor */}
        {editing ? (
          <div
            id={`day-editor-${day.id}`}
            className="mt-4 space-y-4 rounded-xl border border-subtle-border bg-muted/40 p-4"
          >
            <DestinationSearch
              fieldId={`day-location-${day.id}`}
              label="City for this day"
              placeholder={
                selectedDestination
                  ? `${selectedDestination.city}, ${selectedDestination.country}`
                  : "Search cities…"
              }
              hideLabel
              selected={locationDraft}
              onSelect={setLocationDraft}
              onClear={() => setLocationDraft(null)}
            />

            <div className="space-y-1.5">
              <label
                htmlFor={`day-notes-${day.id}`}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <NotebookPen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Day notes
              </label>
              <Textarea
                id={`day-notes-${day.id}`}
                rows={3}
                maxLength={1000}
                value={notesDraft}
                placeholder="Booking refs, reservations, reminders…"
                onChange={(event) => setNotesDraft(event.target.value)}
              />
              <p
                aria-live="polite"
                className="text-right text-[11px] text-muted-foreground"
              >
                {isSavingDay && notesDraft !== day.notes
                  ? "Saving notes…"
                  : notesDraft !== day.notes
                    ? "Notes save automatically"
                    : "Notes saved"}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Done
              </Button>
              <Button size="sm" onClick={saveLocation}>
                Save location
              </Button>
            </div>
          </div>
        ) : (
          day.notes.trim() ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary-light bg-primary-subtle p-3 dark:border-transparent">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-accent-foreground">
                {day.notes}
              </p>
            </div>
          ) : null
        )}
      </CardContent>
    </Card>
  );
}
