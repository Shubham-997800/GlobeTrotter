import type {
  ActivityEvent,
  AppNotification,
  Destination,
  FeaturedSlide,
  Insight,
  QuickActionDef,
  Region,
  SearchItem,
  Trip,
} from "./dashboard.types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

/* ── Featured banner carousel ─────────────────────────────────── */

export const featuredSlides: FeaturedSlide[] = [
  {
    id: "kyoto",
    badge: "Featured Destination",
    name: "Kyoto, Japan",
    description:
      "Temples wrapped in maple leaves, quiet lantern-lit lanes and the calm of ancient tea houses.",
    bestTime: "Mar – Apr · Oct – Nov",
    country: "Japan",
    category: "Culture & Heritage",
    image: img("photo-1493976040374-85c8e12f0c0e", 1600),
    imageAlt: "Pagoda and cherry blossoms in Kyoto, Japan",
  },
  {
    id: "santorini",
    badge: "Editor's Pick",
    name: "Santorini, Greece",
    description:
      "Whitewashed cliffside villages above a deep-blue caldera — sunsets that stop conversations.",
    bestTime: "Apr – Jun · Sep – Oct",
    country: "Greece",
    category: "Islands & Beaches",
    image: img("photo-1570077188670-e3a8d69ac5ff", 1600),
    imageAlt: "Whitewashed houses of Santorini overlooking the sea",
  },
  {
    id: "banff",
    badge: "Trending Now",
    name: "Banff, Canada",
    description:
      "Turquoise glacial lakes, pine forests and alpine drives through the heart of the Rockies.",
    bestTime: "Jun – Aug · Dec – Mar",
    country: "Canada",
    category: "Mountains & Nature",
    image: img("photo-1503614472-8c93d56e92ce", 1600),
    imageAlt: "Turquoise mountain lake surrounded by pine forest in Banff",
  },
  {
    id: "bali",
    badge: "Community Favourite",
    name: "Bali, Indonesia",
    description:
      "Rice terraces at dawn, surf breaks by noon and beach clubs as the sun dips into the ocean.",
    bestTime: "Apr – Oct",
    country: "Indonesia",
    category: "Beaches & Wellness",
    image: img("photo-1573790387438-4b9af101e344", 1600),
    imageAlt: "Rice terraces and palm trees in Bali, Indonesia",
  },
];

/* ── Destinations ─────────────────────────────────────────────── */

export const destinations: Destination[] = [
  { id: "kyoto", city: "Kyoto", country: "Japan", region: "asia", category: "cities", rating: 4.9, reviews: 12840, estimatedBudgetInr: 35000, description: "Temple gardens, geisha districts and kaiseki dining.", image: img("photo-1493976040374-85c8e12f0c0e"), imageAlt: "Kyoto pagoda with cherry blossoms" },
  { id: "tokyo", city: "Tokyo", country: "Japan", region: "asia", category: "cities", rating: 4.8, reviews: 22100, estimatedBudgetInr: 42000, description: "Neon nights, sushi counters and serene shrines.", image: img("photo-1540959733332-eab4deabeeaf"), imageAlt: "Tokyo skyline with Tokyo Tower" },
  { id: "bali-d", city: "Bali", country: "Indonesia", region: "asia", category: "beaches", rating: 4.8, reviews: 19430, estimatedBudgetInr: 28000, description: "Beach clubs, rice terraces and volcano sunrises.", image: img("photo-1573790387438-4b9af101e344"), imageAlt: "Bali rice terraces" },
  { id: "paris", city: "Paris", country: "France", region: "europe", category: "cities", rating: 4.9, reviews: 25300, estimatedBudgetInr: 48000, description: "Museums, riverside walks and patisserie mornings.", image: img("photo-1502602898657-3e91760cbb34"), imageAlt: "Eiffel Tower over Paris rooftops" },
  { id: "swiss-alps", city: "Interlaken", country: "Switzerland", region: "europe", category: "mountains", rating: 4.9, reviews: 9860, estimatedBudgetInr: 65000, description: "Postcard villages between two lakes and the Jungfrau.", image: img("photo-1531366936337-7c912a4589a7"), imageAlt: "Swiss Alps peaks above a green valley" },
  { id: "santorini-d", city: "Santorini", country: "Greece", region: "europe", category: "beaches", rating: 4.7, reviews: 11220, estimatedBudgetInr: 52000, description: "Caldera views, cliffside pools and golden hours.", image: img("photo-1570077188670-e3a8d69ac5ff"), imageAlt: "Santorini caldera view" },
  { id: "new-york", city: "New York", country: "United States", region: "north-america", category: "cities", rating: 4.8, reviews: 30150, estimatedBudgetInr: 85000, description: "Skyline walks, Broadway nights and bagel mornings.", image: img("photo-1496442226666-8d4d0e62e6e9"), imageAlt: "Manhattan Bridge framed between buildings" },
  { id: "banff-d", city: "Banff", country: "Canada", region: "north-america", category: "mountains", rating: 4.9, reviews: 8730, estimatedBudgetInr: 78000, description: "Glacial lakes and wildlife along the Icefields Parkway.", image: img("photo-1503614472-8c93d56e92ce"), imageAlt: "Moraine Lake in Banff National Park" },
  { id: "cusco", city: "Cusco", country: "Peru", region: "south-america", category: "adventure", rating: 4.8, reviews: 7640, estimatedBudgetInr: 58000, description: "Inca trails, Sacred Valley markets and high-altitude charm.", image: img("photo-1526392060635-9d6019884377"), imageAlt: "Machu Picchu terraces in the Andes" },
  { id: "patagonia", city: "Torres del Paine", country: "Chile", region: "south-america", category: "adventure", rating: 4.9, reviews: 4310, estimatedBudgetInr: 72000, description: "Granite towers, turquoise glaciers and epic treks.", image: img("photo-1508193638397-1c4234db14d8"), imageAlt: "Towers of Paine in Patagonia" },
  { id: "cape-town", city: "Cape Town", country: "South Africa", region: "africa", category: "trending", rating: 4.9, reviews: 10480, estimatedBudgetInr: 55000, description: "Table Mountain hikes, penguin beaches and wine lands.", image: img("photo-1580060839134-75a5edca2e99"), imageAlt: "Cape Town coast below Table Mountain" },
  { id: "marrakech", city: "Marrakech", country: "Morocco", region: "africa", category: "trending", rating: 4.7, reviews: 8920, estimatedBudgetInr: 38000, description: "Souk labyrinths, riad courtyards and mint tea evenings.", image: img("photo-1597212618440-806262de4f6b"), imageAlt: "Marrakech medina alley with lanterns" },
  { id: "serengeti", city: "Serengeti", country: "Tanzania", region: "africa", category: "adventure", rating: 5.0, reviews: 5240, estimatedBudgetInr: 120000, description: "Front-row seats to the great wildebeest migration.", image: img("photo-1516426122078-c23e76319801"), imageAlt: "Elephants on the savanna at sunset" },
  { id: "sydney", city: "Sydney", country: "Australia", region: "oceania", category: "cities", rating: 4.8, reviews: 14670, estimatedBudgetInr: 92000, description: "Harbour ferries, surf beaches and coastal cliff walks.", image: img("photo-1506973035872-a4ec16b8e8d9"), imageAlt: "Sydney Opera House and Harbour Bridge" },
  { id: "queenstown", city: "Queenstown", country: "New Zealand", region: "oceania", category: "adventure", rating: 4.9, reviews: 6890, estimatedBudgetInr: 88000, description: "Bungy origins, alpine lakes and Milford Sound day trips.", image: img("photo-1507699622108-4be3abd695ad"), imageAlt: "Queenstown lake surrounded by mountains" },
  { id: "great-barrier", city: "Cairns", country: "Australia", region: "oceania", category: "beaches", rating: 4.7, reviews: 7510, estimatedBudgetInr: 96000, description: "Snorkel the Great Barrier Reef from palm-fringed Cairns.", image: img("photo-1544551763-46a013bb70d5"), imageAlt: "Aerial view of a tropical reef" },
];

/* ── Trips ────────────────────────────────────────────────────── */

export const trips: Trip[] = [
  {
    id: "trip-japan",
    name: "Japan Adventure",
    destinations: ["Tokyo", "Kyoto", "Osaka"],
    country: "Japan",
    status: "ongoing",
    startDate: "Apr 12",
    endDate: "Apr 20",
    progress: 44,
    currentDay: { day: 4, of: 9 },
    budget: { spentInr: 28500, totalInr: 45000 },
    image: img("photo-1540959733332-eab4deabeeaf", 800),
    imageAlt: "Tokyo street at dusk",
  },
  {
    id: "trip-bali",
    name: "Bali Escape",
    destinations: ["Ubud", "Canggu"],
    country: "Indonesia",
    status: "upcoming",
    startDate: "Jun 12",
    endDate: "Jun 22",
    progress: 65,
    budget: { spentInr: 0, totalInr: 32000 },
    image: img("photo-1573790387438-4b9af101e344", 800),
    imageAlt: "Bali temple gates",
  },
  {
    id: "trip-paris",
    name: "Paris Weekend",
    destinations: ["Paris"],
    country: "France",
    status: "upcoming",
    startDate: "Jul 05",
    endDate: "Jul 08",
    progress: 30,
    budget: { spentInr: 0, totalInr: 52000 },
    image: img("photo-1502602898657-3e91760cbb34", 800),
    imageAlt: "Eiffel Tower at sunrise",
  },
];

/* ── Recent activity ──────────────────────────────────────────── */

export const recentActivity: ActivityEvent[] = [
  { id: "act-1", type: "trip-created", title: "Trip Created", description: "Japan Adventure — 3 cities, 9 days planned", timestamp: "2 hours ago" },
  { id: "act-2", type: "activity-added", title: "Activity Added", description: "Fushimi Inari Shrine added to Day 4 · Kyoto", timestamp: "Yesterday" },
  { id: "act-3", type: "itinerary-updated", title: "Itinerary Updated", description: "Reordered Day 2 stops in Tokyo — Shibuya now first", timestamp: "Yesterday" },
  { id: "act-4", type: "budget-updated", title: "Budget Updated", description: "Japan Adventure budget raised to ₹45,000", timestamp: "2 days ago" },
  { id: "act-5", type: "community-post", title: "Community Post Added", description: "You shared 'Kyoto on a budget' with 12 tips", timestamp: "4 days ago" },
];

/* ── Notifications ────────────────────────────────────────────── */

export const notifications: AppNotification[] = [
  { id: "n-1", type: "trip", title: "Flight price drop", description: "Delhi → Tokyo dropped ₹4,200 for your April dates.", timestamp: "1h ago", unread: true },
  { id: "n-2", type: "activity", title: "Itinerary reminder", description: "Day 4 of Japan Adventure starts tomorrow - review your plan.", timestamp: "6h ago", unread: true },
  { id: "n-3", type: "comment", title: "New community reply", description: "Maya replied to your Kyoto question.", timestamp: "1d ago", unread: false },
];

/* ── Insights ─────────────────────────────────────────────────── */

export const insights: Insight[] = [
  { id: "i-1", label: "Trips Completed", value: "6", trend: "+2 this year", trendDirection: "up" },
  { id: "i-2", label: "Cities Explored", value: "18", trend: "+3 this year", trendDirection: "up" },
  { id: "i-3", label: "Activities Completed", value: "94", trend: "+12 this quarter", trendDirection: "up" },
  { id: "i-4", label: "Total Travel Days", value: "112", trend: "+16 this year", trendDirection: "up" },
];

/* ── Quick actions ────────────────────────────────────────────── */

export const quickActions: QuickActionDef[] = [
  { id: "qa-create", title: "Create New Trip", description: "Start from a destination or a blank canvas", href: "/trips/create", emphasized: true },
  { id: "qa-explore", title: "Explore Cities", description: "Browse 120+ curated destinations", href: "/explore" },
  { id: "qa-activities", title: "Find Activities", description: "Tours, food & experiences nearby", href: "/explore" },
  { id: "qa-calendar", title: "View Calendar", description: "See every trip on one timeline", href: "/calendar" },
];

export const formatInr = (value: number): string =>
  `₹${value.toLocaleString("en-IN")}`;

/** Top destinations for a region tab. */
export function getRegionalPicks(regionId: Region["id"]): Destination[] {
  return destinations.filter((d) => d.region === regionId).slice(0, 3);
}

/* ── Regions ─────────────────────────────────────────────────── */

export const regions: Region[] = [
  { id: "asia", label: "Asia", blurb: "Ancient cultures, street food & neon cities" },
  { id: "europe", label: "Europe", blurb: "Alpine rails, old towns & café culture" },
  { id: "north-america", label: "North America", blurb: "Road trips, skylines & national parks" },
  { id: "south-america", label: "South America", blurb: "Andes trails, rainforest & rhythm" },
  { id: "africa", label: "Africa", blurb: "Safari plains, deserts & coastline" },
  { id: "oceania", label: "Oceania", blurb: "Reefs, surf coast & island time" },
];

/* ── Global search index ─────────────────────────────────────── */

const activitySuggestions = [
  { label: "Mountain Hiking", sublabel: "Trails, treks & summit views" },
  { label: "Street Food Tour", sublabel: "Local eats & night markets" },
  { label: "Temple & Heritage Walk", sublabel: "Culture, history & architecture" },
  { label: "Scuba Diving", sublabel: "Reefs & marine life" },
  { label: "Desert Safari", sublabel: "Dunes at golden hour" },
  { label: "Wine Tasting", sublabel: "Vineyards & cellar doors" },
  { label: "Hot Air Balloon Ride", sublabel: "Sunrise from above" },
  { label: "Local Cooking Class", sublabel: "Learn the regional cuisine" },
] as const;

export function getSearchItems(): SearchItem[] {
  return [
    ...destinations.map<SearchItem>((d) => ({
      id: `dest-${d.id}`,
      group: "Destinations",
      label: `${d.city}, ${d.country}`,
      sublabel: d.description,
      href: `/explore/destinations/${d.id}`,
    })),
    ...trips.map<SearchItem>((t) => ({
      id: `trip-${t.id}`,
      group: "Trips",
      label: t.name,
      sublabel: t.destinations.join(" · "),
      href: `/trips/${t.id}/itinerary`,
    })),
    ...activitySuggestions.map<SearchItem>((a) => ({
      id: `act-${a.label.toLowerCase().replace(/\s+/g, "-")}`,
      group: "Activities",
      label: a.label,
      sublabel: a.sublabel,
      href: "/explore",
    })),
  ];
}
