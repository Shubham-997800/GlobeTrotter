/**
 * Community domain types — server-shaped records for the travel
 * community feed. Kept separate from UI so the mock service can be
 * swapped for a real API without touching any component.
 */

/** Preset topic tags shown in the composer; custom tags are free-form. */
export const COMMUNITY_TAGS = [
  "Adventure",
  "Food",
  "Nature",
  "Culture",
] as const;

export type CommunityTag = (typeof COMMUNITY_TAGS)[number];

export type PostPrivacy = "public" | "private";

/** A community member — denormalized author snapshot on every post. */
export interface CommunityUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  country?: string;
  tripsCount: number;
  followersCount: number;
  followingCount: number;
}

/** Snapshot of a trip embedded in a shared-trip post. */
export interface SharedTripSnapshot {
  tripId: string;
  name: string;
  coverImage?: string;
  destinationLabel: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  activitiesCount: number;
}

export interface PostMediaItem {
  id: string;
  url: string;
  alt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  author: CommunityUser;
  content: string;
  createdAt: string; // ISO timestamp
  /** Set when the comment replies to another comment (one level deep). */
  parentCommentId?: string;
  likedByMe: boolean;
  likesCount: number;
}

/**
 * Feed post. `kind` distinguishes a plain story from an imported trip
 * so cards can render the right body without union-guessing.
 */
export interface CommunityPost {
  id: string;
  kind: "story" | "shared-trip";
  author: CommunityUser;
  content: string;
  media: PostMediaItem[];
  locationName?: string;
  tags: string[];
  privacy: PostPrivacy;
  createdAt: string; // ISO timestamp
  updatedAt?: string;
  likedByMe: boolean;
  likesCount: number;
  savedByMe: boolean;
  commentsCount: number;
  commentsEnabled: boolean;
  /** Present only when `kind === "shared-trip"`. */
  sharedTrip?: SharedTripSnapshot;
  /** Optional description added while sharing a trip. */
  shareNote?: string;
}

/* ── Composer payloads ─────────────────────────────────────────── */

export interface CreatePostPayload {
  content: string;
  media: { url: string; alt: string }[];
  locationName?: string;
  tags: string[];
  privacy: PostPrivacy;
}

export interface ShareTripPayload {
  tripId: string;
  content: string;
  privacy: PostPrivacy;
}

export interface CreateCommentPayload {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export type ReportReason =
  | "spam"
  | "inappropriate"
  | "harassment"
  | "other";

export interface ReportPostPayload {
  postId: string;
  reason: ReportReason;
  details?: string;
}

/* ── Discovery ─────────────────────────────────────────────────── */

export interface TrendingDestination {
  id: string;
  city: string;
  country: string;
  image?: string;
  imageAlt?: string;
  postsCount: number;
}

export interface TrendingTag {
  tag: string;
  postsCount: number;
}

export type FeedTabId =
  | "for-you"
  | "following"
  | "trending"
  | "trips"
  | "saved";

/* ── Search ────────────────────────────────────────────────────── */

export type CommunitySearchScope = "posts" | "people" | "trips" | "destinations";

export interface CommunitySearchResults {
  posts: CommunityPost[];
  people: CommunityUser[];
  trips: CommunityPost[];
  destinations: TrendingDestination[];
}
