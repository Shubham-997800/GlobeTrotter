import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Building2,
  CalendarRange,
  Check,
  GripVertical,
  Loader2,
  MoonStar,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import type { ItineraryStop, ItineraryDay } from "@/features/trips/itinerary.types";
import type { Destination } from "@/features/trips/trips.types";
import {
  describeDate,
  stopNights,
} from "@/features/trips/itinerary.utils";
import { stopFormSchema, type StopFormValues } from "@/features/trips/schemas/itinerary.schema";
import { DestinationSearch } from "../DestinationSearch";
import { ResponsiveModal } from "./ResponsiveModal";
import { cn } from "@/lib/utils";

interface StopsSectionProps {
  stops: ItineraryStop[];
  days: ItineraryDay[];
  isMutating: boolean;
  onReorder: (orderedIds: string[]) => void;
  onAdd: (stop: { destinationId: string; destinationName: string; arrivalDate: string; departureDate: string }) => void;
  onUpdate: (stopId: string, patch: Partial<ItineraryStop>) => void;
  onDelete: (stopId: string) => void;
}

/** Multi-city stops with drag reorder + add/edit/remove dialogs. */
export function StopsSection({
  stops,
  days,
  isMutating,
  onReorder,
  onAdd,
  onUpdate,
  onDelete,
}: StopsSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const orderedIds = stops.map((stop) => stop.id);
  const editingStop = editingId ? stops.find((s) => s.id === editingId) ?? null : null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(orderedIds, oldIndex, newIndex));
  };

  return (
    <section aria-labelledby="stops-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id="stops-heading" className="text-sm font-semibold text-foreground">
            Multi-city stops
          </h3>
          <p className="text-xs text-muted-foreground">
            Drag to set the visiting order. Dates must stay within your trip.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} disabled={isMutating}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add stop
        </Button>
      </div>

      {stops.length === 0 ? (
        <p
          role="status"
          className="rounded-xl border border-dashed border-subtle-border px-4 py-6 text-center text-sm text-muted-foreground"
        >
          No stops yet — add the cities you&apos;ll visit.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {stops.map((stop, index) => (
                <SortableStopRow
                  key={stop.id}
                  stop={stop}
                  index={index}
                  total={stops.length}
                  nights={stopNights(stop)}
                  disabled={isMutating}
                  onEdit={() => setEditingId(stop.id)}
                  onDelete={() => onDelete(stop.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* Add dialog */}
      <ResponsiveModal
        open={addOpen}
        onOpenChange={(next) => {
          setAddOpen(next);
        }}
        title="Add a stop"
        description={`Pick a city and its dates (${describeDate(days[0]?.date)?.fullDate} – ${describeDate(days[days.length - 1]?.date)?.fullDate}).`}
        className="max-w-md"
      >
        <StopForm
          tripDates={[days[0]?.date, days[days.length - 1]?.date]}
          submitLabel={
            <>
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              Add stop
            </>
          }
          pending={isMutating}
          onSubmit={(values) => {
            onAdd({
              destinationId: values.destinationId,
              destinationName: values.destinationName,
              arrivalDate: values.arrivalDate,
              departureDate: values.departureDate,
            });
            setAddOpen(false);
          }}
          onCancel={() => setAddOpen(false)}
        />
      </ResponsiveModal>

      {/* Edit dialog */}
      <ResponsiveModal
        open={Boolean(editingStop)}
        onOpenChange={(next) => {
          if (!next) setEditingId(null);
        }}
        title="Edit stop"
        className="max-w-md"
      >
        {editingStop ? (
          <StopForm
            key={editingStop.id}
            tripDates={[days[0]?.date, days[days.length - 1]?.date]}
            initialValues={{
              destinationId: editingStop.destinationId,
              destinationName: editingStop.destinationName,
              arrivalDate: editingStop.arrivalDate,
              departureDate: editingStop.departureDate,
            }}
            submitLabel={
              <>
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="h-4 w-4" aria-hidden="true" />
                )}
                Save stop
              </>
            }
            pending={isMutating}
            onSubmit={(values) => {
              onUpdate(editingStop.id, values);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : null}
      </ResponsiveModal>
    </section>
  );
}

interface SortableStopRowProps {
  stop: ItineraryStop;
  index: number;
  total: number;
  nights: number;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableStopRow({
  stop,
  index,
  total,
  nights,
  disabled,
  onEdit,
  onDelete,
}: SortableStopRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && "z-20 opacity-80 shadow-lg")}
    >
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs font-semibold text-primary dark:bg-primary/20"
        >
          {index + 1}
        </span>

        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label={`Reorder ${stop.destinationName}. Use edit actions for keyboard reordering.`}
          className="flex h-7 w-5 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/60 transition-colors hover:text-muted-foreground focus-visible:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {stop.destinationName}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <CalendarRange className="h-3 w-3 shrink-0 text-travel-blue" aria-hidden="true" />
            {describeDate(stop.arrivalDate)?.shortDate} –{" "}
            {describeDate(stop.departureDate)?.shortDate}
            {nights > 0 ? (
              <span className="inline-flex items-center gap-1">
                <MoonStar className="h-3 w-3" aria-hidden="true" />
                {nights} {nights === 1 ? "night" : "nights"}
              </span>
            ) : (
              "Same-day"
            )}
          </p>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={onEdit}
          disabled={disabled}
          aria-label={`Edit ${stop.destinationName}`}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
          disabled={disabled}
          aria-label={`Remove ${stop.destinationName}`}
        >
          {disabled ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </Button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Stop form (add + edit share it)                                     */
/* ------------------------------------------------------------------ */

interface StopFormProps {
  /** [firstTripDay, lastTripDay] — null when unknown. */
  tripDates: [string | undefined, string | undefined];
  initialValues?: Partial<StopFormValues>;
  submitLabel: React.ReactNode;
  pending?: boolean;
  onSubmit: (values: StopFormValues) => void;
  onCancel: () => void;
}

function StopForm({
  tripDates,
  initialValues,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: StopFormProps) {
  const [errors, setErrors] = useState<
    Partial<Record<"destinationId" | "destinationName" | "arrivalDate" | "departureDate", string>>
  >({});
  const [values, setValues] = useState<StopFormValues>({
    destinationId: initialValues?.destinationId ?? "",
    destinationName: initialValues?.destinationName ?? "",
    arrivalDate: initialValues?.arrivalDate ?? "",
    departureDate: initialValues?.departureDate ?? "",
  });

  const schema = useMemo(() => stopFormSchema(tripDates), [tripDates]);

  const setField = <K extends keyof StopFormValues>(key: K, value: StopFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in fieldErrors)) {
          fieldErrors[key as keyof typeof fieldErrors] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    onSubmit(result.data);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DestinationSearch
        selected={values.destinationId ? { id: values.destinationId, city: values.destinationName, country: "", description: "", image: "", imageAlt: "", rating: 0, reviews: 0, estimatedDailyCostInr: 0, tags: [] } : null}
        onSelect={(destination) => {
          setField("destinationId", destination.id);
          setField("destinationName", destination.name);
        }}
        onClear={() => {
          setField("destinationId", "");
          setField("destinationName", "");
        }}
        error={errors.destinationName}
        fieldId="stop-destination"
        label="City or region"
        placeholder="Search destinations…"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="stop-arrival" className="text-sm font-medium text-foreground">
            Arrival date <span className="text-destructive">*</span>
          </label>
          <input
            id="stop-arrival"
            type="date"
            min={tripDates[0]}
            max={tripDates[1]}
            value={values.arrivalDate}
            onChange={(event) => setField("arrivalDate", event.target.value)}
            aria-invalid={Boolean(errors.arrivalDate)}
            aria-describedby={errors.arrivalDate ? "stop-arrival-error" : undefined}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 [color-scheme:light] dark:[color-scheme:dark]"
          />
          {errors.arrivalDate ? (
            <p id="stop-arrival-error" role="alert" className="text-sm text-destructive">
              {errors.arrivalDate}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="stop-departure" className="text-sm font-medium text-foreground">
            Departure date <span className="text-destructive">*</span>
          </label>
          <input
            id="stop-departure"
            type="date"
            min={values.arrivalDate || tripDates[0]}
            max={tripDates[1]}
            value={values.departureDate}
            onChange={(event) => setField("departureDate", event.target.value)}
            aria-invalid={Boolean(errors.departureDate)}
            aria-describedby={errors.departureDate ? "stop-departure-error" : undefined}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
          />
          {errors.departureDate ? (
            <p id="stop-departure-error" role="alert" className="text-sm text-destructive">
              {errors.departureDate}
            </p>
          ) : null}
        </div>
      </div>

      {!values.destinationId && !errors.destinationName ? (
        <p className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
          Start typing to pick from known destinations.
        </p>
      ) : null}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          <X className="h-4 w-4 sm:hidden" aria-hidden="true" />
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}