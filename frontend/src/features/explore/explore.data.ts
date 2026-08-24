import type {
  ExploreDestination,
  ExploreActivity,
  PlaceCard,
  SearchResults,
  RecentSearch,
} from "./explore.types";
import { destinations as baseDestinations, activities as baseActivities } from "@/features/trips/trips.data";

/**
 * Region mapping for existing destinations
 */
const regionMap: Record<string, "asia" | "europe" | "north-america" | "south-america" | "africa" | "oceania"> = {
  kyoto: "asia",
  tokyo: "asia",
  bali: "asia",
  cusco: "south-america",
  paris: "europe",
  interlaken: "europe",
  santorini: "europe",
  marrakech: "africa",
  banff: "north-america",
  "cape-town": "africa",
  queenstown: "oceania",
  dubai: "asia",
};

/**
 * Best time to visit for each destination
 */
const bestTimeMap: Record<string, string> = {
  kyoto: "March–May (cherry blossoms), Oct–Nov (autumn foliage)",
  tokyo: "March–May, Sep–Nov",
  bali: "Apr–Oct (dry season)",
  cusco: "May–Sep (dry season)",
  paris: "Apr–Jun, Sep–Oct",
  interlaken: "Jun–Sep (hiking), Dec–Mar (skiing)",
  santorini: "Apr–Oct",
  marrakech: "Mar–May, Sep–Nov",
  banff: "Jun–Sep (summer), Dec–Mar (winter sports)",
  "cape-town": "Nov–Mar (summer)",
  queenstown: "Dec–Feb (summer), Jun–Aug (winter sports)",
  dubai: "Nov–Mar",
};

/**
 * Recommended duration for each destination
 */
const durationMap: Record<string, string> = {
  kyoto: "3–5 days",
  tokyo: "4–6 days",
  bali: "5–7 days",
  cusco: "4–6 days",
  paris: "3–5 days",
  interlaken: "3–4 days",
  santorini: "3–4 days",
  marrakech: "3–4 days",
  banff: "4–5 days",
  "cape-town": "4–6 days",
  queenstown: "3–4 days",
  dubai: "3–5 days",
};

/**
 * Trending scores for trending section
 */
const trendingScores: Record<string, number> = {
  kyoto: 98,
  bali: 95,
  tokyo: 93,
  paris: 92,
  santorini: 90,
  interlaken: 88,
  banff: 87,
  dubai: 86,
  marrakech: 85,
  "cape-town": 84,
  queenstown: 83,
  cusco: 82,
};

/**
 * Extended explore destinations with region, best time, recommended duration
 */
export const exploreDestinations: ExploreDestination[] = baseDestinations.map((d) => ({
  ...d,
  region: regionMap[d.id] ?? "asia",
  bestTimeToVisit: bestTimeMap[d.id] ?? "Year-round",
  recommendedDuration: durationMap[d.id] ?? "3–5 days",
  trendingScore: trendingScores[d.id],
}));

/**
 * Extended activities for explore
 */
export const exploreActivities: ExploreActivity[] = baseActivities.map((a, index) => ({
  ...a,
  location: a.city,
  rating: 4.5 + (index % 5) * 0.1,
}));

/**
 * Place cards for destination details
 */
export const placeCards: PlaceCard[] = [
  // Kyoto places
  {
    id: "place-kyoto-fushimi",
    name: "Fushimi Inari Shrine",
    category: "Cultural Site",
    description: "Iconic shrine with thousands of vermilion torii gates winding up the mountain.",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Torii gates at Fushimi Inari Shrine",
    destinationId: "kyoto",
  },
  {
    id: "place-kyoto-kinkakuji",
    name: "Kinkaku-ji (Golden Pavilion)",
    category: "Temple",
    description: "Zen temple covered in gold leaf, reflected in a mirror pond.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Golden Pavilion in Kyoto",
    destinationId: "kyoto",
  },
  {
    id: "place-kyoto-arashiyama",
    name: "Arashiyama Bamboo Grove",
    category: "Nature",
    description: "Towering bamboo forest creating an otherworldly atmosphere.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Bamboo grove in Arashiyama",
    destinationId: "kyoto",
  },
  // Paris places
  {
    id: "place-paris-eiffel",
    name: "Eiffel Tower",
    category: "Landmark",
    description: "Iconic iron lattice tower offering panoramic city views.",
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Eiffel Tower in Paris",
    destinationId: "paris",
  },
  {
    id: "place-paris-louvre",
    name: "Louvre Museum",
    category: "Museum",
    description: "World's largest art museum, home to the Mona Lisa.",
    image: "https://images.unsplash.com/photo-1566438763742-21e2b54b6b3d?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Louvre Museum pyramid",
    destinationId: "paris",
  },
  {
    id: "place-paris-montmartre",
    name: "Montmartre & Sacré-Cœur",
    category: "Neighborhood",
    description: "Historic artistic district with basilica and city views.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Sacré-Cœur basilica in Montmartre",
    destinationId: "paris",
  },
  // Bali places
  {
    id: "place-bali-ubud",
    name: "Ubud Monkey Forest",
    category: "Nature",
    description: "Sacred forest sanctuary with playful long-tailed macaques.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Monkey forest in Ubud",
    destinationId: "bali",
  },
  {
    id: "place-bali-tanahlot",
    name: "Tanah Lot Temple",
    category: "Temple",
    description: "Sea temple perched on a rock formation at sunset.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Tanah Lot temple at sunset",
    destinationId: "bali",
  },
  // Interlaken places
  {
    id: "place-interlaken-jungfrau",
    name: "Jungfraujoch - Top of Europe",
    category: "Mountain",
    description: "Highest railway station in Europe with glacier views.",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Jungfraujoch alpine view",
    destinationId: "interlaken",
  },
  {
    id: "place-interlaken-lauterbrunnen",
    name: "Lauterbrunnen Valley",
    category: "Nature",
    description: "Valley of 72 waterfalls with dramatic cliff faces.",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Lauterbrunnen valley waterfalls",
    destinationId: "interlaken",
  },
];

/**
 * Get trending destinations sorted by trending score
 */
export function getTrendingDestinations(limit = 6): ExploreDestination[] {
  return [...exploreDestinations]
    .sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0))
    .slice(0, limit);
}

/**
 * Get popular destinations sorted by reviews
 */
export function getPopularDestinations(limit = 6): ExploreDestination[] {
  return [...exploreDestinations]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, limit);
}

/**
 * Get destinations by region
 */
export function getDestinationsByRegion(regionId: string): ExploreDestination[] {
  if (regionId === "all") return exploreDestinations;
  return exploreDestinations.filter((d) => d.region === regionId);
}

/**
 * Get destinations by category (tag)
 */
export function getDestinationsByCategory(category: string): ExploreDestination[] {
  if (category === "all") return exploreDestinations;
  return exploreDestinations.filter((d) => d.tags.includes(category as any));
}

/**
 * Get recommended destinations based on interests
 */
export function getRecommendedDestinations(
  interests: string[],
  savedIds: string[],
  limit = 6
): ExploreDestination[] {
  const scored = exploreDestinations
    .filter((d) => !savedIds.includes(d.id))
    .map((d) => ({
      destination: d,
      score:
        d.tags.filter((tag) => interests.includes(tag)).length * 10 +
        (savedIds.includes(d.id) ? 50 : 0) +
        (d.trendingScore ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({
      ...entry.destination,
      matchReasons: entry.destination.tags.filter((tag) => interests.includes(tag)),
    }));

  return scored;
}

/**
 * Search destinations, activities, and places
 */
export async function searchExplore(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase();

  if (!q) {
    return {
      destinations: [],
      activities: [],
      places: [],
      totalCount: 0,
    };
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const destinations = exploreDestinations.filter(
    (d) =>
      d.city.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.tags.some((tag) => tag.includes(q)) ||
      d.description.toLowerCase().includes(q)
  );

  const activities = exploreActivities.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.category.includes(q) ||
      a.description.toLowerCase().includes(q)
  );

  const places = placeCards.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );

  return {
    destinations,
    activities,
    places,
    totalCount: destinations.length + activities.length + places.length,
  };
}

/**
 * Get destination detail data
 */
export function getDestinationDetail(destinationId: string) {
  const destination = exploreDestinations.find((d) => d.id === destinationId);
  if (!destination) return null;

  const savedIds = readSavedDestinationIds();
  const topPlaces = placeCards.filter((p) => p.destinationId === destinationId).slice(0, 6);
  const popularActivities = exploreActivities.filter((a) => a.city === destination.city).slice(0, 6);

  return {
    destination: {
      ...destination,
      matchReasons: [],
    },
    topPlaces,
    popularActivities,
    saved: savedIds.includes(destinationId),
  };
}

/**
 * Saved destination persistence (shared with dashboard)
 */
const SAVED_DESTINATIONS_KEY = "globetrotter.dashboard.saved-destinations";

export function readSavedDestinationIds(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_DESTINATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function toggleSavedDestination(destinationId: string): string[] {
  const ids = readSavedDestinationIds();
  const nextIds = ids.includes(destinationId)
    ? ids.filter((id) => id !== destinationId)
    : [...ids, destinationId];
  try {
    window.localStorage.setItem(SAVED_DESTINATIONS_KEY, JSON.stringify(nextIds));
  } catch {
    // Storage unavailable — keep in-memory behaviour only.
  }
  return nextIds;
}

/**
 * Recent searches persistence
 */
const RECENT_SEARCHES_KEY = "globetrotter.explore.recent-searches";
const MAX_RECENT_SEARCHES = 8;

export function readRecentSearches(): RecentSearch[] {
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is RecentSearch =>
            typeof item === "object" && item !== null && "query" in item && "timestamp" in item && "id" in item
          )
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  const searches = readRecentSearches();
  const trimmed = query.trim();
  if (!trimmed) return;

  const next = [
    { id: `search-${Date.now()}`, query: trimmed, timestamp: Date.now() },
    ...searches.filter((s) => s.query.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);

  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable
  }
}

export function removeRecentSearch(query: string): void {
  const searches = readRecentSearches().filter((s) => s.query !== query);
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // Storage unavailable
  }
}

export function clearRecentSearches(): void {
  try {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Storage unavailable
  }
}

/**
 * Get all regions for filter
 */
export const regions = [
  { id: "asia", label: "Asia", count: exploreDestinations.filter((d) => d.region === "asia").length },
  { id: "europe", label: "Europe", count: exploreDestinations.filter((d) => d.region === "europe").length },
  { id: "north-america", label: "North America", count: exploreDestinations.filter((d) => d.region === "north-america").length },
  { id: "south-america", label: "South America", count: exploreDestinations.filter((d) => d.region === "south-america").length },
  { id: "africa", label: "Africa", count: exploreDestinations.filter((d) => d.region === "africa").length },
  { id: "oceania", label: "Oceania", count: exploreDestinations.filter((d) => d.region === "oceania").length },
];

/**
 * Budget tier filters with description
 */
export const budgetFilters = [
  { id: "budget", label: "Budget Friendly", description: "Hostels, street food, public transport" },
  { id: "moderate", label: "Moderate", description: "Comfortable stays, some splurges" },
  { id: "premium", label: "Premium", description: "Boutique stays, fine dining, private tours" },
] as const;

/**
 * Duration filters
 */
export const durationFilters = [
  { id: "weekend", label: "Weekend (2–3 days)" },
  { id: "3-5", label: "3–5 Days" },
  { id: "week", label: "1 Week" },
  { id: "2weeks", label: "2+ Weeks" },
] as const;

/**
 * Sort options
 */
export const sortOptions = [
  { id: "popular", label: "Most Popular" },
  { id: "trending", label: "Trending Now" },
  { id: "recommended", label: "Recommended" },
  { id: "alphabetical", label: "A–Z" },
] as const;

/**
 * Category filters
 */
export const categoryFilters = [
  { id: "all", label: "All" },
  { id: "adventure", label: "Adventure" },
  { id: "nature", label: "Nature" },
  { id: "beaches", label: "Beaches" },
  { id: "mountains", label: "Mountains" },
  { id: "culture", label: "Culture" },
  { id: "food", label: "Food" },
  { id: "history", label: "History" },
  { id: "city-life", label: "City Life" },
  { id: "nightlife", label: "Nightlife" },
  { id: "relaxation", label: "Relaxation" },
] as const;