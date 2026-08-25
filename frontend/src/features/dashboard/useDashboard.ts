import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  loadDashboard,
  readSavedDestinations,
  toggleSavedDestination,
} from "./dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  snapshot: () => [...dashboardKeys.all, "snapshot"] as const,
  savedDestinations: () =>
    [...dashboardKeys.all, "saved-destinations"] as const,
};

export function useDashboardData() {
  return useQuery({
    queryKey: dashboardKeys.snapshot(),
    queryFn: loadDashboard,
    staleTime: 60_000,
  });
}

export function useSavedDestinationIds() {
  return useQuery({
    queryKey: dashboardKeys.savedDestinations(),
    queryFn: readSavedDestinations,
  });
}

export function useToggleSavedDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleSavedDestination,
    onSuccess: (ids) => {
      queryClient.setQueryData(dashboardKeys.savedDestinations(), ids);
    },
  });
}
