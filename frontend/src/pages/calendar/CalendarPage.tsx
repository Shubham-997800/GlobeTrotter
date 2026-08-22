import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/features/dashboard/components/States";
import { tripsService } from "@/features/trips/trips.service";
import { formatDateOnly } from "@/features/trips/trips.utils";
import {
  addDaysToKey,
  applyCalendarFilters,
  buildMonthMatrix,
  dayTitle,
  daysBetweenKeys,
  findConflicts,
  formatTimeLabel,
  minutesFromTime,
  monthTitle,
  rangeTitle,
  timeFromMinutes,
  todayKey,
  weekDayKeys,
} from "@/features/calendar/calendar.utils";
import type {
  CalendarEvent,
  CalendarFiltersState,
  CalendarViewId,
  EventDragData,
} from "@/features/calendar/calendar.types";
import {
  useCalendarEvents,
  useCreateCustomEvent,
  useDeleteCustomEvent,
  useMoveCustomEvent,
  useUpdateCustomEvent,
  useMoveItineraryActivity,
  useUpdateItineraryActivityTime,
} from "@/features/calendar/useCalendar";
import { DayAgenda } from "@/features/calendar/components/day-agenda";
import {
  EventFormDialog,
  type EventFormSavePayload,
} from "@/features/calendar/components/event-form-dialog";
import { EVENT_TYPE_META } from "@/features/calendar/components/event-meta";
import { MonthGrid } from "@/features/calendar/components/month-grid";
import { StaticEventChip } from "@/features/calendar/components/event-chip";
import { WeekGrid } from "@/features/calendar/components/week-grid";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Rolling two-week list grouped by day — the calendar's agenda view. */
function AgendaView({
  anchor,
  events,
  onEventClick,
}: {
  anchor: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const days = useMemo(() => {
    const buckets = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const bucket = buckets.get(event.date);
      if (bucket) bucket.push(event);
      else buckets.set(event.date, [event]);
    }
    return [...buckets.entries()]
      .filter(([key]) => key >= anchor && key <= addDaysToKey(anchor, 13))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, dayEvents]) => ({
        key,
        label: dayTitle(key),
        today: key === todayKey(),
        events: [...dayEvents].sort((a, b) =>
          (a.startTime ?? "").localeCompare(b.startTime ?? ""),
        ),
      }));
  }, [anchor, events]);

  if (days.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-subtle-border px-6 py-12 text-center text-sm text-muted-foreground">
        No events in the next two weeks. Use “New entry” to plan something.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {days.map((day) => (
        <section
          key={day.key}
          aria-label={day.label}
          className="rounded-2xl border bg-card p-3 shadow-sm"
        >
          <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-card-foreground">
            {day.label}
            {day.today ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Today
              </span>
            ) : null}
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {day.events.length}
            </span>
          </h3>
          <ul className="divide-y divide-border">
            {day.events.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onEventClick(event)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="w-16 shrink-0 text-xs font-medium text-travel-blue">
                    {event.startTime ? formatTimeLabel(event.startTime) : "All day"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-card-foreground">
                    {event.title}
                    {event.location ? (
                      <span className="text-muted-foreground"> · {event.location}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Adds whole months while clamping the day-of-month (Jan 31 → Feb 28). */
function addMonthsKey(key: string, delta: number): string {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7)) - 1;
  const day = Number(key.slice(8, 10));
  const total = month + delta;
  const targetYear = year + Math.floor(total / 12);
  const targetMonth = ((total % 12) + 12) % 12;
  const daysInTarget = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return `${targetYear}-${pad2(targetMonth + 1)}-${pad2(Math.min(day, daysInTarget))}`;
}

/**
 * Travel calendar — one normalized stream of trip spans, itinerary
 * activities and standalone events across month / week / day views,
 * with drag & drop rescheduling and live conflict awareness.
 */
export function CalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarViewId>("month");
  const [anchor, setAnchor] = useState(todayKey());
  const [filters, setFilters] = useState<CalendarFiltersState>({
    trips: "all",
    eventType: "all",
    status: "all",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [presetDate, setPresetDate] = useState<string | undefined>(undefined);
  const [details, setDetails] = useState<CalendarEvent | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CalendarEvent | null>(null);
  const [activeDrag, setActiveDrag] = useState<EventDragData | null>(null);

  const eventsQuery = useCalendarEvents();
  const tripsQuery = useQuery({
    queryKey: ["calendar", "trips"],
    queryFn: () => tripsService.listTrips(),
    staleTime: 30_000,
  });

  const createCustom = useCreateCustomEvent();
  const updateCustom = useUpdateCustomEvent();
  const deleteCustom = useDeleteCustomEvent();
  const moveCustom = useMoveCustomEvent();
  const moveActivity = useMoveItineraryActivity();
  const updateActivityTime = useUpdateItineraryActivityTime();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const allEvents = eventsQuery.data?.events ?? [];
  const todayKeyValue = todayKey();

  const tripsById = useMemo(
    () => new Map((tripsQuery.data ?? []).map((trip) => [trip.id, trip])),
    [tripsQuery.data],
  );

  const filtered = useMemo(
    () => applyCalendarFilters(allEvents, filters, tripsById),
    [allEvents, filters, tripsById],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of filtered) {
      const bucket = map.get(event.date);
      if (bucket) bucket.push(event);
      else map.set(event.date, [event]);
    }
    return map;
  }, [filtered]);

  /* ── Range math ─────────────────────────────────────────────── */

  const year = Number(anchor.slice(0, 4));
  const monthIndex = Number(anchor.slice(5, 7)) - 1;
  const matrix = useMemo(() => buildMonthMatrix(year, monthIndex), [year, monthIndex]);
  const week = useMemo(() => weekDayKeys(anchor), [anchor]);

  const title =
    view === "month"
      ? monthTitle(year, monthIndex)
      : view === "week"
        ? rangeTitle(week[0], week[6])
        : view === "agenda"
          ? rangeTitle(anchor, addDaysToKey(anchor, 13))
          : dayTitle(anchor);

  const step = (delta: number) => {
    if (view === "month") setAnchor(addMonthsKey(anchor, delta));
    else
      setAnchor(
        addDaysToKey(
          anchor,
          delta * (view === "week" || view === "agenda" ? 7 : 1),
        ),
      );
  };

  const openCreateForm = (date?: string) => {
    setEditing(null);
    setPresetDate(date ?? anchor);
    setFormOpen(true);
  };

  /* ── Drag & drop ────────────────────────────────────────────── */

  function handleDragStart(event: DragStartEvent) {
    setActiveDrag((event.active.data.current as EventDragData | undefined) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDrag(null);
    const drag = active.data.current as EventDragData | undefined;
    const drop = over?.data.current as { date?: string; startMinutes?: number } | undefined;
    if (!drag || !drop?.date || drag.source === "trip") return;

    const dateChanged = drop.date !== drag.date;
    const startMinutes =
      typeof drop.startMinutes === "number" ? drop.startMinutes : null;
    const originalStart = drag.startTime ? minutesFromTime(drag.startTime) : null;
    const shift =
      startMinutes !== null && originalStart !== null
        ? startMinutes - originalStart
        : null;

    if (drag.source === "custom") {
      if (!dateChanged && (shift === null || shift === 0)) return;
      const duration = drag.endTime
        ? Math.max(15, minutesFromTime(drag.endTime) - (originalStart ?? 540))
        : 60;
      const newStart = startMinutes !== null ? startMinutes : (originalStart ?? 540);
      const check = findConflicts(
        {
          eventId: drag.eventId,
          date: drop.date,
          startTime: timeFromMinutes(newStart),
          endTime: timeFromMinutes(newStart + duration),
          title: drag.title,
        },
        (eventsByDate.get(drop.date) ?? []).filter((item) => item.id !== drag.eventId),
      );
      moveCustom.mutate(
        {
          eventId: drag.eventId,
          ...(dateChanged ? { date: drop.date } : {}),
          ...(shift !== null && shift !== 0 ? { shiftMinutes: shift } : {}),
        },
        {
          onSuccess: () => {
            if (check.conflicts.length > 0) {
              toast.warning("Moved — but it overlaps other plans", {
                description: check.conflicts.map((conflict) => conflict.title).join(", "),
              });
            } else {
              toast.success("Event moved");
            }
          },
        },
      );
      return;
    }

    // Itinerary activities — rebind day or nudge the time window.
    if (!drag.tripId || !drag.eventId.startsWith("itin_")) return;
    const activityId = drag.eventId.slice("itin_".length);

    if (dateChanged) {
      moveActivity.mutate(
        { tripId: drag.tripId, activityId, targetDate: drop.date },
        { onSuccess: () => toast.success(`"${drag.title}" moved to ${drop.date}`) },
      );
      return;
    }

    if (startMinutes !== null && shift !== null && shift !== 0 && drag.endTime) {
      const duration = Math.max(
        15,
        minutesFromTime(drag.endTime) - (originalStart ?? startMinutes),
      );
      updateActivityTime.mutate(
        {
          tripId: drag.tripId,
          activityId,
          startTime: timeFromMinutes(startMinutes),
          endTime: timeFromMinutes(startMinutes + duration),
        },
        { onSuccess: () => toast.success("Time updated") },
      );
    }
  }

  /* ── Form save ──────────────────────────────────────────────── */

  const handleSave = async (
    values: EventFormSavePayload,
    _options: { force: boolean },
  ): Promise<boolean> => {
    try {
      const patch = {
        title: values.title,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        location: values.location,
        description: values.description,
        tripId: values.tripId,
        type: values.type,
      };
      if (values.eventId) {
        await updateCustom.mutateAsync({ eventId: values.eventId, patch });
      } else {
        await createCustom.mutateAsync(patch);
      }
      toast.success(values.eventId ? "Event updated" : "Added to calendar");
      return true;
    } catch {
      toast.error("Could not save the event. Please try again.");
      return false;
    }
  };

  /* ── Derived panels ─────────────────────────────────────────── */

  const upcoming = useMemo(
    () =>
      filtered
        .filter(
          (event) =>
            event.status === "planned" &&
            event.date >= todayKeyValue &&
            daysBetweenKeys(todayKeyValue, event.date) <= 30,
        )
        .sort((a, b) =>
          `${a.date}${a.startTime ?? ""}`.localeCompare(`${b.date}${b.startTime ?? ""}`),
        )
        .slice(0, 6),
    [filtered, todayKeyValue],
  );

  const isLoading = eventsQuery.isLoading || tripsQuery.isLoading;
  const activeEvent = activeDrag
    ? allEvents.find((event) => event.id === activeDrag.eventId)
    : null;

  return (
    <AppShell
      crumbs={[{ label: "Home", to: "/dashboard" }, { label: "Calendar" }]}
      title="Travel calendar"
      description="Every trip, activity and plan on one timeline."
      actions={
        <Button size="sm" onClick={() => openCreateForm()}>
          <Plus className="size-4" aria-hidden="true" />
          New entry
        </Button>
      }
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => step(-1)}
                aria-label="Previous period"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAnchor(todayKey())}>
                Today
              </Button>
              <input
                type="date"
                value={anchor}
                onChange={(event) => {
                  if (event.target.value) setAnchor(event.target.value);
                }}
                aria-label="Pick a date"
                className="h-9 rounded-lg border border-input bg-card px-2 text-sm text-card-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => step(1)}
                aria-label="Next period"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <h2 className="mr-auto text-base font-semibold text-card-foreground">{title}</h2>

            <Tabs value={view} onValueChange={(value) => setView(value as CalendarViewId)}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select
              value={filters.trips}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  trips: value as CalendarFiltersState["trips"],
                }))
              }
            >
              <SelectTrigger className="h-9 w-[130px]" aria-label="Filter by trip stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All trips</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.eventType}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  eventType: value as CalendarFiltersState["eventType"],
                }))
              }
            >
              <SelectTrigger className="h-9 w-[140px]" aria-label="Filter by type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="activity">Attractions</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="accommodation">Stay</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  status: value as CalendarFiltersState["status"],
                }))
              }
            >
              <SelectTrigger className="h-9 w-[130px]" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          {eventsQuery.isError ? (
            <ErrorState
              title="The calendar hit a snag"
              description="We couldn't load your schedule just now. Give it another go."
              onRetry={() => void eventsQuery.refetch()}
            />
          ) : isLoading ? (
            <div className="animate-pulse rounded-2xl border bg-card p-4">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          ) : allEvents.length === 0 ? (
            <div className="space-y-4">
              <EmptyState
                icon={Plus}
                title="Nothing on the calendar yet"
                description="Plan a standalone entry, or schedule activities inside a trip itinerary — they appear here automatically."
              />
              <div className="flex justify-center">
                <Button onClick={() => openCreateForm()}>Add your first entry</Button>
              </div>
            </div>
          ) : view === "month" ? (
            <MonthGrid
              matrix={matrix}
              eventsByDate={eventsByDate}
              selectedKey={anchor}
              todayKeyValue={todayKeyValue}
              onSelectDay={setAnchor}
              onCreateAt={openCreateForm}
              onEventClick={setDetails}
            />
          ) : view === "week" ? (
            <WeekGrid
              days={week}
              eventsByDate={eventsByDate}
              todayKeyValue={todayKeyValue}
              selectedKey={anchor}
              onSelectDay={setAnchor}
              onEventClick={setDetails}
              onCreateAt={(date) => openCreateForm(date)}
            />
          ) : view === "agenda" ? (
            <AgendaView
              anchor={anchor}
              events={filtered}
              onEventClick={setDetails}
            />
          ) : (
            <DayAgenda
              dateKey={anchor}
              events={filtered.filter((event) => event.date === anchor)}
              onCreate={() => openCreateForm(anchor)}
              onEventClick={setDetails}
              onEdit={(event) => {
                setEditing(event);
                setPresetDate(undefined);
                setFormOpen(true);
              }}
              onDelete={setPendingDelete}
              onToggleStatus={(event, next) =>
                updateCustom.mutate(
                  { eventId: event.id, patch: { status: next } },
                  { onSuccess: () => toast.success(next === "completed" ? "Marked done" : "Marked planned") },
                )
              }
            />
          )}
        </div>

        {/* Right rail */}
        <aside className="hidden space-y-5 xl:block" aria-label="Calendar sidebar">
          <section className="rounded-2xl border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-card-foreground">Coming up</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Nothing planned in the next 30 days.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcoming.map((event) => {
                  const dayNumber = Number(event.date.slice(8, 10));
                  const monthShort = new Intl.DateTimeFormat("en-GB", {
                    month: "short",
                    timeZone: "UTC",
                  }).format(new Date(`${event.date}T00:00:00Z`));
                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => setDetails(event)}
                        className="flex w-full items-center gap-3 rounded-xl border border-subtle-border p-2 text-left transition-colors hover:border-strong-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="w-10 shrink-0 rounded-lg bg-travel-blue-subtle py-1 text-center">
                          <span className="block text-sm font-bold leading-tight text-travel-blue">
                            {dayNumber}
                          </span>
                          <span className="block text-[10px] uppercase leading-tight text-travel-blue">
                            {monthShort}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-card-foreground">
                            {event.title}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {event.startTime ? formatTimeLabel(event.startTime) : "All day"}
                            {event.location ? ` · ${event.location}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-card-foreground">Legend</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {(Object.keys(EVENT_TYPE_META) as (keyof typeof EVENT_TYPE_META)[]).map(
                (typeKey) => {
                  const meta = EVENT_TYPE_META[typeKey];
                  return (
                    <li key={typeKey} className="flex items-center gap-2">
                      <span
                        className={`size-2.5 shrink-0 rounded-full ${meta.dotClass}`}
                        aria-hidden="true"
                      />
                      {meta.label}
                    </li>
                  );
                },
              )}
            </ul>
            <p className="mt-3 border-t border-subtle-border pt-2 text-[11px] text-muted-foreground">
              Tip: drag entries between days, or onto an hour slot in the week view to
              re-time them.
            </p>
          </section>
        </aside>
      </div>

      {/* ── Details dialog ── */}
      <Dialog open={Boolean(details)} onOpenChange={(next) => (next ? undefined : setDetails(null))}>
        <DialogContent className="sm:max-w-md sm:rounded-2xl">
          {details ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const meta = EVENT_TYPE_META[details.type];
                    const Icon = meta.icon;
                    return <Icon className="size-5 text-primary" aria-hidden="true" />;
                  })()}
                  {details.title}
                </DialogTitle>
                <DialogDescription>
                  {EVENT_TYPE_META[details.type].label} ·{" "}
                  {details.status.charAt(0).toUpperCase() + details.status.slice(1)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">
                  {formatDateOnly(details.date)}
                  {details.startTime ? (
                    <span className="ml-2 font-normal tabular-nums text-muted-foreground">
                      {formatTimeLabel(details.startTime)}
                      {details.endTime ? ` – ${formatTimeLabel(details.endTime)}` : ""}
                    </span>
                  ) : (
                    <span className="ml-2 font-normal text-muted-foreground">All day</span>
                  )}
                </p>
                {details.location ? (
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-4 shrink-0 text-city" aria-hidden="true" />
                    {details.location}
                  </p>
                ) : null}
                {details.description ? (
                  <p className="whitespace-pre-wrap rounded-xl bg-muted/60 p-3 text-sm leading-relaxed text-foreground">
                    {details.description}
                  </p>
                ) : null}
                {details.tripName ? (
                  <p className="text-xs text-muted-foreground">
                    Part of <span className="font-medium text-foreground">{details.tripName}</span>
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                {details.tripId ? (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/trips/${details.tripId}/itinerary`)}
                  >
                    Open itinerary
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                ) : null}
                {details.source === "custom" ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(details);
                        setPresetDate(undefined);
                        setDetails(null);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={() => setPendingDelete(details)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </>
                ) : null}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => (next ? undefined : setPendingDelete(null))}
      >
        <DialogContent className="sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete “{pendingDelete?.title}”?</DialogTitle>
            <DialogDescription>
              This removes the entry from your calendar. Linked trips are unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteCustom.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                deleteCustom.mutate(pendingDelete.id, {
                  onSuccess: () => {
                    setPendingDelete(null);
                    setDetails(null);
                    toast.success("Entry deleted");
                  },
                  onError: () => toast.error("Could not delete the entry."),
                });
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create / edit form ── */}
      <EventFormDialog
        open={formOpen}
        editing={editing}
        presetDate={presetDate}
        allEvents={allEvents}
        linkableTrips={tripsQuery.data ?? []}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      {/* Drag preview following the pointer */}
      <DragOverlay dropAnimation={null}>
        {activeEvent ? <StaticEventChip event={activeEvent} /> : null}
      </DragOverlay>
      </DndContext>
    </AppShell>
  );
}
