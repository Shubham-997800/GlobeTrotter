/**
 * Dashboard domain types — kept separate from UI so a real API can
 * replace `dashboard.data.ts` without touching any component.
 */

export type RegionId =
  | "asia"
  | "europe"
  | "north-america"
  | "south-america"
  | "africa"
  | "oceania";

export type DestinationCategory =
  | "trending"
  | "beaches"
  | "mountains"
  | "cities"
  | "adventure";

export interface Region {
  id: RegionId;
  label: string;
  /** Emoji-free short tagline shown under the region tab. */
  blurb: string;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  region: RegionId;
  category: DestinationCategory;
  rating: number;
  reviews: number;
  /** Estimated budget from India, in INR. */
  estimatedBudgetInr: number;
  description: string;
  image: string;
  imageAlt: string;
}

export interface FeaturedSlide {
  id: string;
  badge: string;
  name: string;
  description: string;
  bestTime: string;
  country: string;
  category: string;
  image: string;
  imageAlt: string;
}

export type TripStatus = "ongoing" | "upcoming" | "completed";

export interface Trip {
  id: string;
  name: string;
  destinations: string[];
  country: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  /** 0–100 itinerary completion. */
  progress: number;
  currentDay?: { day: number; of: number };
  budget?: { spentInr: number; totalInr: number };
  image: string;
  imageAlt: string;
}

export type ActivityEventType =
  | "trip-created"
  | "activity-added"
  | "itinerary-updated"
  | "budget-updated"
  | "community-post";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
}

export interface Insight {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
}

export interface QuickActionDef {
  id: string;
  title: string;
  description: string;
  href: string;
  emphasized?: boolean;
}
