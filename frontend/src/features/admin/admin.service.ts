import {
  getAdminDashboard,
  getAdminUsers,
  getAdminUser,
  updateAdminUserRole,
  getAdminTrips,
  getAdminTrip,
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
    const { user } = await getAdminUser(userId);
    return user;
  },

  async updateUserRole(userId: string, role: string) {
    const { user } = await updateAdminUserRole(userId, role);
    return user;
  },

  async getTrips(params: Record<string, string | number>) {
    return getAdminTrips(params);
  },

  async getTrip(tripId: string) {
    const { trip } = await getAdminTrip(tripId);
    return trip;
  },

  async getDestinations(params: Record<string, string | number>) {
    return getAdminDestinations(params);
  },

  async createDestination(payload: Record<string, unknown>) {
    const { destination } = await createDestination(payload);
    return destination;
  },

  async updateDestination(destId: string, payload: Record<string, unknown>) {
    const { destination } = await updateDestination(destId, payload);
    return destination;
  },

  async deleteDestination(destId: string) {
    await deleteDestination(destId);
  },

  async getActivities(params: Record<string, string | number>) {
    return getAdminActivities(params);
  },

  async createActivity(payload: Record<string, unknown>) {
    const { activity } = await createActivity(payload);
    return activity;
  },

  async updateActivity(activityId: string, payload: Record<string, unknown>) {
    const { activity } = await updateActivity(activityId, payload);
    return activity;
  },

  async deleteActivity(activityId: string) {
    await deleteActivity(activityId);
  },

  async getAnalytics() {
    return getAdminAnalytics();
  },
};
