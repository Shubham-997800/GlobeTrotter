import axios from "axios";

/**
 * Central Axios instance.
 *
 * Point `baseURL` at your API when it is ready. Everything in the app
 * that talks to the backend should go through this instance so
 * interceptors (auth headers, error normalization, refresh) can be
 * added in a single place.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 15_000,
});

// Example: attach an auth token when present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize backend errors into a friendly message for UI toasts.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ??
      "Something went wrong. Please try again later.";
    // eslint-disable-next-line no-console
    console.error("[api]", message);
    return Promise.reject(new Error(message));
  },
);

export default api;