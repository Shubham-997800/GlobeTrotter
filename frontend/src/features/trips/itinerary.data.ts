/**
 * Static itinerary-builder reference data. Coordinates are real city
 * centres used only for plotting markers — no routing/distance is
 * derived from them.
 */

import type { ActivityFilterId } from "./itinerary.types";

export interface CityCoordinate {
  lat: number;
  lng: number;
}

/** Real coordinates for every destination in the curated catalog. */
export const destinationCoordinates: Record<string, CityCoordinate> = {
  kyoto: { lat: 35.0116, lng: 135.7681 },
  bali: { lat: -8.4095, lng: 115.1889 },
  paris: { lat: 48.8566, lng: 2.3522 },
  interlaken: { lat: 46.6863, lng: 7.8632 },
  santorini: { lat: 36.3932, lng: 25.4615 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  banff: { lat: 51.4986, lng: -115.9284 },
  cusco: { lat: -13.5319, lng: -71.9675 },
  "cape-town": { lat: -33.9249, lng: 18.4241 },
  marrakech: { lat: 31.6295, lng: -7.9811 },
  queenstown: { lat: -45.0312, lng: 168.6626 },
  dubai: { lat: 25.2048, lng: 55.2708 },
};

export function coordinateFor(destinationId: string): CityCoordinate | null {
  return destinationCoordinates[destinationId] ?? null;
}

/**
 * Theme-token accent classes per activity category, following the
 * travel-entity color rules from `theme.md` (badges/icons only —
 * primary CTAs always stay green).
 */
export const CATEGORY_ACCENT_CLASSES: Record<string, string> = {
  adventure: "bg-transport/10 text-transport border-transport/30",
  culture: "bg-activity/10 text-activity border-activity/30",
  food: "bg-food/10 text-food border-food/30",
  nature: "bg-success/10 text-success-text border-success-border",
  custom: "bg-muted text-muted-foreground border-border",
};

export function categoryAccentClass(category: string): string {
  return (
    CATEGORY_ACCENT_CLASSES[category] ??
    "bg-activity/10 text-activity border-activity/30"
  );
}

/** Catalog categories surfaced by the itinerary builder filters. */
export const FILTER_TO_CATALOG_CATEGORY: Partial<
  Record<ActivityFilterId, "adventure" | "culture" | "food" | "nature">
> = {
  adventure: "adventure",
  culture: "culture",
  food: "food",
  nature: "nature",
};
