import type {
  ActivityEvent,
  AppNotification,
  Destination,
  FeaturedSlide,
  Insight,
  QuickActionDef,
  Region,
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
    image: img("photo-1613395877344-13d4a8e0d49e", 1600),
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
    image: img("photo-1609825488888-3a766db05542", 1600),
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
    image: img("photo-1537996194471-e657df975ab4", 1600),
    imageAlt: "Rice terraces and palm trees in Bali, Indonesia",
  },
];

/* ── Regions ─────────────────────────────────────────────────── */

export const regions: Region[] = [
  { id: "asia", label: "Asia", blurb: "Ancient cultures, street food & neon cities" },
  { id: "europe", label: "Europe", blurb: "Alpine rails, old towns & café culture" },
  { id: "north-america", label: "North America", blurb: "Road trips, skylines & national parks" },
  { id: "south-america", label: "South America", blurb: "Andes trails, rainforest & rhythm" },
  { id: "africa", label: "Africa", blurb: "Safari plains, deserts & coastline" },
  { id: "oceania", label: "Oceania", blurb: "Reefs, surf coast & island time" },
];
