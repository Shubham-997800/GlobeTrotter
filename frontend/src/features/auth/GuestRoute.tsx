import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { FullScreenLoader } from "./ProtectedRoute";
import { useAuth } from "./useAuth";

/**
 * Wrapper for guest-only pages (login / register / forgot / reset).
 * Signed-in users are bounced to the app so they never see auth forms
 * unnecessarily. The intended destination is preserved for login.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/app"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
}

/** Reads the preserved "from" path written by ProtectedRoute. */
export function readIntendedPath(
  state: unknown,
  fallback = "/app",
): string {
  if (state && typeof state === "object" && "from" in state) {
    const from = (state as { from?: unknown }).from;
    if (typeof from === "string" && from.startsWith("/")) {
      return from;
    }
  }
  return fallback;
}
