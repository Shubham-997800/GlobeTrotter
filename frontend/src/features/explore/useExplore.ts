import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { exploreService } from "./explore.service";

/** Central cache keys for explore module */
export const exploreKeys = {
  all: ["explore"] as const,
  trending: (limit: number) => ["explore", "trending", limit] as const,
  popular: (limit: number) => ["explore", "popular", limit] as const,
  byRegion: (regionId: string) => ["explore", "by-region", regionId] as const,
  byCategory: (category: string) => ["explore", "by-category", category] as const,
  recommended: (interests: string[], savedIds: string[]) =>
    ["explore", "recommended", interests.join(","), savedIds.join(",")] as const,
  search: (query: string) => ["explore", "search", query] as const,
  suggestions: (query: string) => ["explore", "suggestions", query] as const,
  destinationDetail: (destinationId: string) => ["explore", "destination", destinationId] as const,
  savedDestinations: () => ["explore", "saved-destinations"] as const,
  recentSearches: () => ["explore", "recent-searches"] as const,
  regions: () => ["explore", "regions"] as const,
  budgetFilters: () => ["explore", "budget-filters"] as const,
  durationFilters: () => ["explore", "duration-filters"] as const,
  sortOptions: () => ["explore", "sort-options"] as const,
  categoryFilters: () => ["explore", "category-filters"] as const,
  tripsForSelector: () => ["explore", "trips-selector"] as const,
};

/* ── Catalog queries ─────────────────────────────────────────── */

export function useTrendingDestinations(limit = 6) {
  return useQuery({
    queryKey: exploreKeys.trending(limit),
    queryFn: () => exploreService.getTrendingDestinations(limit),
    staleTime: 5 * 60_000,
  });
}

export function usePopularDestinations(limit = 9) {
  return useQuery({
    queryKey: exploreKeys.popular(limit),
    queryFn: () => exploreService.getPopularDestinations(limit),
    staleTime: 5 * 60_000,
  });
}

export function useDestinationsByRegion(regionId: string) {
  return useQuery({
    queryKey: exploreKeys.byRegion(regionId),
    queryFn: () => exploreService.getDestinationsByRegion(regionId),
    staleTime: 5 * 60_000,
    enabled: regionId !== "all",
  });
}

export function useDestinationsByCategory(category: string) {
  return useQuery({
    queryKey: exploreKeys.byCategory(category),
    queryFn: () => exploreService.getDestinationsByCategory(category),
    staleTime: 5 * 60_000,
    enabled: category !== "all",
  });
}

export function useRecommendedDestinations(
  interests: string[],
  savedIds: string[],
  limit = 6
) {
  return useQuery({
    queryKey: exploreKeys.recommended(interests, savedIds),
    queryFn: () => exploreService.getRecommendedDestinations(interests, savedIds, limit),
    staleTime: 5 * 60_000,
  });
}

export function useSearchResults(query: string, enabled = true) {
  return useQuery({
    queryKey: exploreKeys.search(query),
    queryFn: () => exploreService.search(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 60_000,
  });
}

export function useSearchSuggestions(query: string, enabled = true) {
  return useQuery({
    queryKey: exploreKeys.suggestions(query),
    queryFn: () => exploreService.getSearchSuggestions(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 30_000,
  });
}

export function useDestinationDetail(destinationId: string) {
  return useQuery({
    queryKey: exploreKeys.destinationDetail(destinationId),
    queryFn: () => exploreService.getDestinationDetail(destinationId),
    enabled: !!destinationId,
    staleTime: 5 * 60_000,
  });
}

export function useSavedDestinationIds() {
  return useQuery({
    queryKey: exploreKeys.savedDestinations(),
    queryFn: () => exploreService.readSavedDestinations(),
    staleTime: Infinity,
  });
}

export function useRecentSearches() {
  return useQuery({
    queryKey: exploreKeys.recentSearches(),
    queryFn: () => exploreService.readRecentSearches(),
    staleTime: Infinity,
  });
}

export function useRegions() {
  return useQuery({
    queryKey: exploreKeys.regions(),
    queryFn: () => exploreService.getRegions(),
    staleTime: Infinity,
  });
}

export function useBudgetFilters() {
  return useQuery({
    queryKey: exploreKeys.budgetFilters(),
    queryFn: () => exploreService.getBudgetFilters(),
    staleTime: Infinity,
  });
}

export function useDurationFilters() {
  return useQuery({
    queryKey: exploreKeys.durationFilters(),
    queryFn: () => exploreService.getDurationFilters(),
    staleTime: Infinity,
  });
}

export function useSortOptions() {
  return useQuery({
    queryKey: exploreKeys.sortOptions(),
    queryFn: () => exploreService.getSortOptions(),
    staleTime: Infinity,
  });
}

export function useCategoryFilters() {
  return useQuery({
    queryKey: exploreKeys.categoryFilters(),
    queryFn: () => exploreService.getCategoryFilters(),
    staleTime: Infinity,
  });
}

export function useTripsForSelector() {
  return useQuery({
    queryKey: exploreKeys.tripsForSelector(),
    queryFn: () => exploreService.getTripsForSelector(),
    staleTime: 30_000,
  });
}

/* ── Mutations ───────────────────────────────────────────────── */

export function useToggleSavedDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (destinationId: string) => exploreService.toggleSavedDestination(destinationId),
    onSuccess: (ids) => {
      queryClient.setQueryData(exploreKeys.savedDestinations(), ids);
      // Also invalidate dashboard saved destinations for cross-module sync
      queryClient.invalidateQueries({ queryKey: ["dashboard", "saved-destinations"] });
    },
  });
}

export function useAddRecentSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query: string) => exploreService.addRecentSearch(query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exploreKeys.recentSearches() });
    },
  });
}

export function useRemoveRecentSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query: string) => exploreService.removeRecentSearch(query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exploreKeys.recentSearches() });
    },
  });
}

export function useClearRecentSearches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => exploreService.clearRecentSearches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exploreKeys.recentSearches() });
    },
  });
}

export function useAddToTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { destinationId: string; tripId: string; dayId: string; activityId?: string }) =>
      exploreService.addToTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}