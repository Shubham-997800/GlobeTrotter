import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
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
  StopInput,
  ViewMode,
} from "@/features/trips/itinerary.types";
import { validateItinerary } from "@/features/trips/itinerary.utils";
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
import { TripHeader } from "@/features/trips/components/TripHeader";
import type { ActivityFormValues } from "@/features/trips/schemas/itinerary.schema";

/**
 * /trips/:tripId/itinerary — the day-by-day builder.
 *
 * Autosave: every mutation persists immediately (mock service), the
 * pill reflects query state, Ctrl+S forces a refetch-synced save.
 */
export default function ItineraryBuilderPage() {
  const { tripId = "" } = useParams<{ tripId: string }>();

  const tripQuery = useTrip(tripId);
  const itineraryQuery = useItinerary(tripId);

  const trip = tripQuery.data ?? null;
  const itinerary = itineraryQuery.data ?? null;
  const days = itinerary?.days ?? [];

  /* ---------------- local UI state ---------------- */
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [view, setView] = useState<ViewMode>("list");
  const [addOpen, setAddOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [movingActivity, setMovingActivity] = useState<ItineraryActivity | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  /* Default to the first day once data lands. */
  useEffect(() => {
    if (!selectedDayId && days.length > 0) setSelectedDayId(days[0].id);
  }, [days, selectedDayId]);

  /* Keep selection valid if the trip shrinks. */
  useEffect(() => {
    if (selectedDayId && days.length > 0 && !days.some((day) => day.id === selectedDayId)) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  const selectedDayIndex = Math.max(0, days.findIndex((day) => day.id === selectedDayId));
  const selectedDay = days[selectedDayIndex] ?? null;

  /* ---------------- mutations ---------------- */
  const onSettled = useCallback(() => setSaveState("saved"), []);
  const onError = useCallback(() => {
    setSaveState("dirty");
    toast.error("Couldn't save that change — retry or press Save now.");
  }, []);

  const addMutation = useAddActivity(tripId, onSettled, onError);
  const updateMutation = useUpdateActivity(tripId, onSettled, onError);
  const deleteMutation = useDeleteActivity(tripId, onSettled, onError);
  const duplicateMutation = useDuplicateActivity(tripId, onSettled, onError);
  const reorderMutation = useReorderActivities(tripId, onSettled, onError);
  const moveMutation = useMoveActivityToDay(tripId, onSettled, onError);
  const saveDayMutation = useUpdateDay(tripId, onSettled, onError);
  const completeMutation = useCompleteTrip(tripId);

  const addStopMutation = useAddStop(tripId, onSettled, onError);
  const updateStopMutation = useUpdateStop(tripId, onSettled, onError);
  const deleteStopMutation = useDeleteStop(tripId, onSettled, onError);
  const reorderStopsMutation = useReorderStops(tripId, onSettled, onError);

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

  /* Reflect any in-flight mutation in the pill. */
  useEffect(() => {
    if (isMutating) setSaveState("saving");
  }, [isMutating]);

  /* ---------------- derived ---------------- */
  const issues = useMemo(
    () => (trip && itinerary ? validateItinerary(itinerary, trip) : []),
    [itinerary, trip],
  );

  const addedCatalogIds = useMemo(() => {
    const ids = new Set<string>();
    for (const day of days) {
      for (const activity of day.activities) {
        if (activity.catalogActivityId) ids.add(activity.catalogActivityId);
      }
    }
    return ids;
  }, [days]);

  /* ---------------- handlers ---------------- */
  const handleAddFromCatalog = useCallback(
    (suggestion: import("@/features/trips/trips.types").ActivitySuggestion) => {
      if (!selectedDay) return;
      const input: ActivityInput = {
        name: suggestion.name,
        description: suggestion.description,
        category: suggestion.category,
        location: suggestion.city,
        startTime: "10:00",
        endTime: "11:30",
        estimatedCostInr: suggestion.costInr,
        image: suggestion.image,
        imageAlt: suggestion.imageAlt,
        catalogActivityId: suggestion.id,
        source: "catalog",
      };
      addMutation.mutate(
        { dayId: selectedDay.id, input },
        {
          onSuccess: () => {
            toast.success(`“${suggestion.name}” added at 10:00 — adjust times anytime.`);
            setAddOpen(false);
          },
        },
      );
    },
    [selectedDay, addMutation],
  );

  const handleAddCustom = useCallback(
    (values: ActivityFormValues & { estimatedCostInr: number }) => {
      if (!selectedDay) return;
      const input: ActivityInput = {
        name: values.name,
        description: values.description,
        category: values.category,
        location: values.location,
        startTime: values.startTime,
        endTime: values.endTime,
        estimatedCostInr: values.estimatedCostInr,
        source: "custom",
      };
      addMutation.mutate(
        { dayId: values.dayId || selectedDay.id, input },
        {
          onSuccess: () => {
            toast.success(`“${values.name}” added.`);
            setAddOpen(false);
          },
        },
      );
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
      updateMutation.mutate(
        { activityId: editingActivity.id, patch },
        {
          onSuccess: () => {
            toast.success("Activity updated.");
            setEditingActivity(null);
          },
        },
      );
    },
    [editingActivity, updateMutation],
  );

  const handleComplete = useCallback(() => {
    completeMutation.mutate(undefined, {
      onSuccess: () =>
        toast.success("Trip marked as planned! Find it under Upcoming trips."),
    });
  }, [completeMutation]);

  /* Keyboard shortcuts: Ctrl+S save-sync, Ctrl+P preview. */
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

  /* ---------------- render ---------------- */
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

  const currency = trip.currency ?? "USD";

  return (
    <AppShell
      crumbs={[
        { label: "Trips", to: "/trips" },
        { label: trip.destinationName, to: `/trips/${trip.id}` },
        { label: "Itinerary" },
      ]}
      title="Plan Your Journey"
      description="Craft each day with drag-and-drop ease."
      actions={
        <div className="flex items-center gap-2">
          <ViewSwitcher view={view} onViewChange={setView} />
        </div>
      }
    >
      <div className="space-y-6">
        <TripHeader trip={trip} />

        <ItineraryOverview
          days={days}
          currency={currency}
          progress={itineraryProgress(itinerary, trip)}
          statusLabel={tripDisplayStatus(trip)}
          stops={itinerary.stops}
        />

        {/* Map view */}
        {view === "map" ? (
          <section aria-label="Route map">
            <ItineraryMap
              stops={itinerary.stops}
              activities={days.flatMap((day) => day.activities)}
            />
            <div className="mt-4">
              <StopsSection
                stops={itinerary.stops}
                days={days}
                isMutating={isMutating}
                onReorder={(orderedIds) =>
                  reorderStopsMutation.mutate(orderedIds)
                }
                onAdd={(stop) =>
                  addStopMutation.mutate(stop)
                }
                onUpdate={(stopId, patch) =>
                  updateStopMutation.mutate({ stopId, patch })
                }
                onDelete={(stopId) =>
                  deleteStopMutation.mutate(stopId)
                }
              />
            </div>
          </section>
        ) : null}

        {/* Day navigation */}
        <DayNavigation
          days={days}
          selectedDayId={selectedDayId}
          onSelect={setSelectedDayId}
          issueDayIds={new Set(issues.map((issue) => issue.dayId).filter(Boolean))}
        />

        {/* Day details + timeline */}
        {selectedDay ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-4">
              <DayDetails
                key={selectedDay.id}
                day={selectedDay}
                dayIndex={selectedDayIndex}
                currency={currency}
                isMutating={isMutating}
                onSaveNotes={(notes) =>
                  saveDayMutation.mutate(
                    { dayId: selectedDay.id, patch: { notes } },
                    { onSuccess: () => toast.success("Day notes saved.") },
                  )
                }
              />

              <ActivityTimeline
                dayId={selectedDay.id}
                activities={selectedDay.activities}
                currency={currency}
                isMutating={isMutating}
                onAddClick={() => setAddOpen(true)}
                onReorder={(orderedIds) =>
                  reorderMutation.mutate({ dayId: selectedDay.id, orderedIds })
                }
                onEdit={(activity) => setEditingActivity(activity)}
                onDuplicate={(activity) =>
                  duplicateMutation.mutate(activity.id)
                }
                onDelete={(activityId) =>
                  deleteMutation.mutate(activityId)
                }
                onMoveToDay={(activity) => setMovingActivity(activity)}
              />
            </div>

            {/* Sidebar: stops in list view */}
            {view === "list" ? (
              <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
                <StopsSection
                  stops={itinerary.stops}
                  days={days}
                  isMutating={isMutating}
                  onReorder={(orderedIds) =>
                    reorderStopsMutation.mutate(orderedIds)
                  }
                  onAdd={(stop) => addStopMutation.mutate(stop)}
                  onUpdate={(stopId, patch) =>
                    updateStopMutation.mutate({ stopId, patch })
                  }
                  onDelete={(stopId) => deleteStopMutation.mutate(stopId)}
                />
              </aside>
            ) : null}
          </div>
        ) : null}

        {/* Sticky action bar */}
        <ActionBar
          saveState={saveState}
          lastSavedAt={itinerary.lastSavedAt ?? null}
          issues={issues}
          canComplete={Boolean(itinerary.days.some((day) => day.activities.length > 0))}
          isCompleting={completeMutation.isPending}
          onSave={() => {
            itineraryQuery.refetch().then(() => setSaveState("saved"));
            toast.success("Itinerary saved.");
          }}
          onPreview={() => setPreviewOpen(true)}
          onComplete={handleComplete}
        />
      </div>

      {/* Dialogs */}
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
          moveMutation.mutate(
            { activityId: movingActivity.id, targetDayId: dayId },
            {
              onSuccess: () => {
                toast.success("Activity moved.");
                setMovingActivity(null);
              },
            },
          );
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

import { itineraryProgress, tripDisplayStatus } from "@/features/trips/itinerary.utils";
import type { TripRecord } from "@/features/trips/trips.types";