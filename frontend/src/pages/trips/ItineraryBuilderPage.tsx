import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import {
  useAddActivity,
  useAddStop,
  useCompleteTrip,
  useDeleteActivity,
  useDeleteStop,
  useDuplicateActivity,
  useItinerary,
  useMoveActivityToDay,
  useReorderActivities,
  useReorderStops,
  useTrip,
  useUpdateActivity,
  useUpdateDay,
  useUpdateStop,
} from "@/features/trips/useItinerary";
import type {
  ActivityInput,
  ItineraryActivity,
  SaveState,
  ViewMode,
} from "@/features/trips/itinerary.types";
import { validateItinerary, itineraryProgress } from "@/features/trips/itinerary.utils";
import { AddActivityDialog } from "@/features/trips/components/itinerary/AddActivityDialog";
import { ActionBar } from "@/features/trips/components/itinerary/ActionBar";
import { ActivityEditorDialog } from "@/features/trips/components/itinerary/ActivityEditorDialog";
import { ActivityTimeline } from "@/features/trips/components/itinerary/ActivityTimeline";
import { DayDetails } from "@/features/trips/components/itinerary/DayDetails";
import { DayNavigation } from "@/features/trips/components/itinerary/DayNavigation";
import { ItineraryErrorState } from "@/features/trips/components/itinerary/ItineraryStates";
import { ItinerarySkeleton } from "@/features/trips/components/itinerary/ItineraryStates";
import { ItineraryMap } from "@/features/trips/components/itinerary/ItineraryMap";
import { ItineraryOverview } from "@/features/trips/components/itinerary/ItineraryOverview";
import { ItineraryPreviewDialog } from "@/features/trips/components/itinerary/ItineraryPreviewDialog";
import { MoveActivityDialog } from "@/features/trips/components/itinerary/MoveActivityDialog";
import { StopsSection } from "@/features/trips/components/itinerary/StopsSection";
import { ViewSwitcher } from "@/features/trips/components/itinerary/ViewSwitcher";
import { TripHeader } from "@/features/trips/components/itinerary/TripHeader";
import type { ActivityFormValues } from "@/features/trips/schemas/itinerary.schema";
import type { EditableTripPatch } from "@/features/trips/useItinerary";

/**
 * /trips/:tripId/itinerary — the day-by-day builder.
 */
export default function ItineraryBuilderPage() {
  const { tripId = "" } = useParams<{ tripId: string }>();

  const tripQuery = useTrip(tripId);
  const itineraryQuery = useItinerary(tripId);

  const trip = tripQuery.data ?? null;
  const itinerary = itineraryQuery.data ?? null;
  const days = itinerary?.days ?? [];
  const activities = itinerary?.activities ?? [];

  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [view, setView] = useState<ViewMode>("timeline");
  const [addOpen, setAddOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [movingActivity, setMovingActivity] = useState<ItineraryActivity | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  
  const [deletingTrip, setDeletingTrip] = useState(false);

  useEffect(() => {
    if (!selectedDayId && days.length > 0) setSelectedDayId(days[0].id);
  }, [days, selectedDayId]);

  useEffect(() => {
    if (selectedDayId && days.length > 0 && !days.some((day) => day.id === selectedDayId)) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  const selectedDayIndex = Math.max(0, days.findIndex((day) => day.id === selectedDayId));
  const selectedDay = days[selectedDayIndex] ?? null;
  const selectedDayActivities = activities.filter((a) => a.dayId === selectedDayId);

  /* mutations */
  const addMutation = useAddActivity(tripId);
  const updateMutation = useUpdateActivity(tripId);
  const deleteMutation = useDeleteActivity(tripId);
  const duplicateMutation = useDuplicateActivity(tripId);
  const reorderMutation = useReorderActivities(tripId);
  const moveMutation = useMoveActivityToDay(tripId);
  const saveDayMutation = useUpdateDay(tripId);
  const completeMutation = useCompleteTrip(tripId);

  const addStopMutation = useAddStop(tripId);
  const updateStopMutation = useUpdateStop(tripId);
  const deleteStopMutation = useDeleteStop(tripId);
  const reorderStopsMutation = useReorderStops(tripId);

  const isMutating =
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    duplicateMutation.isPending ||
    reorderMutation.isPending ||
    moveMutation.isPending ||
    saveDayMutation.isPending ||
    addStopMutation.isPending ||
    updateStopMutation.isPending ||
    deleteStopMutation.isPending ||
    reorderStopsMutation.isPending ||
    completeMutation.isPending;

  useEffect(() => {
    if (isMutating) setSaveState("saving");
    else setSaveState("saved");
  }, [isMutating]);

  const issues = useMemo(
    () => (trip && itinerary ? validateItinerary(itinerary, trip) : []),
    [itinerary, trip],
  );

  const addedCatalogIds = useMemo(() => {
    const ids = new Set<string>();
    for (const act of activities) {
      if (act.catalogActivityId) ids.add(act.catalogActivityId);
    }
    return ids;
  }, [activities]);

  const currency = trip?.currency ?? "USD";

  const handleAddFromCatalog = useCallback(
    (suggestion: import("@/features/trips/trips.types").ActivitySuggestion) => {
      if (!selectedDay) return;
      const input: ActivityInput = {
        dayId: selectedDay.id,
        name: suggestion.name,
        description: suggestion.description,
        category: suggestion.category as "adventure" | "custom" | "nature" | "food" | "culture",
        location: suggestion.city,
        startTime: "10:00",
        endTime: "11:30",
        estimatedCostInr: suggestion.costInr,
        image: suggestion.image,
        imageAlt: suggestion.imageAlt,
        catalogActivityId: suggestion.id,
        source: "catalog",
      };
      addMutation.mutate(input, {
        onSuccess: () => {
          toast.success(`“${suggestion.name}” added at 10:00 — adjust times anytime.`);
          setAddOpen(false);
        },
      });
    },
    [selectedDay, addMutation],
  );

  const handleAddCustom = useCallback(
    (values: ActivityFormValues & { estimatedCostInr: number }) => {
      if (!selectedDay) return;
      const input: ActivityInput = {
        dayId: values.dayId || selectedDay.id,
        name: values.name,
        description: values.description,
        category: values.category,
        location: values.location,
        startTime: values.startTime,
        endTime: values.endTime,
        estimatedCostInr: values.estimatedCostInr,
        source: "custom",
      };
      addMutation.mutate(input, {
        onSuccess: () => {
          toast.success(`“${values.name}” added.`);
          setAddOpen(false);
        },
      });
    },
    [selectedDay, addMutation],
  );

  const handleEditSave = useCallback(
    (values: ActivityFormValues & { estimatedCostInr: number }) => {
      if (!editingActivity) return;
      const patch: Partial<ActivityInput> = {
        name: values.name,
        description: values.description,
        location: values.location,
        category: values.category,
        startTime: values.startTime,
        endTime: values.endTime,
        estimatedCostInr: values.estimatedCostInr,
      };
      if (values.dayId !== editingActivity.dayId) {
        patch.dayId = values.dayId;
      }
      updateMutation.mutate({ activityId: editingActivity.id, patch }, {
        onSuccess: () => {
          toast.success("Activity updated.");
          setEditingActivity(null);
        },
      });
    },
    [editingActivity, updateMutation],
  );

  const handleComplete = useCallback(() => {
    completeMutation.mutate(undefined, {
      onSuccess: () =>
        toast.success("Trip marked as planned! Find it under Upcoming trips."),
    });
  }, [completeMutation]);

  const handleTripEditSave = useCallback(
    (_patch: EditableTripPatch) => {
      // Trip edit handled by TripHeader internally
    },
    [],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        itineraryQuery.refetch().then(() => setSaveState("saved"));
        toast.success("Itinerary saved.");
      } else if (key === "p") {
        event.preventDefault();
        setPreviewOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [itineraryQuery]);

  if (tripQuery.isLoading || itineraryQuery.isLoading) {
    return (
      <AppShell crumbs={[{ label: "Trips", to: "/trips" }, { label: "Itinerary" }]}>
        <ItinerarySkeleton />
      </AppShell>
    );
  }

  if (tripQuery.isError || itineraryQuery.isError || !trip || !itinerary) {
    return (
      <AppShell crumbs={[{ label: "Trips", to: "/trips" }, { label: "Itinerary" }]}>
        <ItineraryErrorState
          onRetry={() => {
            tripQuery.refetch();
            itineraryQuery.refetch();
          }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      crumbs={[
        { label: "Trips", to: "/trips" },
        { label: trip.destinationId, to: `/trips/${trip.id}` },
        { label: "Itinerary" },
      ]}
      title="Plan Your Journey"
      description="Craft each day with drag-and-drop ease."
      actions={
        <div className="flex items-center gap-2">
          <ViewSwitcher value={view} onChange={setView} />
        </div>
      }
    >
      <div className="space-y-6">
        <TripHeader
          trip={trip}
          isDeleting={deletingTrip}
          isSavingEdit={false}
          onDelete={() => setDeletingTrip(true)}
          onEditSave={handleTripEditSave}
        />

        <ItineraryOverview progress={itineraryProgress(itinerary, trip)} />

        {view === "map" ? (
          <section aria-label="Route map">
            <ItineraryMap stops={itinerary.stops} activities={activities} />
            <div className="mt-4">
              <StopsSection
                stops={itinerary.stops}
                days={days}
                isMutating={isMutating}
                onReorder={(orderedIds) => reorderStopsMutation.mutate(orderedIds)}
                onAdd={(stop) => addStopMutation.mutate(stop)}
                onUpdate={(stopId, patch) => updateStopMutation.mutate({ stopId, patch })}
                onDelete={(stopId) => deleteStopMutation.mutate(stopId)}
              />
            </div>
          </section>
        ) : null}

        <DayNavigation
          days={days}
          activities={activities}
          selectedDayId={selectedDayId}
          onSelect={setSelectedDayId}
        />

        {selectedDay ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-4">
              <DayDetails
                key={selectedDay.id}
                dayIndex={selectedDayIndex}
                day={selectedDay}
                activities={selectedDayActivities}
                currency={currency}
                issues={issues.filter((i) => i.dayId === selectedDayId)}
                isSavingDay={saveDayMutation.isPending}
                onUpdateDay={(patch) =>
                  saveDayMutation.mutate(
                    { dayId: selectedDay.id, patch },
                    { onSuccess: () => toast.success("Day notes saved.") },
                  )
                }
              />

              <ActivityTimeline
                dayId={selectedDay.id}
                activities={selectedDayActivities}
                currency={currency}
                isMutating={isMutating}
                onAddClick={() => setAddOpen(true)}
                onReorder={(orderedIds) =>
                  reorderMutation.mutate({ dayId: selectedDay.id, orderedIds })
                }
                onEdit={(activity) => setEditingActivity(activity)}
                onDuplicate={(activity) => duplicateMutation.mutate(activity.id)}
                onDelete={(activityId) => deleteMutation.mutate(activityId)}
                onMoveToDay={(activity) => setMovingActivity(activity)}
              />
            </div>

            {view === "timeline" ? (
              <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
                <StopsSection
                  stops={itinerary.stops}
                  days={days}
                  isMutating={isMutating}
                  onReorder={(orderedIds) => reorderStopsMutation.mutate(orderedIds)}
                  onAdd={(stop) => addStopMutation.mutate(stop)}
                  onUpdate={(stopId, patch) => updateStopMutation.mutate({ stopId, patch })}
                  onDelete={(stopId) => deleteStopMutation.mutate(stopId)}
                />
              </aside>
            ) : null}
          </div>
        ) : null}

        <ActionBar
          saveState={saveState}
          lastSavedAt={itinerary.updatedAt ? new Date(itinerary.updatedAt).getTime() : null}
          issues={issues}
          canComplete={activities.some((a) => days.some((d) => d.id === a.dayId))}
          isCompleting={completeMutation.isPending}
          onSave={() => {
            itineraryQuery.refetch().then(() => setSaveState("saved"));
            toast.success("Itinerary saved.");
          }}
          onPreview={() => setPreviewOpen(true)}
          onComplete={handleComplete}
        />
      </div>

      <AddActivityDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        days={days}
        defaultDayId={selectedDay?.id}
        currency={currency}
        isAdding={addMutation.isPending}
        addedIds={addedCatalogIds}
        onAddFromCatalog={handleAddFromCatalog}
        onAddCustom={handleAddCustom}
      />

      <ActivityEditorDialog
        activity={editingActivity}
        days={days}
        currency={currency}
        isMutating={updateMutation.isPending}
        onSave={handleEditSave}
        onOpenChange={(open) => !open && setEditingActivity(null)}
      />

      <MoveActivityDialog
        activity={movingActivity}
        days={days}
        isMutating={moveMutation.isPending}
        onMove={(dayId) => {
          if (!movingActivity) return;
          moveMutation.mutate({ activityId: movingActivity.id, targetDayId: dayId }, {
            onSuccess: () => {
              toast.success("Activity moved.");
              setMovingActivity(null);
            },
          });
        }}
        onOpenChange={(open) => !open && setMovingActivity(null)}
      />

      <ItineraryPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        record={itinerary}
        currency={currency}
      />
    </AppShell>
  );
}