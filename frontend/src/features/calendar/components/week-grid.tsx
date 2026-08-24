import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../calendar.types";
import {
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  eventHeightPx,
  eventTopPx,
  formatTimeLabel,
  layoutTimedEvents,
  minutesFromTime,
} from "../calendar.utils";
import { EventChip, StaticEventChip } from "./event-chip";

const HOURS = Array.from(
  { length: 24 - DAY_START_HOUR },
  (_, i) => DAY_START_HOUR + i,
);

/**
 * Seven-day time grid (06:00–24:00). Trip spans render in an all-day
 * strip; timed events are absolutely positioned with overlap lanes.
 * Each hour cell is a drop target carrying `{ date, startMinutes }`.
 */
export function WeekGrid({
  days,
  eventsByDate,
  todayKeyValue,
  selectedKey,
  onSelectDay,
  onEventClick,
  onCreateAt,
}: {
  days: string[];
  eventsByDate: Map<string, CalendarEvent[]>;
  todayKeyValue: string;
  selectedKey: string;
  onSelectDay: (key: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateAt: (date: string, startMinutes?: number) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card" aria-label="Week view">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[48px_repeat(7,minmax(0,1fr))] border-b border-subtle-border bg-muted/50 min-w-max" style={{ minWidth: "504px" }}>
          <div />
          {days.map((day) => (
            <DayHeader
              key={day}
              day={day}
              isToday={day === todayKeyValue}
              selected={day === selectedKey}
              onSelect={onSelectDay}
            />
          ))}
        </div>
      </div>

      {/* All-day trip strip */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[48px_repeat(7,minmax(0,1fr))] gap-px border-b border-subtle-border bg-subtle-border min-w-max" style={{ minWidth: "504px" }}>
          <div className="flex items-center justify-center bg-muted/30 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            All day
          </div>
          {days.map((day) => {
            const trips = (eventsByDate.get(day) ?? []).filter(
              (event) => event.type === "trip",
            );
            return (
              <div key={day} className="min-h-8 space-y-1 bg-card p-1">
                {trips.map((trip) => (
                  <StaticEventChip key={trip.id} event={{ ...trip, startTime: undefined }} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[48px_repeat(7,minmax(0,1fr))] min-w-max" style={{ minWidth: "504px" }}>
          {/* Gutter */}
          <div className="border-r border-subtle-border" aria-hidden="true">
            {HOURS.map((hour) => (
<div
              key={hour}
              style={{ height: HOUR_HEIGHT_PX }}
              className="-translate-y-1.5 pr-1 text-right text-[10px] tabular-nums text-muted-foreground"
            >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {days.map((day) => (
            <WeekDayColumn
              key={day}
              day={day}
              events={(eventsByDate.get(day) ?? []).filter(
                (event) => event.type !== "trip",
              )}
              showNowLine={day === todayKeyValue}
              onEventClick={onEventClick}
              onCreateAt={onCreateAt}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayHeader({
  day,
  isToday,
  selected,
  onSelect,
}: {
  day: string;
  isToday: boolean;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  const weekday = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
  const dayNumber = Number(day.slice(8, 10));

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cn(
        "flex items-center justify-center gap-1.5 py-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        selected && "bg-accent",
      )}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{weekday}</span>
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
          isToday ? "bg-primary text-primary-foreground" : "text-foreground",
        )}
        aria-current={isToday ? "date" : undefined}
      >
        {dayNumber}
      </span>
    </button>
  );
}

function WeekDayColumn({
  day,
  events,
  showNowLine,
  onEventClick,
  onCreateAt,
}: {
  day: string;
  events: CalendarEvent[];
  showNowLine: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onCreateAt: (date: string, startMinutes?: number) => void;
}) {
  const laidOut = layoutTimedEvents(events);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowVisible =
    showNowLine && nowMinutes >= DAY_START_HOUR * 60 && nowMinutes <= 24 * 60;

  return (
    <div
      className="relative border-r border-subtle-border last:border-r-0"
      style={{ height: HOURS.length * HOUR_HEIGHT_PX }}
    >
      {/* Hour cells double as drop targets and click-to-create zones */}
      {HOURS.map((hour) => (
        <HourCell key={hour} day={day} hour={hour} onCreateAt={onCreateAt} />
      ))}

      {laidOut.map(({ event, lane, lanes }) => {
        const top = eventTopPx(event);
        if (top === null) return null;
        const widthPct = 100 / lanes;
        return (
          <div
            key={event.id}
            className="absolute px-0.5"
            style={{
              top,
              height: eventHeightPx(event),
              left: `calc(${lane * widthPct}% + 2px)`,
              width: `calc(${widthPct}% - 4px)`,
              zIndex: 10 + lane,
            }}
          >
            <EventChip event={event} onClick={() => onEventClick(event)} />
          </div>
        );
      })}

      {nowVisible ? (
        <div
          className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
          style={{ top: ((nowMinutes - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT_PX }}
          role="presentation"
        >
          <span className="size-2 -translate-x-1 rounded-full bg-destructive" />
          <span className="h-px flex-1 bg-destructive/70" />
        </div>
      ) : null}
    </div>
  );
}

function HourCell({
  day,
  hour,
  onCreateAt,
}: {
  day: string;
  hour: number;
  onCreateAt: (date: string, startMinutes?: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-week-${day}-${hour}`,
    data: { date: day, startMinutes: hour * 60 },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ height: HOUR_HEIGHT_PX }}
      className={cn(
        "cursor-pointer border-b border-subtle-border transition-colors hover:bg-accent/40",
        isOver && "bg-accent",
      )}
      onClick={() => onCreateAt(day, hour * 60)}
      role="button"
      aria-label={`Add at ${formatTimeLabel(`${String(hour).padStart(2, "0")}:00`)}`}
    />
  );
}

/** Duration helper used when dropping itinerary events onto hour cells. */
export function durationMinutes(event: Pick<CalendarEvent, "startTime" | "endTime">): number {
  const start = minutesFromTime(event.startTime ?? "09:00");
  const end = minutesFromTime(event.endTime ?? "10:00");
  return Math.max(15, end - start);
}
