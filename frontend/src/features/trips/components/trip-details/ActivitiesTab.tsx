import { useMemo, useState } from "react";
import { Filter, Plus, Search, Trash2 } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { ActivityCard } from "@/features/trips/components/itinerary/ActivityCard";
import { ActivityEditorDialog } from "@/features/trips/components/itinerary/ActivityEditorDialog";
import { MoveActivityDialog } from "@/features/trips/components/itinerary/MoveActivityDialog";
import { findOverlaps } from "@/features/trips/itinerary.utils";
import {
  useDeleteActivity,
  useDuplicateActivity,
  useMoveActivityToDay,
  useReorderActivities,
  useUpdateActivity,
} from "@/features/trips/useItinerary";
import { categoryLabel, categoryTotals } from "@/features/trips/trip-details.logic";
import type { ItineraryActivity, ItineraryRecord } from "@/features/trips/itinerary.types";
import type { TripRecord } from "@/features/trips/trips.types";

interface ActivitiesTabProps {
  trip: TripRecord;
  itinerary: ItineraryRecord | null | undefined;
  onOpenBuilder: () => void;
}

export function ActivitiesTab({ trip, itinerary, onOpenBuilder }: ActivitiesTabProps) {
  const activities = itinerary?.activities ?? [];
  const days = itinerary?.days ?? [];

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [movingActivity, setMovingActivity] = useState<ItineraryActivity | null>(null);

  const updateActivity = useUpdateActivity(trip.id);
  const deleteActivity = useDeleteActivity(trip.id);
  const duplicateActivity = useDuplicateActivity(trip.id);
  const moveActivity = useMoveActivityToDay(trip.id);
  const reorderActivities = useReorderActivities(trip.id);

  const categories = useMemo(
    () => ["all", ...new Set(activities.map((a) => a.category).filter(Boolean))],
    [activities]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter;
      const matchesDay = dayFilter === "all" || activity.dayId === dayFilter;
      const matchesSearch =
        searchQuery === "" ||
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDay && matchesSearch;
    });
  }, [activities, categoryFilter, dayFilter, searchQuery]);

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, ItineraryActivity[]>();
    for (const activity of filteredActivities) {
      const dayId = activity.dayId;
      const arr = groups.get(dayId) ?? [];
      arr.push(activity);
      groups.set(dayId, arr);
    }
    return groups;
  }, [filteredActivities]);

  const overlapsByActivity = useMemo(() => {
    const map = new Map<string, ReturnType<typeof findOverlaps>>();
    for (const activity of activities) {
      map.set(activity.id, findOverlaps(activities, activity.id));
    }
    return map;
  }, [activities]);

  const handleReorder = (dayId: string, orderedIds: string[]) => {
    reorderActivities.mutate({ dayId, orderedIds });
  };

  const handleMove = (dayId: string) => {
    if (movingActivity) {
      moveActivity.mutate({ activityId: movingActivity.id, targetDayId: dayId });
      setMovingActivity(null);
    }
  };

  const handleDelete = (activityId: string) => {
    deleteActivity.mutate(activityId);
  };

  if (!itinerary) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Skeleton className="h-12 w-12 mx-auto rounded-full" />
          <p className="mt-4 text-lg font-medium text-foreground">Loading activities…</p>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Plus className="h-12 w-12 mx-auto text-muted-foreground/50" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-foreground">No activities yet</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Add your first activity in the itinerary builder, or use the button below.
          </p>
          <Button className="mt-6" onClick={onOpenBuilder}>
            Open builder <Plus className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section aria-label="Activities" className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search activities…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories
                  .filter((c) => c !== "all")
                  .map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabel(cat)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={dayFilter} onValueChange={setDayFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="All days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All days</SelectItem>
                {days
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((day, idx) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {idx + 1}: {day.date}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
            Category breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryTotals(activities).map((cat) => (
              <div
                key={cat.category}
                className="rounded-lg border border-border bg-card/50 p-3"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {cat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">{cat.count}</p>
                <p className="text-sm text-muted-foreground">
                  {cat.costInr.toLocaleString()}₹ estimated
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4" role="list" aria-label="Activities by day">
        {days
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((day) => {
            const dayActivities = groupedByDay.get(day.id) ?? [];
            if (dayActivities.length === 0 && dayFilter !== "all" && dayFilter !== day.id) {
              return null;
            }
            return (
              <Card key={day.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          Day {day.date}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground truncate">
                          {day.date}
                        </p>
                        <p className="text-sm text-muted-foreground">{day.date}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {dayActivities.length} activity{dayActivities.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                {dayActivities.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2 pb-2">
                      {dayActivities.map((activity, index) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          currency={trip.currency}
                          overlaps={overlapsByActivity.get(activity.id) ?? []}
                          isFirst={index === 0}
                          isLast={index === dayActivities.length - 1}
                          onEdit={() => setEditingActivity(activity)}
                          onDuplicate={() => duplicateActivity.mutate(activity.id)}
                          onDelete={() => handleDelete(activity.id)}
                          onMoveToDay={() => setMovingActivity(activity)}
                          onMoveUp={
                            index > 0
                              ? () => {
                                  const newOrder = [...dayActivities];
                                  [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                  handleReorder(day.id, newOrder.map((a) => a.id));
                                }
                              : () => {}
                          }
                          onMoveDown={
                            index < dayActivities.length - 1
                              ? () => {
                                  const newOrder = [...dayActivities];
                                  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                  handleReorder(day.id, newOrder.map((a) => a.id));
                                }
                              : () => {}
                          }
                        />
                      ))}
                    </div>
                  </CardContent>
                )}
                {dayActivities.length === 0 && (
                  <CardContent className="pt-0 pb-3 text-center text-sm text-muted-foreground py-4">
                    No activities match current filters.
                  </CardContent>
                )}
              </Card>
            );
          })}
      </div>

      {editingActivity && (
        <ActivityEditorDialog
          activity={editingActivity}
          days={days}
          currency={trip.currency}
          isMutating={updateActivity.isPending}
          onSave={(updates) => updateActivity.mutate({ activityId: editingActivity.id, patch: updates })}
          onOpenChange={(open) => !open && setEditingActivity(null)}
        />
      )}

      {movingActivity && (
        <MoveActivityDialog
          activity={movingActivity}
          days={days}
          isMutating={moveActivity.isPending}
          onMove={handleMove}
          onOpenChange={(open) => !open && setMovingActivity(null)}
        />
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="hidden">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the activity from your itinerary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {}}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}