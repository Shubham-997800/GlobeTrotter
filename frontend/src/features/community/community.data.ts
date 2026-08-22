import type {
  CommunityPost,
  CommunityUser,
  PostComment,
  SharedTripSnapshot,
  TrendingDestination,
} from "./community.types";

/**
 * Seed data for the community module — mirrors the mock-first approach
 * of `trips.data.ts`. Photos reuse the project's Unsplash catalog IDs so
 * every image is already proven to load in this app.
 */

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

/* ── People ────────────────────────────────────────────────────── */

export const seedUsers: CommunityUser[] = [
  {
    id: "usr_demo_001",
    name: "Demo User",
    username: "demo_travels",
    bio: "Testing every corner of the globe, one itinerary at a time.",
    city: "Bengaluru",
    country: "India",
    tripsCount: 6,
    followersCount: 128,
    followingCount: 84,
  },
  {
    id: "usr_aiko",
    name: "Aiko Tanaka",
    username: "aiko_wanders",
    avatarUrl: img("photo-1494790108377-be9c29b29330", 200),
    bio: "Kyoto based. Chasing temple gardens and perfect ramen.",
    city: "Kyoto",
    country: "Japan",
    tripsCount: 24,
    followersCount: 3421,
    followingCount: 311,
  },
  {
    id: "usr_marco",
    name: "Marco Bianchi",
    username: "marco_on_foot",
    avatarUrl: img("photo-1507003211169-0a1dd7228f2d", 200),
    bio: "Slow walker, fast learner. 40+ cities without a checklist.",
    city: "Rome",
    country: "Italy",
    tripsCount: 41,
    followersCount: 5210,
    followingCount: 198,
  },
  {
    id: "usr_priya",
    name: "Priya Nair",
    username: "priya.roams",
    avatarUrl: img("photo-1438761681033-6461ffad8d80", 200),
    bio: "Street food first, landmarks later. Kerala → everywhere.",
    city: "Kochi",
    country: "India",
    tripsCount: 18,
    followersCount: 1890,
    followingCount: 240,
  },
  {
    id: "usr_elena",
    name: "Elena Petrova",
    username: "elena_offgrid",
    avatarUrl: img("photo-1544005313-94ddf0286df2", 200),
    bio: "Mountains over malls. Documenting trails across the Balkans.",
    city: "Sofia",
    country: "Bulgaria",
    tripsCount: 33,
    followersCount: 2745,
    followingCount: 410,
  },
  {
    id: "usr_sam",
    name: "Sam Carter",
    username: "sam.transit",
    avatarUrl: img("photo-1500648767791-00dcc994a43e", 200),
    bio: "Aviation geek. I review airports so you don't have to.",
    city: "Singapore",
    country: "Singapore",
    tripsCount: 52,
    followersCount: 6890,
    followingCount: 122,
  },
];

export const currentUserFromSeed: CommunityUser = seedUsers[0];

/* ── Shared trip snapshot (reused by feed + share flow previews) ── */

const kyotoSnapshot: SharedTripSnapshot = {
  tripId: "trip_kyoto_demo",
  name: "Kyoto in Slow Motion",
  coverImage: img("photo-1493976040374-85c8e12f0c0e"),
  destinationLabel: "Kyoto, Japan",
  startDate: "2026-04-02",
  endDate: "2026-04-08",
  activitiesCount: 14,
};

const baliSnapshot: SharedTripSnapshot = {
  tripId: "trip_bali_demo",
  name: "Bali Rice Fields & Reefs",
  coverImage: img("photo-1537996194471-e657df975ab4"),
  destinationLabel: "Ubud, Indonesia",
  startDate: "2026-06-11",
  endDate: "2026-06-19",
  activitiesCount: 11,
};

const parisSnapshot: SharedTripSnapshot = {
  tripId: "trip_paris_demo",
  name: "Paris on Foot",
  coverImage: img("photo-1502602898657-3e91760cbb34"),
  destinationLabel: "Paris, France",
  startDate: "2026-05-05",
  endDate: "2026-05-09",
  activitiesCount: 9,
};

/* ── Posts ─────────────────────────────────────────────────────── */

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const seedPosts: CommunityPost[] = [
  {
    id: "post_seed_001",
    kind: "shared-trip",
    author: seedUsers[1],
    content:
      "Seven days in Kyoto without rushing a single morning. We built the whole plan around temple gardens at opening time — here is the exact itinerary, day by day.",
    media: [],
    locationName: "Kyoto, Japan",
    tags: ["Culture", "Nature"],
    privacy: "public",
    createdAt: minutesAgo(42),
    likedByMe: false,
    likesCount: 214,
    savedByMe: false,
    commentsCount: 3,
    commentsEnabled: true,
    sharedTrip: kyotoSnapshot,
    shareNote:
      "Copied straight into GlobeTrotter — tweak the dates and it recalculates every day for you.",
  },
  {
    id: "post_seed_002",
    kind: "story",
    author: seedUsers[2],
    content:
      "Trastevere at 7am is a different city. The market stalls were still setting up, espresso cost €1.20, and for twenty minutes the famous steps were completely mine.\n\nLesson learned after 40+ cities: the postcard view belongs to whoever shows up before breakfast.",
    media: [
      { id: "m1", url: img("photo-1531366936337-7c912a4589a7"), alt: "Morning light over Roman rooftops" },
      { id: "m2", url: img("photo-1512453979798-5ea266f8880c"), alt: "Quiet cobblestone alley in Rome" },
      { id: "m3", url: img("photo-1528360983277-13d401cdc186"), alt: "Espresso on a marble counter" },
    ],
    locationName: "Rome, Italy",
    tags: ["Culture", "Food"],
    privacy: "public",
    createdAt: minutesAgo(180),
    likedByMe: true,
    likesCount: 87,
    savedByMe: false,
    commentsCount: 2,
    commentsEnabled: true,
  },
  {
    id: "post_seed_003",
    kind: "shared-trip",
    author: seedUsers[3],
    content:
      "Shared the Bali plan everyone keeps asking about — rice terraces at sunrise, reef snorkelling, and the warung list that made the trip.",
    media: [],
    locationName: "Ubud, Indonesia",
    tags: ["Nature", "Adventure", "Food"],
    privacy: "public",
    createdAt: minutesAgo(60 * 26),
    likedByMe: false,
    likesCount: 156,
    savedByMe: true,
    commentsCount: 0,
    commentsEnabled: true,
    sharedTrip: baliSnapshot,
  },
  {
    id: "post_seed_004",
    kind: "story",
    author: seedUsers[4],
    content:
      "Rila Lakes route update: the hut between the second and seventh lake now takes card payments, but bring cash for the shepherd's banitsa — worth every stotinka.\n\nFull packing list for shoulder season in the comments.",
    media: [{ id: "m1", url: img("photo-1506973035872-a4ec16b8e8d9"), alt: "Glacial lakes seen from a ridge trail" }],
    locationName: "Rila Mountains, Bulgaria",
    tags: ["Adventure", "Nature"],
    privacy: "public",
    createdAt: minutesAgo(60 * 30),
    likedByMe: false,
    likesCount: 64,
    savedByMe: false,
    commentsCount: 1,
    commentsEnabled: true,
  },
  {
    id: "post_seed_005",
    kind: "story",
    author: seedUsers[5],
    content:
      "Changi's new T5 satellite wing has a free 2-hour layover tour every hour on the :15. You clear immigration twice, which sounds awful, works fine, and gets you real bak kut teh between flights.",
    media: [{ id: "m1", url: img("photo-1526491109672-74740652b963"), alt: "Airport terminal interior with glass facade" }],
    locationName: "Changi Airport, Singapore",
    tags: ["Adventure"],
    privacy: "public",
    createdAt: minutesAgo(60 * 50),
    likedByMe: false,
    likesCount: 39,
    savedByMe: false,
    commentsCount: 0,
    commentsEnabled: true,
  },
  {
    id: "post_seed_006",
    kind: "shared-trip",
    author: seedUsers[2],
    content: "Four Paris days built entirely around bakeries and museums that are empty before 10am. Steal it.",
    media: [],
    locationName: "Paris, France",
    tags: ["Food", "Culture"],
    privacy: "public",
    createdAt: minutesAgo(60 * 74),
    likedByMe: false,
    likesCount: 98,
    savedByMe: false,
    commentsCount: 0,
    commentsEnabled: true,
    sharedTrip: parisSnapshot,
  },
];

/* ── Comments ──────────────────────────────────────────────────── */

export const seedComments: PostComment[] = [
  {
    id: "cmt_seed_001",
    postId: "post_seed_001",
    author: seedUsers[3],
    content: "Copying this immediately. Did you book Fushimi Inari before sunrise or was it quiet enough at 8?",
    createdAt: minutesAgo(30),
    likedByMe: false,
    likesCount: 12,
  },
  {
    id: "cmt_seed_002",
    postId: "post_seed_001",
    author: seedUsers[1],
    content: "@priya.roams 7:30 arrival was perfect — tour groups land around 9. Day 4 has the timing notes.",
    createdAt: minutesAgo(22),
    parentCommentId: "cmt_seed_001",
    likedByMe: false,
    likesCount: 5,
  },
  {
    id: "cmt_seed_003",
    postId: "post_seed_001",
    author: seedUsers[5],
    content: "The Philosopher's Path segment alone is worth the copy. Great build.",
    createdAt: minutesAgo(8),
    likedByMe: false,
    likesCount: 2,
  },
  {
    id: "cmt_seed_004",
    postId: "post_seed_002",
    author: seedUsers[4],
    content: "\"Before breakfast\" is the whole travel manifesto honestly.",
    createdAt: minutesAgo(150),
    likedByMe: false,
    likesCount: 9,
  },
  {
    id: "cmt_seed_005",
    postId: "post_seed_002",
    author: seedUsers[0],
    content: "Adding the market to my Rome draft right now.",
    createdAt: minutesAgo(90),
    likedByMe: false,
    likesCount: 1,
  },
  {
    id: "cmt_seed_006",
    postId: "post_seed_004",
    author: seedUsers[2],
    content: "Cash for banitsa — the real travel tip of the year.",
    createdAt: minutesAgo(60 * 28),
    likedByMe: false,
    likesCount: 4,
  },
];

/* ── Trending (derived server-side in a real backend) ──────────── */

export const seedTrendingDestinations: TrendingDestination[] = [
  { id: "dest-kyoto", city: "Kyoto", country: "Japan", image: img("photo-1493976040374-85c8e12f0c0e", 600), imageAlt: "Kyoto pagoda", postsCount: 412 },
  { id: "dest-paris", city: "Paris", country: "France", image: img("photo-1502602898657-3e91760cbb34", 600), imageAlt: "Paris skyline", postsCount: 387 },
  { id: "dest-bali-d", city: "Bali", country: "Indonesia", image: img("photo-1537996194471-e657df975ab4", 600), imageAlt: "Bali rice terrace", postsCount: 355 },
  { id: "dest-rome", city: "Rome", country: "Italy", image: img("photo-1531366936337-7c912a4589a7", 600), imageAlt: "Roman forum", postsCount: 298 },
  { id: "dest-santorini", city: "Santorini", country: "Greece", image: img("photo-1613395877344-13d4a8e0d49e", 600), imageAlt: "Santorini caldera", postsCount: 264 },
];

/** Dynamic tag counts are computed from live posts; these seed the rest. */
export const seedTagCounts: Record<string, number> = {
  Travel: 1284,
  Adventure: 980,
  Food: 861,
  Nature: 743,
  Culture: 655,
};
