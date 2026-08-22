import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ItineraryActivity } from "@/features/trips/itinerary.types";
import { activityDurationLabel, dayOverlapPairs } from "@/features/trips/itinerary.utils";
import { cn } from "@/lib/utils";
import { ActivityCard } from "./ActivityCard";
import { EmptyItinerary } from "./EmptyItinerary";

interface ActivityTimelineProps {
  dayId: string;
  activities: ItineraryActivity[];
  currency: string;
  isMutating: boolean;
  onAddClick: () => void;
  onReorder: (orderedIds: string[]) => void;
  onEdit: (activity: ItineraryActivity) => void;
  onDuplicate: (activity: ItineraryActivity) => void;
  onDelete: (activityId: string) => void;
  onMoveToDay: (activity: ItineraryActivity) => void;
}

/** Vertical drag-to-reorder timeline for one day. */
export function ActivityTimeline({
  dayId,
  activities,
  currency,
  isMutating,
  onAddClick,
  onReorder,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveToDay,
}: ActivityTimelineProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const orderedIds = activities.map((activity) => activity.id);
  const draggingActivity = draggingId
    ? activities.find((activity) => activity.id === draggingId) ?? null
    : null;

  const handleDragStart = (event: DragStartEvent) =>
    setDraggingId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(orderedIds, oldIndex, newIndex));
  };

  if (activities.length === 0 && !isMutating) {
    return <EmptyItinerary onAddActivity={onAddClick} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingId(null)}
    >
      <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
        <ul
          aria-label="Day timeline"
          className="flex flex-col gap-3"
          key={dayId}
        >
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              currency={currency}
              overlaps={overlapsByActivity.get(activity.id) ?? []}
              isFirst={index === 0}
              isLast={index === activities.length - 1}
              onEdit={() => onEdit(activity)}
              onDuplicate={() => onDuplicate(activity)}
              onDelete={() => onDelete(activity.id)}
              onMoveToDay={() => onMoveToDay(activity)}
              onMoveUp={() => onReorder(arrayMove(orderedIds, index, index - 1))}
              onMoveDown={() => onReorder(arrayMove(orderedIds, index, index + 1))}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay>
        {draggingActivity ? (
          <div className={cn("rounded-xl border border-primary/40 bg-card px-4 py-3 text-sm font-medium text-foreground shadow-lg")}>
            {activityDurationLabel(draggingActivity.startTime, draggingActivity.endTime)
              ? `${draggingActivity.startTime} · `
              : ""}
            {draggingActivity.name}
          </div>
        ) : null}
      </DragOverlay>

      <p className="sr-only">
        To reorder activities with the keyboard, focus an item&apos;s grip
        handle and press Space to pick it up, then use the arrow keys to move
        it and Space or Enter to drop it. You can also use each card&apos;s
        actions menu.
      </p>

      <Button variant="outline" className="w-full border-dashed" onClick={onAddClick}>
        <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        Add another activity
      </Button>
    </DndContext>
  );
}

const overlapsByActivity = new Map<
  string,
  Array<{ otherName: string; startTime: string; endTime: string }>
>();