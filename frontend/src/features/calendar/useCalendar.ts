import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { calendarService } from "./calendar.service";
import type { CalendarEvent } from "./calendar.types";
import type {
  CustomEventInput,
  UpdateCustomEventInput,
} from "./calendar.types";
import { itineraryKeys } from "@/features/trips/useItinerary";

/** Central cache keys for the travel calendar. */
export const calendarKeys = {
  all: ["calendar"] as const,
  events: () => [...calendarKeys.all, "events"] as const,
};

/* ── Queries ───────────────────────────────────────────────────── */

/**
 * Loads the full composed stream (custom + trip spans + itinerary
 * activities). The dataset is intentionally small — views filter
 * client-side so switching ranges never refetches.
 */
export function useCalendarEvents() {
  return useQuery({
    queryKey: calendarKeys.events(),
    queryFn: () => calendarService.getEvents(),
    staleTime: 30_000,
  });
}

/* ── Optimistic custom-event cache helpers ─────────────────────── */

type EventsCache = { events: CalendarEvent[]; custom: CalendarEvent[] };

function patchCustomEvents(
  cache: EventsCache | undefined,
  transform: (events: CalendarEvent[]) => CalendarEvent[],
): EventsCache | undefined {
  if (!cache) return cache;
  const nextCustom = transform(cache.custom);
  return {
    ...cache,
    custom: nextCustom,
    events: [
      ...cache.events.filter((event) => event.source !== "custom"),
      ...nextCustom,
    ],
  };
}

function replaceOrAppendCustom(
  events: CalendarEvent[],
  next: CalendarEvent,
): CalendarEvent[] {
  const index = events.findIndex((event) => event.id === next.id);
  if (index === -1) return [next, ...events];
  const copy = [...events];
  copy[index] = next;
  return copy;
}

/* ── Standalone event mutations ────────────────────────────────── */

export function useCreateCustomEvent(): UseMutationResult<
  CalendarEvent,
  Error,
  CustomEventInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => calendarService.createCustomEvent(input),
    onSuccess: async (event) => {
      queryClient.setQueryData<EventsCache>(
        calendarKeys.events(),
        (cache) =>
          patchCustomEvents(cache, (events) => replaceOrAppendCustom(events, event)) ??
          { events: [event], custom: [event] },
      );
      await queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
    onError: () => {
      toast.error("Could not save the event. Please try again.");
    },
  });
}

export function useUpdateCustomEvent(): UseMutationResult<
  CalendarEvent,
  Error,
  { eventId: string; patch: UpdateCustomEventInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, patch }) =>
      calendarService.updateCustomEvent(eventId, patch),
    onMutate: async ({ eventId, patch }) => {
      await queryClient.cancelQueries({ queryKey: calendarKeys.events() });
      const previous = queryClient.getQueryData<EventsCache>(
        calendarKeys.events(),
      );
      queryClient.setQueryData<EventsCache>(calendarKeys.events(), (cache) =>
        patchCustomEvents(cache, (events) =>
          events.map((event) =>
            event.id === eventId ? { ...event, ...patch } : event,
          ),
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(calendarKeys.events(), context.previous);
      }
      toast.error("Could not update the event. Please try again.");
    },
    onSuccess: async (event) => {
      queryClient.setQueryData<EventsCache>(calendarKeys.events(), (cache) =>
        patchCustomEvents(cache, (events) => replaceOrAppendCustom(events, event)),
      );
      await queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
  });
}

export function useDeleteCustomEvent(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId) => calendarService.deleteCustomEvent(eventId),
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: calendarKeys.events() });
      const previous = queryClient.getQueryData<EventsCache>(
        calendarKeys.events(),
      );
      queryClient.setQueryData<EventsCache>(calendarKeys.events(), (cache) =>
        patchCustomEvents(cache, (events) =>
          events.filter((event) => event.id !== eventId),
        ),
      );
      return { previous };
    },
    onError: (_error, _eventId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(calendarKeys.events(), context.previous);
      }
      toast.error("Could not delete the event. Please try again.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
  });
}

/** Drag & drop persistence — moves date and/or shifts the time window. */
export function useMoveCustomEvent(): UseMutationResult<
  CalendarEvent,
  Error,
  { eventId: string; date?: string; shiftMinutes?: number }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, date, shiftMinutes }) =>
      calendarService.moveCustomEvent(eventId, { date, shiftMinutes }),
    onMutate: async ({ eventId, date, shiftMinutes = 0 }) => {
      await queryClient.cancelQueries({ queryKey: calendarKeys.events() });
      const previous = queryClient.getQueryData<EventsCache>(
        calendarKeys.events(),
      );
      queryClient.setQueryData<EventsCache>(calendarKeys.events(), (cache) =>
        patchCustomEvents(cache, (events) =>
          events.map((event) => {
            if (event.id !== eventId) return event;
            return {
              ...event,
              ...(date ? { date } : {}),
              startTime: shiftTime(event.startTime ?? "09:00", shiftMinutes),
              endTime: shiftTime(event.endTime ?? "10:00", shiftMinutes),
            };
          }),
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(calendarKeys.events(), context.previous);
      }
      toast.error("Could not move the event. Please try again.");
    },
    onSuccess: async (event) => {
      queryClient.setQueryData<EventsCache>(calendarKeys.events(), (cache) =>
        patchCustomEvents(cache, (events) => replaceOrAppendCustom(events, event)),
      );
      await queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
  });
}

function shiftTime(time: string, minutes: number): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return time;
  const total =
    Math.max(0, Math.min(24 * 60, Number(match[1]) * 60 + Number(match[2]) + minutes));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/* ── Itinerary-backed mutations ────────────────────────────────── */

export interface MoveActivityPayload {
  tripId: string;
  activityId: string;
  targetDate: string;
}

export function useMoveItineraryActivity(): UseMutationResult<
  void,
  Error,
  MoveActivityPayload
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, activityId, targetDate }) =>
      calendarService.moveItineraryActivity(tripId, activityId, targetDate),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: itineraryKeys.itinerary(variables.tripId),
        }),
        queryClient.invalidateQueries({ queryKey: calendarKeys.events() }),
      ]);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not move that activity. Please try again.",
      );
    },
  });
}

export interface ActivityTimeShiftPayload {
  tripId: string;
  activityId: string;
  startTime: string;
  endTime: string;
}

export function useUpdateItineraryActivityTime(): UseMutationResult<
  void,
  Error,
  ActivityTimeShiftPayload
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, activityId, startTime, endTime }: ActivityTimeShiftPayload) =>
      calendarService.updateItineraryActivityTime(tripId, activityId, {
        startTime,
        endTime,
      }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: itineraryKeys.itinerary(variables.tripId),
        }),
        queryClient.invalidateQueries({ queryKey: calendarKeys.events() }),
      ]);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update that activity. Please try again.",
      );
    },
  });
}
