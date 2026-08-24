import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "./admin.service";

export const adminKeys = {
  all: ["admin"] as const,
  dashboard: () => ["admin", "dashboard"] as const,
  users: (params: Record<string, string | number>) => ["admin", "users", params] as const,
  user: (id: string) => ["admin", "user", id] as const,
  trips: (params: Record<string, string | number>) => ["admin", "trips", params] as const,
  trip: (id: string) => ["admin", "trip", id] as const,
  destinations: (params: Record<string, string | number>) => ["admin", "destinations", params] as const,
  activities: (params: Record<string, string | number>) => ["admin", "activities", params] as const,
  analytics: () => ["admin", "analytics"] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminService.getDashboard(),
    staleTime: 30_000,
  });
}

export function useAdminUsers(params: Record<string, string | number>) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminService.getUsers(params),
    staleTime: 10_000,
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: adminKeys.user(userId),
    queryFn: () => adminService.getUser(userId),
    enabled: !!userId,
  });
}

export function useAdminUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminTrips(params: Record<string, string | number>) {
  return useQuery({
    queryKey: adminKeys.trips(params),
    queryFn: () => adminService.getTrips(params),
    staleTime: 10_000,
  });
}

export function useAdminTrip(tripId: string) {
  return useQuery({
    queryKey: adminKeys.trip(tripId),
    queryFn: () => adminService.getTrip(tripId),
    enabled: !!tripId,
  });
}

export function useAdminDestinations(params: Record<string, string | number>) {
  return useQuery({
    queryKey: adminKeys.destinations(params),
    queryFn: () => adminService.getDestinations(params),
    staleTime: 10_000,
  });
}

export function useAdminCreateDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminService.createDestination(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminUpdateDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ destId, payload }: { destId: string; payload: Record<string, unknown> }) =>
      adminService.updateDestination(destId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminDeleteDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (destId: string) => adminService.deleteDestination(destId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminActivities(params: Record<string, string | number>) {
  return useQuery({
    queryKey: adminKeys.activities(params),
    queryFn: () => adminService.getActivities(params),
    staleTime: 10_000,
  });
}

export function useAdminCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminService.createActivity(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, payload }: { activityId: string; payload: Record<string, unknown> }) =>
      adminService.updateActivity(activityId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => adminService.deleteActivity(activityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: () => adminService.getAnalytics(),
    staleTime: 30_000,
  });
}
