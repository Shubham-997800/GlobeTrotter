import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("globetrotter.auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Best-effort
  }
  return config;
});

function authHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem("globetrotter.auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Best-effort
  }
  return {};
}

export const adminService = {
  async getDashboard() {
    const { data } = await api.get("/admin/stats", { headers: authHeaders() });
    return data;
  },

  async getUsers(params: Record<string, string | number>) {
    const { data } = await api.get("/admin/users", { params, headers: authHeaders() });
    return data;
  },

  async getUser(userId: string) {
    const { data } = await api.get(`/admin/users/${userId}`, { headers: authHeaders() });
    return data;
  },

  async updateUserRole(userId: string, role: string) {
    const { data } = await api.patch(
      `/admin/users/${userId}/role`,
      { role },
      { headers: authHeaders() },
    );
    return data;
  },

  async getTrips(params: Record<string, string | number>) {
    const { data } = await api.get("/admin/trips", { params, headers: authHeaders() });
    return data;
  },

  async getTrip(tripId: string) {
    const { data } = await api.get(`/admin/trips/${tripId}`, { headers: authHeaders() });
    return data;
  },

  async getDestinations(params: Record<string, string | number>) {
    const { data } = await api.get("/admin/destinations", { params, headers: authHeaders() });
    return data;
  },

  async createDestination(payload: Record<string, unknown>) {
    const { data } = await api.post("/admin/destinations", payload, { headers: authHeaders() });
    return data;
  },

  async updateDestination(destId: string, payload: Record<string, unknown>) {
    const { data } = await api.patch(`/admin/destinations/${destId}`, payload, {
      headers: authHeaders(),
    });
    return data;
  },

  async deleteDestination(destId: string) {
    await api.delete(`/admin/destinations/${destId}`, { headers: authHeaders() });
  },

  async getActivities(params: Record<string, string | number>) {
    const { data } = await api.get("/admin/activities", { params, headers: authHeaders() });
    return data;
  },

  async createActivity(payload: Record<string, unknown>) {
    const { data } = await api.post("/admin/activities", payload, { headers: authHeaders() });
    return data;
  },

  async updateActivity(activityId: string, payload: Record<string, unknown>) {
    const { data } = await api.patch(`/admin/activities/${activityId}`, payload, {
      headers: authHeaders(),
    });
    return data;
  },

  async deleteActivity(activityId: string) {
    await api.delete(`/admin/activities/${activityId}`, { headers: authHeaders() });
  },

  async getAnalytics() {
    const { data } = await api.get("/admin/analytics", { headers: authHeaders() });
    return data;
  },
};
