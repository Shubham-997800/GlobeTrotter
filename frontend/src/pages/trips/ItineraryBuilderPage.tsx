import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { CheckCircle2, Plus, TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useAddActivity,
  useAddStop,
  useCompleteTrip,
  useDeleteActivity,
  useDeleteStop,
  useDeleteTrip,
  useDuplicateActivity,
  useEditTrip,
  useItinerary,
  useMoveActivityToDay,
  useReorderActivities,
  useReorderStops,
  useTrip,
  useUpdateActivity,
  useUpdateDay,
} from "@/features/trips/useItinerary";
import type {
  ActivityInput,
  ItineraryActivity,
  StopInput,
  ValidationIssue,
  ViewMode,
} from "@/features/trips/itinerary.types";
import type { ActivityFormValues } from "@/features/trips/schemas/itinerary.schema";
import type { ActivitySuggestion } from "@/features/trips/trips.types";
import { destinations } from "@/features/trips/trips.data";
import {
  findOverlaps,
  itineraryProgress,
  sortDayActivities,
  tripDates as buildTripDates,
  validateItinerary,
  type ActivityOverlap,
} from "@/features/trips/itinerary.utils";
import { ErrorState } from "@/features/dashboard/components/States";

import { ViewSwitcher } from "@/features/trips/components/itinerary/ViewSwitcher";
import { TripHeader } from "@/features/trips/components/itinerary/TripHeader";
import { ItineraryOverview } from "@/features/trips/components/itinerary/ItineraryOverview";
import { DayNavigation } from "@/features/trips/components/itinerary/DayNavigation";
import { DayDetails } from "@/features/trips/components/itinerary/DayDetails";
import { ActivityCard } from "@/features/trips/components/itinerary/ActivityCard";
import { ActivityFormDialog } from "@/features/trips/components/itinerary/ActivityFormDialog";
import { StopsPanel } from "@/features/trips/components/itinerary/StopsPanel";
import { SuggestedActivities } from "@/features/trips/components/SuggestedActivities";
import { DraftStatus } from "@/features/trips/components/DraftStatus";
import type { DraftState } from "@/features/trips/useDraftAutosave";

/**
 * /trips/:tripId/itinerary — the day-by-day builder.
 *
 * Every mutation persists immediately through the mock service with an
 * optimistic cache write; the pill reflects query state and Ctrl+S forces
 * a refetch-synced save.
 */
export default function ItineraryBuilderPage() {
  const { tripId = "" } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const tripQuery = useTrip(tripId);
  const itineraryQuery = useItinerary(tripId);

  const trip = tripQuery.data ?? null;
  const itinerary = itineraryQuery.data ?? null;
  const days = itinerary?.days ?? [];

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const dates = useMemo(
    () => (trip ? buildTripDates(trip) : []),
    [trip],
  );

  /* ---------------- local UI state ---------------- */
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [view, setView] = useState<ViewMode>("day");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ItineraryActivity | null>(null);
  const [movingActivity, setMovingActivity] = useState<ItineraryActivity | null>(
    null,
  );

  /* Default to the first day once data lands. */
  useEffect(() => {
    if (!selectedDayId && days.length > 0) setSelectedDayId(days[0].id);
  }, [days, selectedDayId]);

  /* Keep the selection valid if the trip shrinks. */
  useEffect(() => {
    if (
      selectedDayId &&
      days.length > 0 &&
      !days.some((day) => day.id === selectedDayId)
    ) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  const selectedDayIndex = Math.max(
    0,
    days.findIndex((day) => day.id === selectedDayId),
  );
  const selectedDay = days[selectedDayIndex] ?? null;
  const selectedActivities = useMemo(
    () =>
      itinerary && selectedDay
        ? sortDayActivities(itinerary.activities, selectedDay.id)
        : [],
    [itinerary, selectedDay],
  );

  /* ---------------- mutations ---------------- */
  const onErrorFactory = useCallback(
    (what: string) => () => toast.error(`${what} Please try again.`),
    [],
  );
  const onSettledToast = useCallback((what: string) => () => {
    toast.success(what);
  }, []);

  const addMutation = useAddActivity(tripId);
  const updateMutation = useUpdateActivity(tripId);
  const deleteMutation = useDeleteActivity(tripId);
  const duplicateMutation = useDuplicateActivity(tripId);
  const reorderMutation = useReorderActivities(tripId);
  const moveMutation = useMoveActivityToDay(tripId);
  const updateDayMutation = useUpdateDay(tripId);
  const addStopMutation = useAddStop(tripId);
  const deleteStopMutation = useDeleteStop(tripId);
  const reorderStopsMutation = useReorderStops(tripId);
  const completeMutation = useCompleteTrip(tripId);
  const editTripMutation = useEditTrip(tripId);
  const deleteTripMutation = useDeleteTrip();

  const isMutating =
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    duplicateMutation.isPending ||
    reorderMutation.isPending ||
    moveMutation.isPending ||
    updateDayMutation.isPending ||
    addStopMutation.isPending ||
    deleteStopMutation.isPending ||
    reorderStopsMutation.isPending;

  /* ---------------- derived ---------------- */
  const issues: ValidationIssue[] = useMemo(
    () => (trip && itinerary ? validateItinerary(itinerary, trip) : []),
    [itinerary, trip],
  );

  const addedCatalogIds = useMemo(() => {
    const ids = new Set<string>();
    if (!itinerary) return ids;
    for (const activity of itinerary.activities) {
      if (activity.catalogActivityId) ids.add(activity.catalogActivityId);
    }
    return ids;
  }, [itinerary]);

  const saveState: DraftState = isMutating ? "saving" : "saved";
  const lastSavedAt =
    itinerary?.updatedAt != null ? new Date(itinerary.updatedAt) : null;

  /* ---------------- handlers ---------------- */
  const handleCreateSubmit = useCallback(
    (values: ActivityFormValues) => {
      const input: ActivityInput = {
        dayId: values.dayId,
        name: values.name,
        description: values.description,
        category: "custom",
        location: values.location,
        startTime: values.startTime,
        endTime: values.endTime,
        estimatedCostInr: Number(values.estimatedCost || "0"),
        source: "custom",
      };
      addMutation.mutate(input, {
        onSuccess: () => {
          toast.success(`“${values.name}” added.`);
          setCreateOpen(false);
        },
        onError: onErrorFactory("Couldn't add that activity."),
      });
    },
    [addMutation, onErrorFactory],
  );

  const handleCatalogAdd = useCallback(
    (suggestion: ActivitySuggestion) => {
      if (!selectedDay) return;
      const input: ActivityInput = {
        dayId: selectedDay.id,
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
      addMutation.mutate(input, {
        onSuccess: () =>
          toast.success(
            `“${suggestion.name}” added at 10:00 — adjust times anytime.`,
          ),
        onError: onErrorFactory("Couldn't add that activity."),
      });
    },
    [selectedDay, addMutation, onErrorFactory],
  );

  const handleEditSubmit = useCallback(
    (values: ActivityFormValues) => {
      if (!editTarget) return;
      const patch: Partial<ActivityInput> = {
        name: values.name,
        description: values.description,
        location: values.location,
        startTime: values.startTime,
        endTime: values.endTime,
        estimatedCostInr: Number(values.estimatedCost || "0"),
        dayId: values.dayId,
      };
      updateMutation.mutate(
        { activityId: editTarget.id, patch },
        {
          onSuccess: () => {
            toast.success("Activity updated.");
            setEditTarget(null);
          },
          onError: onErrorFactory("Couldn't save that change."),
        },
      );
    },
    [editTarget, updateMutation, onErrorFactory],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !selectedDay) return;
      const ids = selectedActivities.map((activity) => activity.id);
      const from = ids.indexOf(String(active.id));
      const to = ids.indexOf(String(over.id));
      if (from < 0 || to < 0) return;
      reorderMutation.mutate(
        { dayId: selectedDay.id, orderedIds: arrayMove(ids, from, to) },
        { onError: onErrorFactory("Couldn't reorder that day.") },
      );
    },
    [selectedDay, selectedActivities, reorderMutation, onErrorFactory],
  );

  const handleShift = useCallback(
    (activity: ItineraryActivity, direction: -1 | 1) => {
      if (!selectedDay) return;
      const ids = selectedActivities.map((item) => item.id);
      const index = ids.indexOf(activity.id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= ids.length) return;
      reorderMutation.mutate(
        { dayId: selectedDay.id, orderedIds: arrayMove(ids, index, target) },
        { onError: onErrorFactory("Couldn't reorder that day.") },
      );
    },
    [selectedDay, selectedActivities, reorderMutation, onErrorFactory],
  );

  /* Ctrl+S forces a refetch-synced save. */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      void itineraryQuery.refetch().then(() => toast.success("Itinerary saved."));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [itineraryQuery]);

  /* ---------------- render ---------------- */
  if (tripQuery.isLoading || itineraryQuery.isLoading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-6">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="h-12 w-2/3 rounded-xl bg-muted" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (tripQuery.isError || itineraryQuery.isError || !trip || !itinerary) {
    return (
      <AppShell>
        <ErrorState
          title="We couldn't load this itinerary"
          description="The trip may have been removed, or something went wrong on our side."
          onRetry={() => {
            if (tripQuery.isError) void tripQuery.refetch();
            if (itineraryQuery.isError) void itineraryQuery.refetch();
          }}
        />
      </AppShell>
    );
  }

  const currency = trip.currency ?? "INR";
  const sortedStops = [...itinerary.stops].sort((a, b) => a.order - b.order);

  const moveStop = (stopId: string, direction: -1 | 1) => {
    const ids = sortedStops.map((stop) => stop.id);
    const from = ids.indexOf(stopId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    reorderStopsMutation.mutate(arrayMove(ids, from, to), {
      onError: onErrorFactory("Couldn't reorder the route."),
    });
  };

  const overlapsFor = (activity: ItineraryActivity): ActivityOverlap[] =>
    findOverlaps(selectedActivities, activity.id);

  return (
    <AppShell
      title="Plan Your Journey"
      description="Craft each day at your own pace."
      actions={<ViewSwitcher value={view} onChange={setView} />}
    >
      <div className="space-y-6 pb-20 sm:pb-28">
        <TripHeader
          trip={trip}
          isDeleting={deleteTripMutation.isPending}
          isSavingEdit={editTripMutation.isPending}
          onDelete={() =>
            deleteTripMutation.mutate(trip.id, {
              onSuccess: () => {
                toast.success("Trip deleted.");
                navigate("/trips");
              },
              onError: onErrorFactory("Couldn't delete the trip."),
            })
          }
          onEditSave={(patch) =>
            editTripMutation.mutate(patch, {
              onSuccess: () => toast.success("Trip updated."),
              onError: onErrorFactory("Couldn't update the trip."),
            })
          }
        />

        <ItineraryOverview progress={itineraryProgress(itinerary, trip)} />

        {issues.length > 0 ? (
          <Card className="border-warning-border bg-warning-bg">
            <CardContent className="flex items-start gap-3 py-4">
              <TriangleAlert
                className="mt-0.5 size-5 shrink-0 text-warning-text"
                aria-hidden="true"
              />
              <div className="min-w-0 text-sm text-warning-text">
                <p className="font-medium">
                  {issues.length} thing{issues.length !== 1 ? "s" : ""} need
                  {issues.length === 1 ? "s" : ""} attention
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {issues.slice(0, 3).map((issue) => (
                    <li key={issue.id}>{issue.message}</li>
                  ))}
                  {issues.length > 3 ? (
                    <li>and {issues.length - 3} more…</li>
                  ) : null}
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {view === "map" ? (
          <section aria-label="Route planner">
            <StopsPanel
              stops={sortedStops}
              tripDates={dates}
              isMutating={isMutating}
              onAdd={(input: StopInput) =>
                addStopMutation.mutate(input, {
                  onSuccess: onSettledToast("Stop added to your route."),
                  onError: onErrorFactory("Couldn't add that stop."),
                })
              }
              onDelete={(stopId) =>
                deleteStopMutation.mutate(stopId, {
                  onSuccess: onSettledToast("Stop removed."),
                  onError: onErrorFactory("Couldn't remove that stop."),
                })
              }
              onMoveUp={(stopId) => moveStop(stopId, -1)}
              onMoveDown={(stopId) => moveStop(stopId, 1)}
            />
          </section>
        ) : (
          <>
            <DayNavigation
              days={days}
              activities={itinerary.activities}
              selectedDayId={selectedDayId}
              onSelect={setSelectedDayId}
            />

            {selectedDay ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-4">
                  <DayDetails
                    key={selectedDay.id}
                    dayIndex={selectedDayIndex}
                    day={selectedDay}
                    activities={itinerary.activities}
                    currency={currency}
                    issues={issues.filter(
                      (issue) => issue.dayId === selectedDay.id,
                    )}
                    isSavingDay={updateDayMutation.isPending}
                    onUpdateDay={(patch) =>
                      updateDayMutation.mutate(
                        { dayId: selectedDay.id, patch },
                        {
                          onSuccess: () => toast.success("Day updated."),
                          onError: onErrorFactory("Couldn't update the day."),
                        },
                      )
                    }
                  />

                  <DndContext
                    sensors={dndSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedActivities.map((activity) => activity.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ol className="space-y-3" aria-label="Day timeline">
                        {selectedActivities.map((activity, index) => (
                          <li key={activity.id}>
                            <ActivityCard
                              activity={activity}
                              currency={currency}
                              overlaps={overlapsFor(activity)}
                              isFirst={index === 0}
                              isLast={index === selectedActivities.length - 1}
                              onEdit={() => setEditTarget(activity)}
                              onDuplicate={() =>
                                duplicateMutation.mutate(activity.id, {
                                  onError: onErrorFactory(
                                    "Couldn't duplicate that activity.",
                                  ),
                                })
                              }
                              onDelete={() =>
                                deleteMutation.mutate(activity.id, {
                                  onError: onErrorFactory(
                                    "Couldn't delete that activity.",
                                  ),
                                })
                              }
                              onMoveToDay={() => setMovingActivity(activity)}
                              onMoveUp={() => handleShift(activity, -1)}
                              onMoveDown={() => handleShift(activity, 1)}
                            />
                          </li>
                        ))}
                      </ol>
                    </SortableContext>

                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                        Add activity
                      </Button>
                    </div>
                  </DndContext>
                </div>

                <aside className="min-w-0 space-y-4">
                  <StopsPanel
                    stops={sortedStops}
                    tripDates={dates}
                    isMutating={isMutating}
                    onAdd={(input) =>
                      addStopMutation.mutate(input, {
                        onSuccess: onSettledToast("Stop added to your route."),
                        onError: onErrorFactory("Couldn't add that stop."),
                      })
                    }
                    onDelete={(stopId) =>
                      deleteStopMutation.mutate(stopId, {
                        onSuccess: onSettledToast("Stop removed."),
                        onError: onErrorFactory("Couldn't remove that stop."),
                      })
                    }
                    onMoveUp={(stopId) => moveStop(stopId, -1)}
                    onMoveDown={(stopId) => moveStop(stopId, 1)}
                  />

                  <SuggestedActivities
                    addedIds={[...addedCatalogIds]}
                    onAdd={handleCatalogAdd}
                  />
                </aside>
              </div>
            ) : null}
          </>
        )}

        {/* Sticky action bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-subtle-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-3 py-2 sm:px-4 sm:py-3">
            <DraftStatus state={saveState} savedAt={lastSavedAt} />
            {issues.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-xs font-medium text-warning-text">
                <TriangleAlert className="size-3.5" aria-hidden="true" />
                {issues.length} issue{issues.length !== 1 ? "s" : ""}
              </span>
            ) : null}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void itineraryQuery
                    .refetch()
                    .then(() => toast.success("Itinerary saved."));
                }}
              >
                <span className="hidden sm:inline">Save now</span>
                <span className="sm:hidden">Save</span>
              </Button>
              <Button
                size="sm"
                disabled={
                  !days.some((day) =>
                    itinerary.activities.some((a) => a.dayId === day.id),
                  ) ||
                  completeMutation.isPending ||
                  trip.status !== "draft"
                }
                onClick={() =>
                  completeMutation.mutate(undefined, {
                    onSuccess: () =>
                      toast.success(
                        "Trip marked as planned! Find it under Upcoming trips.",
                      ),
                    onError: onErrorFactory("Couldn't complete the trip."),
                  })
                }
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Complete trip
              </Button>
            </div>
          </div>
        </div>

        {/* Create dialog */}
        <ActivityFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          days={days}
          defaultDayId={selectedDay?.id}
          isPending={addMutation.isPending}
          onSubmit={handleCreateSubmit}
        />

        {/* Edit dialog */}
        <ActivityFormDialog
          open={Boolean(editTarget)}
          onOpenChange={(open) => !open && setEditTarget(null)}
          mode="edit"
          days={days}
          activity={editTarget}
          isPending={updateMutation.isPending}
          onSubmit={handleEditSubmit}
        />

        {/* Move-to-day dialog */}
        <Dialog
          open={Boolean(movingActivity)}
          onOpenChange={(open) => !open && setMovingActivity(null)}
        >
          <DialogContent className="sm:max-w-sm sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle>Move “{movingActivity?.name}”</DialogTitle>
              <DialogDescription>
                Pick another day within this trip.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="move-day-target">Target day</Label>
              <Select
                value=""
                onValueChange={(targetDayId) => {
                  if (!movingActivity) return;
                  moveMutation.mutate(
                    {
                      activityId: movingActivity.id,
                      targetDayId,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Activity moved.");
                        setMovingActivity(null);
                      },
                      onError: onErrorFactory("Couldn't move that activity."),
                    },
                  );
                }}
              >
                <SelectTrigger id="move-day-target" className="w-full">
                  <SelectValue placeholder="Pick a day" />
                </SelectTrigger>
                <SelectContent>
                  {days
                    .filter((day) => day.id !== movingActivity?.dayId)
                    .map((day) => (
                      <SelectItem
                        key={day.id}
                        value={day.id}
                      >
                        Day {days.findIndex((entry) => entry.id === day.id) + 1}
                        {" · "}
                        {day.date}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMovingActivity(null)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
