import { apiClient } from "@/services/api/client";
import type {
  AdminDashboardData,
  AdminUser,
  AdminTrip,
  AdminDestination,
  AdminActivity,
  AdminPagination,
  AdminAnalyticsData,
} from "./admin.types";

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const { data } = await apiClient.get<AdminDashboardData>("/admin/stats");
  return data;
}

export async function getAdminUsers(
  params: Record<string, string | number>,
): Promise<{ users: AdminUser[]; pagination: AdminPagination }> {
  const { data } = await apiClient.get<{ users: AdminUser[]; pagination: AdminPagination }>(
    "/admin/users",
    { params },
  );
  return data;
}

export async function getAdminUser(
  userId: string,
): Promise<{ user: AdminUser }> {
  const { data } = await apiClient.get<{ user: AdminUser }>(
    `/admin/users/${userId}`,
  );
  return data;
}

export async function updateAdminUserRole(
  userId: string,
  role: string,
): Promise<{ user: { id: string; role: string } }> {
  const { data } = await apiClient.patch<{ user: { id: string; role: string } }>(
    `/admin/users/${userId}/role`,
    { role },
  );
  return data;
}

export async function getAdminTrips(
  params: Record<string, string | number>,
): Promise<{ trips: AdminTrip[]; pagination: AdminPagination }> {
  const { data } = await apiClient.get<{ trips: AdminTrip[]; pagination: AdminPagination }>(
    "/admin/trips",
    { params },
  );
  return data;
}

export async function getAdminTrip(
  tripId: string,
): Promise<{ trip: AdminTrip }> {
  const { data } = await apiClient.get<{ trip: AdminTrip }>(
    `/admin/trips/${tripId}`,
  );
  return data;
}

export async function getAdminDestinations(
  params: Record<string, string | number>,
): Promise<{ destinations: AdminDestination[]; pagination: AdminPagination }> {
  const { data } = await apiClient.get<{ destinations: AdminDestination[]; pagination: AdminPagination }>(
    "/admin/destinations",
    { params },
  );
  return data;
}

export async function createDestination(
  payload: Record<string, unknown>,
): Promise<{ destination: AdminDestination }> {
  const { data } = await apiClient.post<{ destination: AdminDestination }>(
    "/admin/destinations",
    payload,
  );
  return data;
}

export async function updateDestination(
  destId: string,
  payload: Record<string, unknown>,
): Promise<{ destination: AdminDestination }> {
  const { data } = await apiClient.patch<{ destination: AdminDestination }>(
    `/admin/destinations/${destId}`,
    payload,
  );
  return data;
}

export async function deleteDestination(destId: string): Promise<void> {
  await apiClient.delete(`/admin/destinations/${destId}`);
}

export async function getAdminActivities(
  params: Record<string, string | number>,
): Promise<{ activities: AdminActivity[]; pagination: AdminPagination }> {
  const { data } = await apiClient.get<{ activities: AdminActivity[]; pagination: AdminPagination }>(
    "/admin/activities",
    { params },
  );
  return data;
}

export async function createActivity(
  payload: Record<string, unknown>,
): Promise<{ activity: AdminActivity }> {
  const { data } = await apiClient.post<{ activity: AdminActivity }>(
    "/admin/activities",
    payload,
  );
  return data;
}

export async function updateActivity(
  activityId: string,
  payload: Record<string, unknown>,
): Promise<{ activity: AdminActivity }> {
  const { data } = await apiClient.patch<{ activity: AdminActivity }>(
    `/admin/activities/${activityId}`,
    payload,
  );
  return data;
}

export async function deleteActivity(activityId: string): Promise<void> {
  await apiClient.delete(`/admin/activities/${activityId}`);
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  const { data } = await apiClient.get<AdminAnalyticsData>("/admin/analytics");
  return data;
}
