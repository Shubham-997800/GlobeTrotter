import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const AUTH_TOKEN_STORAGE_KEY = "globetrotter.auth.token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);
