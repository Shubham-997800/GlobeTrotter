import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tripsService } from "./trips.service";
import type {
  ActivityCategoryId,
  TripDraftValues,
} from "./trips.types";

/** Central cache keys so create/draft mutations can invalidate lists. */
export const tripsKeys = {
  all: ["trips"] as const,
  list: () => ["trips", "list"] as const,
  detail: (id: string) => ["trips", "detail", id] as const,
  search: (query: string) => ["trips", "destination-search", query] as const,
  suggested: (filter: string, interests: string[]) =>
    ["trips", "suggested-destinations", filter, interests] as const,
  activities: (category: ActivityCategoryId) =>
    ["trips", "activities", category] as const,
  savedActivities: ["trips", "saved-activities"] as const,
};

/**
 * Every My Trips mutation touches the same records the dashboard
 * snapshot renders, so both cache prefixes are invalidated together.
 */
function useTripsInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: tripsKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

/* ── Catalog queries ─────────────────────────────────────────── */

export function useDestinationSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: tripsKeys.search(query),
    queryFn: () => tripsService.searchDestinations(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 60_000,
  });
}

export function useSuggestedDestinations(
  filter: "interests" | "budget" | "popular",
  interests: string[],
) {
  return useQuery({
    queryKey: tripsKeys.suggested(filter, interests),
    queryFn: () => tripsService.getSuggestedDestinations(filter, interests),
    staleTime: 5 * 60_000,
  });
}

export function useSuggestedActivities(category: ActivityCategoryId) {
  return useQuery({
    queryKey: tripsKeys.activities(category),
    queryFn: () => tripsService.getActivities(category),
    staleTime: 5 * 60_000,
  });
}

export function useSavedActivityIds() {
  return useQuery({
    queryKey: tripsKeys.savedActivities,
    queryFn: () => tripsService.readSavedActivityIds(),
    staleTime: Infinity,
  });
}

export function useToggleSavedActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => tripsService.toggleSavedActivity(activityId),
    onSuccess: (ids) => {
      queryClient.setQueryData(tripsKeys.savedActivities, ids);
    },
  });
}

/* ── Trip records ────────────────────────────────────────────── */

/** Full trip list for My Trips — the dataset is client-resident. */
export function useTripsList() {
  return useQuery({
    queryKey: tripsKeys.list(),
    queryFn: () => tripsService.listTrips(),
    staleTime: 30_000,
  });
}

export interface CreateTripInput {
  values: TripDraftValues;
  activityIds?: string[];
}

export function useCreateTrip() {
  const invalidate = useTripsInvalidation();
  return useMutation({
    mutationFn: ({ values, activityIds }: CreateTripInput) =>
      tripsService.createTrip(values, activityIds ?? []),
    onSuccess: () => {
      // The new trip must appear in My Trips without a refresh.
      invalidate();
    },
  });
}

export function useSaveDraft() {
  const invalidate = useTripsInvalidation();
  return useMutation({
    mutationFn: ({ values, activityIds }: CreateTripInput) =>
      tripsService.saveTripDraft(values, activityIds ?? []),
    onSuccess: invalidate,
  });
}

export function useUpdateTrip() {
  const invalidate = useTripsInvalidation();
  return useMutation({
    mutationFn: ({
      tripId,
      values,
      activityIds,
    }: CreateTripInput & { tripId: string }) =>
      tripsService.updateTrip(tripId, values, activityIds),
    onSuccess: invalidate,
  });
}

export interface DeleteTripsResult {
  deletedIds: string[];
  failedIds: string[];
}

export function useDeleteTrips() {
  const invalidate = useTripsInvalidation();
  return useMutation({
    mutationFn: (tripIds: string[]) => tripsService.deleteTrips(tripIds),
    onSuccess: invalidate,
  });
}

export function useDuplicateTrip() {
  const invalidate = useTripsInvalidation();
  return useMutation({
    mutationFn: (tripId: string) => tripsService.duplicateTrip(tripId),
    onSuccess: invalidate,
  });
}

export function useSetTripsArchived() {
  const invalidate = useTripsInvalidation();
  return useMutation({
    mutationFn: ({
      tripIds,
      archived,
    }: {
      tripIds: string[];
      archived: boolean;
    }) => tripsService.setTripsArchived(tripIds, archived),
    onSuccess: invalidate,
  });
}
