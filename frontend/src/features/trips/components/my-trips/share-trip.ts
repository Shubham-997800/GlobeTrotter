import type { TripRecord } from "../../trips.types";

/**
 * Real sharing — Web Share API when available, clipboard deep-link
 * otherwise. The link always points at the actual trip route, never a
 * fake "copied!" destination.
 */
export async function shareTripLink(trip: Pick<TripRecord, "id" | "name">): Promise<
  "shared" | "copied"
> {
  const url = `${window.location.origin}/trips/${trip.id}/itinerary`;
  const shareData: ShareData = {
    title: `${trip.name || "My trip"} · GlobeTrotter`,
    text: `Check out my travel plan for ${trip.name || "this trip"}!`,
    url,
  };

  if (typeof navigator.share === "function") {
    await navigator.share(shareData);
    return "shared";
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}
