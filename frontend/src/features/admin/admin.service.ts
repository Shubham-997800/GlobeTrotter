import {
  getAdminDashboard,
  getAdminUsers,
  getAdminTrips,
  getAdminDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getAdminActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getAdminAnalytics,
} from "./admin.data";

export const adminService = {
  async getDashboard() {
    return getAdminDashboard();
  },

  async getUsers(params: Record<string, string | number>) {
    return getAdminUsers(params);
  },

  async getUser(userId: string) {
    const { users } = getAdminUsers({});
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    return user;
  },

  async updateUserRole(userId: string, role: string) {
    const { users } = getAdminUsers({});
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.role = role as "user" | "admin";
    return user;
  },

  async getTrips(params: Record<string, string | number>) {
    return getAdminTrips(params);
  },

  async getTrip(tripId: string) {
    const { trips } = getAdminTrips({});
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error("Trip not found");
    return trip;
  },

  async getDestinations(params: Record<string, string | number>) {
    return getAdminDestinations(params);
  },

  async createDestination(payload: Record<string, unknown>) {
    return createDestination(payload);
  },

  async updateDestination(destId: string, payload: Record<string, unknown>) {
    return updateDestination(destId, payload);
  },

  async deleteDestination(destId: string) {
    return deleteDestination(destId);
  },

  async getActivities(params: Record<string, string | number>) {
    return getAdminActivities(params);
  },

  async createActivity(payload: Record<string, unknown>) {
    return createActivity(payload);
  },

  async updateActivity(activityId: string, payload: Record<string, unknown>) {
    return updateActivity(activityId, payload);
  },

  async deleteActivity(activityId: string) {
    return deleteActivity(activityId);
  },

  async getAnalytics() {
    return getAdminAnalytics();
  },
};