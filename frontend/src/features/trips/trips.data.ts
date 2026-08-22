import type {
  ActivitySuggestion,
  BudgetTierDef,
  Currency,
  Destination,
  InterestDef,
} from "./trips.types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

/* ── Interests ────────────────────────────────────────────────── */

export const interestCatalog: InterestDef[] = [
  { id: "adventure", label: "Adventure" },
  { id: "nature", label: "Nature" },
  { id: "food", label: "Food" },
  { id: "culture", label: "Culture" },
  { id: "history", label: "History" },
  { id: "beaches", label: "Beaches" },
  { id: "mountains", label: "Mountains" },
  { id: "nightlife", label: "Nightlife" },
  { id: "shopping", label: "Shopping" },
  { id: "relaxation", label: "Relaxation" },
];

export function interestLabel(id: string): string {
  return interestCatalog.find((interest) => interest.id === id)?.label ?? id;
}

/* ── Currencies ───────────────────────────────────────────────── */

/**
 * Demo-only static rates relative to the catalog base currency (INR).
 * A real backend must own FX conversion — never ship live rates here.
 */
export const currencies: Currency[] = [
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
];

/** Multiplies an INR amount into the target currency (demo rates). */
export const demoRateFromInr: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  JPY: 1.87,
};

export function currencySymbol(code: string): string {
  return currencies.find((currency) => currency.code === code)?.symbol ?? "";
}

/* ── Budget tiers ─────────────────────────────────────────────── */

export const budgetTiers: BudgetTierDef[] = [
  {
    id: "budget",
    label: "Budget Trip",
    description: "Hostels, street food and public transport.",
    costMultiplier: 0.6,
    split: { stay: 30, transport: 22, activities: 20, food: 20, other: 8 },
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Comfortable stays with a few splurges.",
    costMultiplier: 1,
    split: { stay: 38, transport: 18, activities: 18, food: 18, other: 8 },
  },
  {
    id: "premium",
    label: "Premium",
    description: "Boutique stays, fine dining and private tours.",
    costMultiplier: 1.8,
    split: { stay: 45, transport: 15, activities: 16, food: 16, other: 8 },
  },
  {
    id: "custom",
    label: "Custom",
    description: "Set your own total and split later.",
    costMultiplier: null,
    split: { stay: 40, transport: 18, activities: 17, food: 17, other: 8 },
  },
];

export function budgetTier(id: string): BudgetTierDef {
  return (
    budgetTiers.find((tier) => tier.id === id) ??
    budgetTiers.find((tier) => tier.id === "custom")!
  );
}

/* ── Destinations ─────────────────────────────────────────────── */

export const destinations: Destination[] = [
  {
    id: "kyoto",
    city: "Kyoto",
    country: "Japan",
    description: "Temple gardens, tea houses and lantern-lit lanes.",
    image: img("photo-1493976040374-85c8e12f0c0e", 800),
    imageAlt: "Pagoda and cherry blossoms in Kyoto",
    rating: 4.9,
    reviews: 12840,
    estimatedDailyCostInr: 8500,
    tags: ["culture", "history", "food", "nature"],
  },
  {
    id: "bali",
    city: "Bali",
    country: "Indonesia",
    description: "Beach clubs, rice terraces and volcano sunrises.",
    image: img("photo-1537996194471-e657df975ab4", 800),
    imageAlt: "Rice terraces and palm trees in Bali",
    rating: 4.8,
    reviews: 19430,
    estimatedDailyCostInr: 4200,
    tags: ["beaches", "relaxation", "nature", "nightlife"],
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    description: "Museums, riverside walks and patisserie mornings.",
    image: img("photo-1502602898657-3e91760cbb34", 800),
    imageAlt: "Eiffel Tower over Paris rooftops",
    rating: 4.9,
    reviews: 25300,
    estimatedDailyCostInr: 11500,
    tags: ["culture", "food", "shopping", "history"],
  },
  {
    id: "interlaken",
    city: "Interlaken",
    country: "Switzerland",
    description: "Postcard villages between two lakes and the Jungfrau.",
    image: img("photo-1531366936337-7c912a4589a7", 800),
    imageAlt: "Swiss Alps peaks above a green valley",
    rating: 4.9,
    reviews: 9860,
    estimatedDailyCostInr: 15500,
    tags: ["mountains", "adventure", "nature", "relaxation"],
  },
  {
    id: "santorini",
    city: "Santorini",
    country: "Greece",
    description: "Caldera views, cliffside pools and golden hours.",
    image: img("photo-1613395877344-13d4a8e0d49e", 800),
    imageAlt: "Whitewashed houses of Santorini overlooking the sea",
    rating: 4.7,
    reviews: 11220,
    estimatedDailyCostInr: 12500,
    tags: ["beaches", "relaxation", "food", "nightlife"],
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    description: "Neon nights, sushi counters and serene shrines.",
    image: img("photo-1540959733332-eab4deabeeaf", 800),
    imageAlt: "Tokyo skyline with Tokyo Tower",
    rating: 4.8,
    reviews: 22100,
    estimatedDailyCostInr: 10200,
    tags: ["nightlife", "food", "shopping", "culture"],
  },
  {
    id: "banff",
    city: "Banff",
    country: "Canada",
    description: "Glacial lakes and wildlife along the Icefields Parkway.",
    image: img("photo-1609825488888-3a766db05542", 800),
    imageAlt: "Moraine Lake in Banff National Park",
    rating: 4.9,
    reviews: 8730,
    estimatedDailyCostInr: 13800,
    tags: ["mountains", "adventure", "nature"],
  },
  {
    id: "cusco",
    city: "Cusco",
    country: "Peru",
    description: "Inca trails, Sacred Valley markets and high-altitude charm.",
    image: img("photo-1526392060635-9d6019884377", 800),
    imageAlt: "Machu Picchu terraces in the Andes",
    rating: 4.8,
    reviews: 7640,
    estimatedDailyCostInr: 6800,
    tags: ["history", "adventure", "nature"],
  },
  {
    id: "cape-town",
    city: "Cape Town",
    country: "South Africa",
    description: "Table Mountain hikes, penguin beaches and wine lands.",
    image: img("photo-1580060839134-75a5edca2e99", 800),
    imageAlt: "Cape Town coast below Table Mountain",
    rating: 4.9,
    reviews: 10480,
    estimatedDailyCostInr: 7200,
    tags: ["nature", "adventure", "beaches", "food"],
  },
  {
    id: "marrakech",
    city: "Marrakech",
    country: "Morocco",
    description: "Souk labyrinths, riad courtyards and mint tea evenings.",
    image: img("photo-1597212618440-806262de4f6b", 800),
    imageAlt: "Marrakech medina alley with lanterns",
    rating: 4.7,
    reviews: 8920,
    estimatedDailyCostInr: 5600,
    tags: ["culture", "shopping", "food", "history"],
  },
  {
    id: "queenstown",
    city: "Queenstown",
    country: "New Zealand",
    description: "Bungy origins, alpine lakes and Milford Sound day trips.",
    image: img("photo-1507699622108-4be3abd695ad", 800),
    imageAlt: "Queenstown lake surrounded by mountains",
    rating: 4.9,
    reviews: 6890,
    estimatedDailyCostInr: 11200,
    tags: ["adventure", "mountains", "nature"],
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "UAE",
    description: "Desert thrills, futuristic skylines and endless malls.",
    image: img("photo-1512453979798-5ea266f8880c", 800),
    imageAlt: "The Dubai skyline and its illuminated towers at night",
    rating: 4.7,
    reviews: 15630,
    estimatedDailyCostInr: 13500,
    tags: ["shopping", "nightlife", "beaches", "food"],
  },
];

/* ── Activities ───────────────────────────────────────────────── */

export const activities: ActivitySuggestion[] = [
  {
    id: "act-kimono-tea",
    name: "Tea Ceremony & Gion Walk",
    city: "Kyoto",
    country: "Japan",
    category: "culture",
    durationHours: 3,
    costInr: 4200,
    description: "A guided tea ceremony followed by the geisha district at dusk.",
    image: img("photo-1528360983277-13d401cdc186", 600),
    imageAlt: "Lantern-lit street in the Gion district of Kyoto",
  },
  {
    id: "act-bali-surf",
    name: "Sunrise Surf Lesson",
    city: "Bali",
    country: "Indonesia",
    category: "adventure",
    durationHours: 2,
    costInr: 1800,
    description: "Beginner-friendly breaks with local instructors at Kuta Beach.",
    image: img("photo-1537996194471-e657df975ab4", 600),
    imageAlt: "Surfers riding a wave at sunrise in Bali",
  },
  {
    id: "act-paris-market",
    name: "Marché Food Crawl",
    city: "Paris",
    country: "France",
    category: "food",
    durationHours: 4,
    costInr: 6500,
    description: "Fromagerie, boulangerie and wine stops across Le Marais.",
    image: img("photo-1502602898657-3e91760cbb34", 600),
    imageAlt: "Cheese stall at a Parisian street market",
  },
  {
    id: "act-alps-hike",
    name: "Jungfrau Alpine Trail",
    city: "Interlaken",
    country: "Switzerland",
    category: "adventure",
    durationHours: 6,
    costInr: 3800,
    description: "Lake-to-lake ridge hike with postcard views the whole way.",
    image: img("photo-1531366936337-7c912a4589a7", 600),
    imageAlt: "Hiker on an alpine trail above Interlaken",
  },
  {
        id: "act-santorini-sail",
    name: "Caldera Sunset Sail",
    city: "Santorini",
    country: "Greece",
    category: "nature",
    durationHours: 5,
    costInr: 8900,
    description: "Catamaran cruise past volcanic coves with dinner on deck.",
    image: img("photo-1613395877344-13d4a8e0d49e", 600),
    imageAlt: "Catamaran sailing below the Santorini caldera",
  },
  {
    id: "act-banff-canoe",
    name: "Moraine Lake Canoeing",
    city: "Banff",
    country: "Canada",
    category: "nature",
    durationHours: 2,
    costInr: 5200,
    description: "Paddle turquoise water beneath the Ten Peaks at first light.",
    image: img("photo-1609825488888-3a766db05542", 600),
    imageAlt: "Canoe on Moraine Lake surrounded by peaks",
  },
  {
    id: "act-marrakech-souks",
    name: "Medina Souks Workshop",
    city: "Marrakech",
    country: "Morocco",
    category: "culture",
    durationHours: 3,
    costInr: 2400,
    description: "Haggle like a local, then try a leather-craft workshop.",
    image: img("photo-1597212618440-806262de4f6b", 600),
    imageAlt: "Colorful lanterns inside a Marrakech souk",
  },
  {
    id: "act-tokyo-night",
    name: "Shibuya Food & Neon Tour",
    city: "Tokyo",
    country: "Japan",
    category: "food",
    durationHours: 4,
    costInr: 7100,
    description: "Izakaya hopping through the world's busiest crossing.",
    image: img("photo-1540959733332-eab4deabeeaf", 600),
    imageAlt: "Neon signs glowing over a Tokyo street at night",
  },
  {
    id: "act-cape-peninsula",
    name: "Cape Peninsula Road Trip",
    city: "Cape Town",
    country: "South Africa",
    category: "nature",
    durationHours: 8,
    costInr: 6400,
    description: "Chapman's Peak, penguin beaches and Cape Point cliffs.",
    image: img("photo-1580060839134-75a5edca2e99", 600),
    imageAlt: "Coastal road winding below Table Mountain",
  },
  {
    id: "act-dubai-desert",
    name: "Red Dunes Desert Safari",
    city: "Dubai",
    country: "UAE",
    category: "adventure",
    durationHours: 6,
    costInr: 5800,
    description: "Dune bashing, camel rides and a Bedouin-style dinner camp.",
    image: img("photo-1512453979798-5ea266f8880c", 600),
    imageAlt: "4x4 vehicles on red desert dunes near Dubai",
  },
];
