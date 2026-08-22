import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { itineraryService } from "./itinerary.service";
import { tripsService } from "./trips.service";
import type { ActivityCategoryId } from "./trips.types";
import { tripsKeys } from "./useTrips";
import type {
  ActivityInput,
  ItineraryDay,
  ItineraryRecord,
  StopInput,
} from "./itinerary.types";

/** Central cache keys shared across the itinerary builder. */
export const itineraryKeys = {
  trip: (tripId: string) => [...tripsKeys.all, "detail", tripId] as const,
  itinerary: (tripId: string) => ["trips", tripId, "itinerary"] as const,
  activitySearch: (query: string, category: string) =>
    ["trips", "activity-search", category, query] as const,
};

/* ── Queries ─────────────────────────────────────────────────── */

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: itineraryKeys.trip(tripId ?? "unknown"),
    queryFn: () => tripsService.getTrip(tripId!),
    enabled: Boolean(tripId),
    retry: false,
    staleTime: 30_000,
  });
}

export function useItinerary(tripId: string | undefined) {
  return useQuery({
    queryKey: itineraryKeys.itinerary(tripId ?? "unknown"),
    queryFn: () => itineraryService.getItinerary(tripId!),
    enabled: Boolean(tripId),
    staleTime: 30_000,
  });
}

export function useActivitySearch(
  query: string,
  category: ActivityCategoryId | "all",
  enabled: boolean,
) {
  return useQuery({
    queryKey: itineraryKeys.activitySearch(query, category),
    queryFn: () => tripsService.searchActivities(query, category),
    enabled,
    staleTime: 60_000,
  });
}

/* ── Shared optimistic-update plumbing ───────────────────────── */

/**
 * Wraps a service call with an optimistic cache write + rollback.
 * `patchCache` receives the current cached record and the mutation
 * variables so every caller stays a tiny pure function.
 */
function useItineraryMutation<TVariables, TResult>(
  tripId: string,
  mutationFn: (variables: TVariables) => Promise<TResult>,
  patchCache: (record: ItineraryRecord, variables: TVariables) => ItineraryRecord,
  options?: {
    /** Extra work after success — defaults to nothing. */
    onSuccess?: (result: TResult, variables: TVariables) => void;
    /** Set false when the caller handles refetching itself. */
    invalidate?: boolean;
  },
) {
  const queryClient = useQueryClient();
  const key = itineraryKeys.itinerary(tripId);

  return useMutation<TResult, Error, TVariables, { previous?: ItineraryRecord }>({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ItineraryRecord>(key);
      if (previous) {
        queryClient.setQueryData<ItineraryRecord>(key, {
          ...patchCache(previous, variables),
          updatedAt: new Date().toISOString(),
        });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      // Roll back so the UI never shows data we failed to persist.
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: options?.onSuccess,
    onSettled: () => {
      if (options?.invalidate !== false) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

/* ── Activity mutations ──────────────────────────────────────── */

export function useAddActivity(tripId: string) {
  return useItineraryMutation(
    tripId,
    (input: ActivityInput) => itineraryService.addActivity(tripId, input),
    (record, input) => ({
      ...record,
      activities: [
        ...record.activities,
        {
          id: `optimistic_${Date.now().toString(36)}`,
          ...input,
          order: record.activities.filter((a) => a.dayId === input.dayId).length,
        },
      ],
    }),
  );
}

export function useUpdateActivity(tripId: string) {
  return useItineraryMutation(
    tripId,
    ({ activityId, patch }: { activityId: string; patch: Partial<ActivityInput> }) =>
      itineraryService.updateActivity(tripId, activityId, patch),
    (record, { activityId, patch }) => ({
      ...record,
      activities: record.activities.map((activity) =>
        activity.id === activityId ? { ...activity, ...patch } : activity,
      ),
    }),
  );
}

export function useDeleteActivity(tripId: string) {
  return useItineraryMutation(
    tripId,
    (activityId: string) => itineraryService.deleteActivity(tripId, activityId),
    (record, activityId) => ({
      ...record,
      activities: record.activities.filter((activity) => activity.id !== activityId),
    }),
  );
}

export function useDuplicateActivity(tripId: string) {
  return useItineraryMutation(
    tripId,
    (activityId: string) => itineraryService.duplicateActivity(tripId, activityId),
    (record, activityId) => {
      const source = record.activities.find((a) => a.id === activityId);
      if (!source) return record;
      const siblings = record.activities.filter((a) => a.dayId === source.dayId);
      const insertAt =
        siblings.findIndex((sibling) => sibling.id === activityId) + 1;
      const copy = {
        ...source,
        id: `optimistic_${Date.now().toString(36)}`,
        name: `${source.name} (copy)`,
        order: insertAt,
      };
      const renumbered = siblings.map((sibling) =>
        sibling.order >= insertAt
          ? { ...sibling, order: sibling.order + 1 }
          : sibling,
      );
      return {
        ...record,
        activities: [
          ...record.activities.filter((a) => a.dayId !== source.dayId),
          ...renumbered,
          copy,
        ],
      };
    },
  );
}

/** Persists drag/keyboard reordering for one day's timeline. */
export function useReorderActivities(tripId: string) {
  return useItineraryMutation(
    tripId,
    ({ dayId, orderedIds }: { dayId: string; orderedIds: string[] }) =>
      itineraryService.reorderActivities(tripId, dayId, orderedIds),
    (record, { dayId, orderedIds }) => {
      const rank = new Map(orderedIds.map((id, index) => [id, index]));
      const dayActivities = record.activities
        .filter((activity) => activity.dayId === dayId)
        .map((activity) => ({
          ...activity,
          order: rank.get(activity.id) ?? activity.order,
        }))
        .sort((a, b) => a.order - b.order)
        .map((activity, index) => ({ ...activity, order: index }));
      return {
        ...record,
        activities: [
          ...record.activities.filter((activity) => activity.dayId !== dayId),
          ...dayActivities,
        ],
      };
    },
  );
}

export function useMoveActivityToDay(tripId: string) {
  return useItineraryMutation(
    tripId,
    ({ activityId, targetDayId }: { activityId: string; targetDayId: string }) =>
      itineraryService.moveActivityToDay(tripId, activityId, targetDayId),
    (record, { activityId, targetDayId }) => {
      const targetCount = record.activities.filter(
        (activity) => activity.dayId === targetDayId,
      ).length;
      return {
        ...record,
        activities: record.activities.map((activity) =>
          activity.id === activityId
            ? { ...activity, dayId: targetDayId, order: targetCount }
            : activity,
        ),
      };
    },
  );
}

/* ── Day mutations ───────────────────────────────────────────── */

export function useUpdateDay(tripId: string) {
  return useItineraryMutation(
    tripId,
    ({
      dayId,
      patch,
    }: {
      dayId: string;
      patch: Partial<Pick<ItineraryDay, "notes" | "destinationId">>;
    }) => itineraryService.updateDay(tripId, dayId, patch),
    (record, { dayId, patch }) => ({
      ...record,
      days: record.days.map((day) =>
        day.id === dayId ? { ...day, ...patch } : day,
      ),
    }),
  );
}

export function useClearDay(tripId: string) {
  return useItineraryMutation(
    tripId,
    (dayId: string) => itineraryService.clearDay(tripId, dayId),
    (record, dayId) => ({
      ...record,
      activities: record.activities.filter(
        (activity) => activity.dayId !== dayId,
      ),
    }),
  );
}

export function useDuplicateDay(tripId: string) {
  return useItineraryMutation(
    tripId,
    ({ sourceDayId, targetDayId }: { sourceDayId: string; targetDayId: string }) =>
      itineraryService.duplicateDay(tripId, sourceDayId, targetDayId),
    (record, { sourceDayId, targetDayId }) => {
      const source = record.activities.filter((a) => a.dayId === sourceDayId);
      const copies = source.map((activity, index) => ({
        ...activity,
        id: `optimistic_${index}_${Date.now().toString(36)}`,
        dayId: targetDayId,
        order:
          record.activities.filter((a) => a.dayId === targetDayId).length + index,
      }));
      return {
        ...record,
        activities: [...record.activities, ...copies],
      };
    },
  );
}

/* ── Stop (multi-city) mutations ─────────────────────────────── */

export function useAddStop(tripId: string) {
  return useItineraryMutation(
    tripId,
    (input: StopInput) => itineraryService.addStop(tripId, input),
    (record, input) => ({
      ...record,
      stops: [
        ...record.stops,
        { id: `optimistic_stop_${Date.now()}`, ...input, order: record.stops.length },
      ],
    }),
  );
}

export function useUpdateStop(tripId: string) {
  return useItineraryMutation(
    tripId,
    ({ stopId, patch }: { stopId: string; patch: Partial<StopInput> }) =>
      itineraryService.updateStop(tripId, stopId, patch),
    (record, { stopId, patch }) => ({
      ...record,
      stops: record.stops.map((stop) =>
        stop.id === stopId ? { ...stop, ...patch } : stop,
      ),
    }),
  );
}

export function useDeleteStop(tripId: string) {
  return useItineraryMutation(
    tripId,
    (stopId: string) => itineraryService.deleteStop(tripId, stopId),
    (record, stopId) => ({
      ...record,
      stops: record.stops
        .filter((stop) => stop.id !== stopId)
        .sort((a, b) => a.order - b.order)
        .map((stop, index) => ({ ...stop, order: index })),
    }),
  );
}

export function useReorderStops(tripId: string) {
  return useItineraryMutation(
    tripId,
    (orderedIds: string[]) => itineraryService.reorderStops(tripId, orderedIds),
    (record, orderedIds) => {
      const rank = new Map(orderedIds.map((id, index) => [id, index]));
      return {
        ...record,
        stops: record.stops
          .map((stop) => ({ ...stop, order: rank.get(stop.id) ?? stop.order }))
          .sort((a, b) => a.order - b.order)
          .map((stop, index) => ({ ...stop, order: index })),
      };
    },
  );
}

/* ── Completion & trip-level actions ─────────────────────────── */

export function useCompleteTrip(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => itineraryService.completeItinerary(tripId),
    onSuccess: (trip) => {
      queryClient.setQueryData(itineraryKeys.trip(tripId), trip);
      // Keep My Trips / lists in sync with the new status.
      void queryClient.invalidateQueries({ queryKey: tripsKeys.all });
    },
  });
}

export interface EditableTripPatch {
  name: string;
  description: string;
  coverImage: string;
}

export function useEditTrip(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: EditableTripPatch) =>
      tripsService.patchTrip(tripId, {
        name: patch.name.trim(),
        description: patch.description.trim() || undefined,
        coverImage: patch.coverImage || undefined,
      }),
    onSuccess: (trip) => {
      queryClient.setQueryData(itineraryKeys.trip(tripId), trip);
      void queryClient.invalidateQueries({ queryKey: tripsKeys.all });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => tripsService.deleteTrip(tripId),
    onSuccess: (_result, tripId) => {
      // Remove every trace from the cache, including My Trips lists.
      queryClient.removeQueries({
        queryKey: itineraryKeys.itinerary(tripId),
      });
      queryClient.removeQueries({ queryKey: itineraryKeys.trip(tripId) });
      void queryClient.invalidateQueries({ queryKey: tripsKeys.all });
    },
  });
}
