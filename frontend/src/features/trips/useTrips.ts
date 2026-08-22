import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tripsService } from "./trips.service";
import type {
  ActivityCategoryId,
  TripDraftValues,
} from "./trips.types";

/** Central cache keys so create/draft mutations can invalidate lists. */
export const tripsKeys = {
  all: ["trips"] as const,
  search: (query: string) => ["trips", "destination-search", query] as const,
  suggested: (filter: string, interests: string[]) =>
    ["trips", "suggested-destinations", filter, interests] as const,
  activities: (category: ActivityCategoryId) =>
    ["trips", "activities", category] as const,
  savedActivities: ["trips", "saved-activities"] as const,
};

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
    queryFn: () => Promise.resolve(tripsService.readSavedActivityIds()),
    staleTime: Infinity,
  });
}

export function useToggleSavedActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) =>
      Promise.resolve(tripsService.toggleSavedActivity(activityId)),
    onSuccess: (ids) => {
      queryClient.setQueryData(tripsKeys.savedActivities, ids);
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: TripDraftValues) => tripsService.createTrip(draft),
    onSuccess: () => {
      // The new trip must appear in My Trips without a refresh.
      void queryClient.invalidateQueries({ queryKey: tripsKeys.all });
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: TripDraftValues) => tripsService.saveTripDraft(draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tripsKeys.all });
    },
  });
}
