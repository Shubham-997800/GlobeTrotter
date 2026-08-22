import {
  CheckCircle2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../calendar.types";
import { dayTitle, formatTimeLabel } from "../calendar.utils";
import { EVENT_TYPE_META } from "./event-meta";

/**
 * Agenda list for a single day — grouped into timed entries and
 * multi-day trips, with inline actions for standalone events.
 */
export function DayAgenda({
  dateKey,
  events,
  onCreate,
  onEventClick,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  dateKey: string;
  events: CalendarEvent[];
  onCreate: () => void;
  onEventClick: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onToggleStatus: (event: CalendarEvent, next: CalendarEvent["status"]) => void;
}) {
  const sorted = [...events].sort((a, b) => {
    if (!a.startTime && b.startTime) return -1;
    if (a.startTime && !b.startTime) return 1;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
  const trips = sorted.filter((event) => event.type === "trip");
  const timed = sorted.filter((event) => event.type !== "trip");

  return (
    <section className="rounded-2xl border bg-card" aria-label={`Agenda for ${dateKey}`}>
      <header className="flex items-center justify-between gap-3 border-b border-subtle-border p-4">
        <div>
          <h2 className="text-sm font-semibold text-card-foreground">{dayTitle(dateKey)}</h2>
          <p className="text-xs text-muted-foreground">
            {events.length === 0
              ? "Nothing planned yet."
              : `${timed.length} entr${timed.length === 1 ? "y" : "ies"}${trips.length > 0 ? ` · ${trips.length} trip${trips.length === 1 ? "" : "s"}` : ""}`.trim()}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={onCreate}>
          <Plus className="size-4 text-primary" aria-hidden="true" />
          Add
        </Button>
      </header>

      {events.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          A free day — perfect for planning something memorable.
        </p>
      ) : (
        <ul className="divide-y divide-subtle-border">
          {timed.map((event) => (
            <li key={event.id} className="group flex items-center gap-3 p-3 hover:bg-accent/40">
              <span className="w-20 shrink-0 text-xs tabular-nums text-travel-blue">
                {event.startTime ? formatTimeLabel(event.startTime) : "All day"}
                {event.endTime ? (
                  <span className="block text-[11px] text-muted-foreground">
                    to {formatTimeLabel(event.endTime)}
                  </span>
                ) : null}
              </span>
              <span
                className={cn("size-2 shrink-0 rounded-full", EVENT_TYPE_META[event.type].dotClass)}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => onEventClick(event)}
                className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="block truncate text-sm font-medium text-card-foreground group-hover:underline">
                  {event.title}
                </span>
                {event.location || event.tripName ? (
                  <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    {event.location ? (
                      <>
                        <MapPin className="size-3 shrink-0 text-city" aria-hidden="true" />
                        {event.location}
                      </>
                    ) : null}
                    {event.tripName ? (
                      <span className={event.location ? "· ml-1" : ""}>{event.tripName}</span>
                    ) : null}
                  </span>
                ) : null}
              </button>
              <StatusBadge status={event.status} />
              {event.source === "custom" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                      aria-label={`Options for ${event.title}`}
                    >
                      <MoreHorizontal className="size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(event)}>
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onToggleStatus(event, event.status === "completed" ? "planned" : "completed")
                      }
                    >
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      {event.status === "completed" ? "Mark planned" : "Mark completed"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(event)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="w-7" />
              )}
            </li>
          ))}

          {trips.length > 0 ? (
            <li className="bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Trips happening this day
            </li>
          ) : null}
          {trips.map((trip) => (
            <li key={trip.id} className="flex items-center gap-3 p-3 pl-9 hover:bg-accent/40">
              <span className={cn("size-2 shrink-0 rounded-full", EVENT_TYPE_META.trip.dotClass)} aria-hidden="true" />
              <button
                type="button"
                onClick={() => onEventClick(trip)}
                className="min-w-0 flex-1 truncate text-left text-sm font-medium text-card-foreground hover:underline"
              >
                {trip.title}
                {trip.location ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{trip.location}</span>
                ) : null}
              </button>
              <StatusBadge status={trip.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: CalendarEvent["status"] }) {
  const map: Record<CalendarEvent["status"], { label: string; class: string }> = {
    planned: { label: "Planned", class: "border-border text-muted-foreground" },
    completed: { label: "Done", class: "border-success-border bg-success-bg text-success-text" },
    cancelled: { label: "Cancelled", class: "border-destructive/30 text-destructive" },
  };
  const entry = map[status];
  return (
    <Badge variant="outline" className={cn("shrink-0 text-[10px]", entry.class)}>
      {status === "cancelled" ? <XCircle className="mr-0.5 size-3" aria-hidden="true" /> : null}
      {entry.label}
    </Badge>
  );
}
