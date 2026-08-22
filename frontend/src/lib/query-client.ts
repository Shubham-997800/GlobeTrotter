import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client.
 *
 * Global defaults are intentionally conservative so we never serve
 * stale dashboard data by accident. Override per-query when needed.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});