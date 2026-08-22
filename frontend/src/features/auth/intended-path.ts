/** Reads the preserved "from" path written by ProtectedRoute. */
export function readIntendedPath(state: unknown, fallback = "/dashboard"): string {
  if (state && typeof state === "object" && "from" in state) {
    const from = (state as { from?: unknown }).from;
    if (typeof from === "string" && from.startsWith("/")) {
      return from;
    }
  }
  return fallback;
}
