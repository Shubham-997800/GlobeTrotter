import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../calendar.types";
import type { MonthCell } from "../calendar.utils";
import { shortWeekdayLabels } from "../calendar.utils";
import { EventChip } from "./event-chip";

const MAX_CHIPS_PER_CELL = 3;

/**
 * Monday-first month matrix. Every day cell is a drop target; clicking
 * the day number selects it, the hover "+" opens the create form
 * prefilled with that date.
 */
export function MonthGrid({
  matrix,
  eventsByDate,
  selectedKey,
  todayKeyValue,
  onSelectDay,
  onCreateAt,
  onEventClick,
}: {
  matrix: MonthCell[];
  eventsByDate: Map<string, CalendarEvent[]>;
  selectedKey: string;
  todayKeyValue: string;
  onSelectDay: (key: string) => void;
  onCreateAt: (key: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card" role="grid" aria-label="Month view">
      <div className="grid grid-cols-7 border-b border-subtle-border bg-muted/50">
        {shortWeekdayLabels().map((label) => (
          <div
            key={label}
            className="py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-px bg-subtle-border min-w-max" style={{ minWidth: "504px" }}>
          {matrix.map((cell) => (
            <MonthDayCell
              key={cell.key}
              cell={cell}
              events={eventsByDate.get(cell.key) ?? []}
              selected={cell.key === selectedKey}
              isToday={cell.key === todayKeyValue}
              onSelect={onSelectDay}
              onCreate={onCreateAt}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthDayCell({
  cell,
  events,
  selected,
  isToday,
  onSelect,
  onCreate,
  onEventClick,
}: {
  cell: MonthCell;
  events: CalendarEvent[];
  selected: boolean;
  isToday: boolean;
  onSelect: (key: string) => void;
  onCreate: (key: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-month-${cell.key}`,
    data: { date: cell.key },
  });

  const visible = events.slice(0, MAX_CHIPS_PER_CELL);
  const hiddenCount = events.length - visible.length;

  return (
    <div
      ref={setNodeRef}
      role="gridcell"
      aria-label={`${cell.dayOfMonth}${isToday ? ", today" : ""}`}
      className={cn(
        "group relative min-h-24 bg-card p-1.5 transition-colors lg:min-h-28",
        !cell.inMonth && "bg-muted/40",
        isOver && "bg-accent",
      )}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSelect(cell.key)}
          className={cn(
            "flex size-11 items-center justify-center rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isToday
              ? "bg-primary text-primary-foreground"
              : selected
                ? "bg-accent text-accent-foreground ring-1 ring-ring"
                : "text-foreground hover:bg-accent",
            !cell.inMonth && "opacity-50",
          )}
          aria-current={isToday ? "date" : undefined}
          aria-label={`Select ${cell.key}`}
        >
          {cell.dayOfMonth}
        </button>
        <button
          type="button"
          onClick={() => onCreate(cell.key)}
          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
          aria-label={`Add event on ${cell.key}`}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-1 space-y-1">
        {visible.map((event) => (
          <EventChip key={event.id} event={event} compact onClick={() => onEventClick(event)} />
        ))}
        {hiddenCount > 0 ? (
          <button
            type="button"
            onClick={() => onSelect(cell.key)}
            className="w-full rounded px-1 text-left text-[11px] font-medium text-muted-foreground hover:text-foreground"
            aria-label={`${hiddenCount} more events`}
          >
            +{hiddenCount} more
          </button>
        ) : null}
      </div>
    </div>
  );
}
