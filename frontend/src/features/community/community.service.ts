import { tripsService } from "@/features/trips/trips.service";
import { destinations } from "@/features/trips/trips.data";
import type { TripRecord } from "@/features/trips/trips.types";
import {
  currentUserFromSeed,
  seedComments,
  seedPosts,
  seedTagCounts,
  seedTrendingDestinations,
  seedUsers,
} from "./community.data";
import type {
  CommunityPost,
  CommunitySearchResults,
  CommunityUser,
  CreateCommentPayload,
  CreatePostPayload,
  FeedTabId,
  PostComment,
  ReportPostPayload,
  ShareTripPayload,
  TrendingDestination,
  TrendingTag,
} from "./community.types";

/**
 * Mock community service — the ONLY place with fake social logic.
 *
 * Swapping to a real backend (the contract the components already use):
 *   getFeed(tab, page)      → GET /api/community/feed?tab=&page=
 *   createPost(payload)     → POST /api/community/posts
 *   updatePost(id, payload) → PATCH /api/community/posts/:id
 *   deletePost(id)          → DELETE /api/community/posts/:id
 *   toggleLike(id)          → POST   /api/community/posts/:id/like
 *   toggleSave(id)          → POST   /api/community/posts/:id/save
 *   listSavedPosts()        → GET  /api/community/posts/saved
 *   listComments(postId)    → GET  /api/community/posts/:id/comments
 *   addComment(payload)     → POST /api/community/posts/:id/comments
 *   likeComment(commentId)  → POST /api/community/comments/:id/like
 *   shareTrip(payload)      → POST /api/community/share-trip
 *   getTrending()           → GET /api/community/trending
 *   search(q, scope)        → GET /api/community/search?q=&scope=
 *   toggleFollow(userId)    → POST /api/users/:id/follow
 *   reportPost(payload)     → POST /api/community/report
 *   drafts                  → stored server-side per user
 *
 * Until then everything lives in localStorage, mirroring the auth and
 * trips services. Delete the mock bodies and keep the exported shape.
 */

const FEED_LATENCY_MS = 450;
const MUTATION_LATENCY_MS = 700;

const POSTS_KEY = "globetrotter.community.posts";
const COMMENTS_KEY = "globetrotter.community.comments";
const FOLLOWS_KEY = "globetrotter.community.follows";
const DRAFT_KEY = "globetrotter.community.post-draft";

/** Seed follows so the Following tab is alive on first visit. */
const SEED_FOLLOWING_IDS = ["usr_aiko", "usr_marco", "usr_priya"];

export const COMMUNITY_PAGE_SIZE = 4;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — mock only
  }
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/* ── Store accessors ───────────────────────────────────────────── */

function readPosts(): CommunityPost[] {
  return readJson<CommunityPost[]>(POSTS_KEY, seedPosts);
}

function writePosts(posts: CommunityPost[]): void {
  writeJson(POSTS_KEY, posts);
}

function readComments(): PostComment[] {
  return readJson<PostComment[]>(COMMENTS_KEY, seedComments);
}

function writeComments(comments: PostComment[]): void {
  writeJson(COMMENTS_KEY, comments);
}

function readFollowing(): string[] {
  const stored = readJson<string[] | null>(FOLLOWS_KEY, null);
  return stored ?? SEED_FOLLOWING_IDS;
}

/* ── Helpers ───────────────────────────────────────────────────── */

export function engagementScore(post: CommunityPost): number {
  return post.likesCount + post.commentsCount * 3 + (post.savedByMe ? 5 : 0);
}

function sortForTab(posts: CommunityPost[], tab: FeedTabId): CommunityPost[] {
  const sorted = [...posts];
  switch (tab) {
    case "trending":
      return sorted.sort((a, b) => engagementScore(b) - engagementScore(a));
    default:
      return sorted.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
  }
}

async function buildSharedTripSnapshot(
  tripId: string,
): Promise<NonNullable<CommunityPost["sharedTrip"]>> {
  const trip = await tripsService.getTrip(tripId);
  if (!trip) throw new Error("Trip not found.");
  return snapshotFromTrip(trip);
}

/** Maps a stored trip record onto the denormalized post embed. */
export function snapshotFromTrip(
  trip: TripRecord,
): NonNullable<CommunityPost["sharedTrip"]> {
  const destination = destinations.find((d) => d.id === trip.destinationId);
  return {
    tripId: trip.id,
    name: trip.name,
    coverImage: trip.coverImage ?? destination?.image,
    destinationLabel: destination
      ? `${destination.city}, ${destination.country}`
      : "Somewhere wonderful",
    startDate: trip.startDate,
    endDate: trip.endDate,
    activitiesCount: trip.activityIds?.length ?? 0,
  };
}

/* ── Service ───────────────────────────────────────────────────── */

export interface FeedPage {
  posts: CommunityPost[];
  hasMore: boolean;
  total: number;
}

export interface TrendingBundle {
  destinations: TrendingDestination[];
  tags: TrendingTag[];
  travelers: CommunityUser[];
}

export const communityService = {
  /** Feed for one tab, one page at a time (`hasMore` drives Load More). */
  async getFeed(tab: FeedTabId, page: number, viewerId: string): Promise<FeedPage> {
    await delay(FEED_LATENCY_MS);
    const following = new Set(readFollowing());
    const posts = readPosts().filter((post) => {
      if (post.privacy === "private" && post.author.id !== viewerId) return false;
      switch (tab) {
        case "following":
          return following.has(post.author.id);
        case "trips":
          return post.kind === "shared-trip";
        case "saved":
          return post.savedByMe;
        default:
          return true;
      }
    });
    const sorted = sortForTab(posts, tab);
    const start = page * COMMUNITY_PAGE_SIZE;
    return {
      posts: sorted.slice(start, start + COMMUNITY_PAGE_SIZE),
      hasMore: start + COMMUNITY_PAGE_SIZE < sorted.length,
      total: sorted.length,
    };
  },

  async listSavedPosts(): Promise<CommunityPost[]> {
    await delay(FEED_LATENCY_MS);
    return readPosts()
      .filter((post) => post.savedByMe)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async getUser(userId: string): Promise<CommunityUser | null> {
    await delay(200);
    return (
      readPosts()
        .map((post) => post.author)
        .find((user) => user.id === userId) ??
      seedUsers.find((user) => user.id === userId) ??
      null
    );
  },

  async createPost(
    payload: CreatePostPayload,
    author: CommunityUser,
  ): Promise<CommunityPost> {
    await delay(MUTATION_LATENCY_MS);
    const post: CommunityPost = {
      id: newId("post"),
      kind: "story",
      author,
      content: payload.content.trim(),
      media: payload.media.map((item, index) => ({
        id: newId("media"),
        url: item.url,
        alt: item.alt || `Post image ${index + 1}`,
      })),
      locationName: payload.locationName?.trim() || undefined,
      tags: payload.tags,
      privacy: payload.privacy,
      createdAt: new Date().toISOString(),
      likedByMe: false,
      likesCount: 0,
      savedByMe: false,
      commentsCount: 0,
      commentsEnabled: true,
    };
    writePosts([post, ...readPosts()]);
    return post;
  },

  async updatePost(
    postId: string,
    payload: CreatePostPayload,
  ): Promise<CommunityPost> {
    await delay(MUTATION_LATENCY_MS);
    const posts = readPosts();
    const index = posts.findIndex((post) => post.id === postId);
    if (index === -1) throw new Error("Post not found.");
    const updated: CommunityPost = {
      ...posts[index],
      content: payload.content.trim(),
      media: payload.media.map((item, i) => ({
        id: posts[index].media[i]?.id ?? newId("media"),
        url: item.url,
        alt: item.alt || `Post image ${i + 1}`,
      })),
      locationName: payload.locationName?.trim() || undefined,
      tags: payload.tags,
      privacy: payload.privacy,
      updatedAt: new Date().toISOString(),
    };
    posts[index] = updated;
    writePosts(posts);
    return updated;
  },

  async deletePost(postId: string): Promise<void> {
    await delay(MUTATION_LATENCY_MS);
    writePosts(readPosts().filter((post) => post.id !== postId));
    writeComments(readComments().filter((c) => c.postId !== postId));
  },

  /** Optimistic-friendly toggle — returns the fresh counters. */
  async toggleLike(postId: string): Promise<{ liked: boolean; count: number }> {
    await delay(250);
    const posts = readPosts();
    const index = posts.findIndex((post) => post.id === postId);
    if (index === -1) throw new Error("Post not found.");
    const liked = !posts[index].likedByMe;
    posts[index] = {
      ...posts[index],
      likedByMe: liked,
      likesCount: Math.max(0, posts[index].likesCount + (liked ? 1 : -1)),
    };
    writePosts(posts);
    return { liked, count: posts[index].likesCount };
  },

  async toggleSave(postId: string): Promise<{ saved: boolean }> {
    await delay(300);
    const posts = readPosts();
    const index = posts.findIndex((post) => post.id === postId);
    if (index === -1) throw new Error("Post not found.");
    posts[index] = { ...posts[index], savedByMe: !posts[index].savedByMe };
    writePosts(posts);
    return { saved: posts[index].savedByMe };
  },

  /* ── Comments ─────────────────────────────────────────────── */

  async listComments(postId: string): Promise<PostComment[]> {
    await delay(FEED_LATENCY_MS);
    return readComments()
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async addComment(
    payload: CreateCommentPayload,
    author: CommunityUser,
  ): Promise<PostComment> {
    await delay(MUTATION_LATENCY_MS);
    const posts = readPosts();
    const postIndex = posts.findIndex((post) => post.id === payload.postId);
    if (postIndex === -1) throw new Error("Post not found.");
    const comment: PostComment = {
      id: newId("cmt"),
      postId: payload.postId,
      author,
      content: payload.content.trim(),
      createdAt: new Date().toISOString(),
      parentCommentId: payload.parentCommentId,
      likedByMe: false,
      likesCount: 0,
    };
    writeComments([comment, ...readComments()]);
    posts[postIndex] = {
      ...posts[postIndex],
      commentsCount: posts[postIndex].commentsCount + 1,
    };
    writePosts(posts);
    return comment;
  },

  async deleteComment(commentId: string): Promise<void> {
    await delay(MUTATION_LATENCY_MS);
    const comments = readComments();
    const target = comments.find((comment) => comment.id === commentId);
    if (!target) throw new Error("Comment not found.");
    const removed = new Set([commentId]);
    // Replies die with their parent so counts stay honest.
    for (const comment of comments) {
      if (comment.parentCommentId && removed.has(comment.parentCommentId)) {
        removed.add(comment.id);
      }
    }
    writeComments(comments.filter((comment) => !removed.has(comment.id)));
    const posts = readPosts();
    const postIndex = posts.findIndex((post) => post.id === target.postId);
    if (postIndex !== -1) {
      posts[postIndex] = {
        ...posts[postIndex],
        commentsCount: Math.max(0, posts[postIndex].commentsCount - removed.size),
      };
      writePosts(posts);
    }
  },

  async toggleCommentLike(commentId: string): Promise<{ liked: boolean; count: number }> {
    await delay(200);
    const comments = readComments();
    const index = comments.findIndex((comment) => comment.id === commentId);
    if (index === -1) throw new Error("Comment not found.");
    const liked = !comments[index].likedByMe;
    comments[index] = {
      ...comments[index],
      likedByMe: liked,
      likesCount: Math.max(0, comments[index].likesCount + (liked ? 1 : -1)),
    };
    writeComments(comments);
    return { liked, count: comments[index].likesCount };
  },

  /* ── Sharing trips ────────────────────────────────────────── */

  async listShareableTrips(): Promise<TripRecord[]> {
    await delay(250);
    return tripsService.listTrips();
  },

  async shareTrip(
    payload: ShareTripPayload,
    author: CommunityUser,
  ): Promise<CommunityPost> {
    await delay(MUTATION_LATENCY_MS);
    const sharedTrip = await buildSharedTripSnapshot(payload.tripId);
    const post: CommunityPost = {
      id: newId("post"),
      kind: "shared-trip",
      author,
      content: payload.content.trim(),
      media: [],
      tags: ["Travel"],
      privacy: payload.privacy,
      createdAt: new Date().toISOString(),
      likedByMe: false,
      likesCount: 0,
      savedByMe: false,
      commentsCount: 0,
      commentsEnabled: true,
      sharedTrip,
    };
    writePosts([post, ...readPosts()]);
    return post;
  },

  /** Copies a community trip into the viewer's own library. */
  async copySharedTrip(tripId: string): Promise<TripRecord | null> {
    await delay(MUTATION_LATENCY_MS);
    return tripsService.duplicateTrip(tripId);
  },

  /* ── Follow graph ─────────────────────────────────────────── */

  readFollowingIds(): string[] {
    return readFollowing();
  },

  async toggleFollow(
    userId: string,
  ): Promise<{ following: boolean; followersCount: number }> {
    await delay(250);
    const followingIds = readFollowing();
    const isFollowing = followingIds.includes(userId);
    const next = isFollowing
      ? followingIds.filter((id) => id !== userId)
      : [...followingIds, userId];
    writeJson(FOLLOWS_KEY, next);

    // Keep follower counts roughly honest on the seeded profiles.
    const user =
      seedUsers.find((candidate) => candidate.id === userId) ?? null;
    if (user) {
      user.followersCount = Math.max(
        0,
        user.followersCount + (isFollowing ? -1 : 1),
      );
    }
    return { following: !isFollowing, followersCount: user?.followersCount ?? 0 };
  },

  /* ── Discovery ────────────────────────────────────────────── */

  async getTrending(): Promise<TrendingBundle> {
    await delay(300);
    const posts = readPosts();

    const locationCounts = new Map<string, number>();
    for (const post of posts) {
      if (!post.locationName) continue;
      locationCounts.set(
        post.locationName,
        (locationCounts.get(post.locationName) ?? 0) + 1,
      );
    }

    const tagCounts = new Map<string, number>(Object.entries(seedTagCounts));
    for (const post of posts) {
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    return {
      destinations: seedTrendingDestinations.map((destination) => ({
        ...destination,
        postsCount: destination.postsCount + (locationCounts.get(`${destination.city}, ${destination.country}`) ?? 0),
      })),
      tags: [...tagCounts.entries()]
        .map(([tag, count]) => ({ tag, postsCount: count }))
        .sort((a, b) => b.postsCount - a.postsCount)
        .slice(0, 6),
      travelers: seedUsers
        .filter((user) => user.id !== currentUserFromSeed.id)
        .sort((a, b) => b.followersCount - a.followersCount)
        .slice(0, 5)
        .map((user) => ({ ...user })),
    };
  },

  /* ── Search ───────────────────────────────────────────────── */

  async search(query: string): Promise<CommunitySearchResults> {
    await delay(FEED_LATENCY_MS);
    const q = query.trim().toLowerCase();
    if (!q) {
      return { posts: [], people: [], trips: [], destinations: [] };
    }
    const posts = readPosts();
    const matchesPost = (post: CommunityPost) =>
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q) ||
      post.author.username.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      (post.locationName?.toLowerCase().includes(q) ?? false);

    return {
      posts: posts.filter(matchesPost).slice(0, 8),
      people: seedUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.username.toLowerCase().includes(q) ||
          (user.bio?.toLowerCase().includes(q) ?? false) ||
          (user.city?.toLowerCase().includes(q) ?? false),
      ),
      trips: posts.filter(
        (post) => post.kind === "shared-trip" &&
          ((post.sharedTrip?.name.toLowerCase().includes(q) ?? false) ||
            (post.sharedTrip?.destinationLabel.toLowerCase().includes(q) ?? false) ||
            matchesPost(post)),
      ),
      destinations: seedTrendingDestinations.filter(
        (destination) =>
          destination.city.toLowerCase().includes(q) ||
          destination.country.toLowerCase().includes(q),
      ),
    };
  },

  /* ── Moderation ───────────────────────────────────────────── */

  async reportPost(_payload: ReportPostPayload): Promise<{ referenceId: string }> {
    await delay(MUTATION_LATENCY_MS);
    // A real backend would queue this for moderation.
    return { referenceId: `RPT-${Date.now().toString(36).toUpperCase()}` };
  },

  /* ── Composer drafts (per browser) ────────────────────────── */

  readDraft(): CreatePostPayload | null {
    return readJson<CreatePostPayload | null>(DRAFT_KEY, null);
  },

  writeDraft(draft: CreatePostPayload): void {
    writeJson(DRAFT_KEY, draft);
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // storage unavailable — mock only
    }
  },
};
