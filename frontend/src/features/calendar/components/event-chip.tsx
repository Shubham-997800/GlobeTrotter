import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { CalendarEvent, EventDragData } from "../calendar.types";
import { EVENT_TYPE_META } from "./event-meta";

/**
 * Event chip used across all views. Trip-span and itinerary events are
 * draggable; trip spans themselves are not (they follow the trip).
 */
export function dragDataFor(event: CalendarEvent): EventDragData {
  return {
    eventId: event.id,
    source: event.source,
    type: event.type,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    title: event.title,
    tripId: event.tripId,
  };
}

export function EventChip({
  event,
  compact = false,
  draggable = true,
  onClick,
}: {
  event: CalendarEvent;
  compact?: boolean;
  draggable?: boolean;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: event.id,
    data: dragDataFor(event),
    disabled: !draggable || event.type === "trip",
  });

  const meta = EVENT_TYPE_META[event.type];
  const Icon = meta.icon;

  const chip = (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      onPointerDown={(pointerEvent) => {
        listeners?.onPointerDown?.(pointerEvent);
        if (!draggable || event.type === "trip") return;
        // Suppress the click right after a real drag.
        (pointerEvent.currentTarget as HTMLElement).dataset.dragging =
          isDragging ? "1" : "0";
      }}
      className={cn(
        "flex w-full items-center gap-1 rounded-md border px-1.5 text-left font-medium transition-colors",
        compact ? "h-5 text-[11px]" : "min-h-6 py-0.5 text-xs",
        meta.chipClass,
        event.status === "completed" && "opacity-70 line-through",
        event.status === "cancelled" && "line-through opacity-60",
        !draggable && "cursor-default",
        isDragging && "opacity-40",
      )}
      aria-label={`${meta.label}: ${event.title}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      {!compact && event.startTime ? (
        <span className="shrink-0 tabular-nums opacity-80">{event.startTime}</span>
      ) : null}
      <span className="truncate">{event.title}</span>
    </button>
  );

  return chip;
}

/** Static chip for the drag overlay / read-only contexts. */
export function StaticEventChip({ event }: { event: CalendarEvent }) {
  const meta = EVENT_TYPE_META[event.type];
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "flex w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium shadow-md",
        meta.chipClass,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {event.startTime ? (
        <span className="shrink-0 tabular-nums opacity-80">{event.startTime}</span>
      ) : null}
      <span className="truncate">{event.title}</span>
    </div>
  );
}
