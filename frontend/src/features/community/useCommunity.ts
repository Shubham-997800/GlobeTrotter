import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authService } from "@/features/auth/auth.service";
import type { User } from "@/features/auth/auth.types";
import type { PostComment } from "./community.types";
import { communityService } from "./community.service";
import { currentUserFromSeed } from "./community.data";
import type {
  CommunityPost,
  CommunityUser,
  CreateCommentPayload,
  CreatePostPayload,
  FeedTabId,
  ReportPostPayload,
  ShareTripPayload,
} from "./community.types";

/** Central cache keys so mutations can invalidate precisely. */
export const communityKeys = {
  all: ["community"] as const,
  feed: (tab: FeedTabId, viewerId: string) =>
    [...communityKeys.all, "feed", tab, viewerId] as const,
  saved: (viewerId: string) => [...communityKeys.all, "saved", viewerId] as const,
  comments: (postId: string) => [...communityKeys.all, "comments", postId] as const,
  trending: () => [...communityKeys.all, "trending"] as const,
  search: (query: string) =>
    [...communityKeys.all, "search", query.toLowerCase()] as const,
  shareTrips: () => [...communityKeys.all, "share-trips"] as const,
  followingIds: () => [...communityKeys.all, "following-ids"] as const,
};

/** Comment row in cache — extends the domain type with optimistic state. */
export interface CachedComment extends PostComment {
  /** Marks rows inserted optimistically before the server confirms. */
  pending?: boolean;
}

interface FeedPageShape {
  posts: CommunityPost[];
  hasMore: boolean;
  total: number;
}

/**
 * Maps the signed-in auth user onto the denormalized author shape used
 * by posts and comments. Falls back to the seeded demo profile when
 * signed out (tests / previews).
 */
export function toCommunityUser(user: User | null): CommunityUser {
  if (!user) return currentUserFromSeed;
  return {
    id: user.id,
    name: user.name,
    username:
      user.email.split("@")[0]?.replace(/[^a-z0-9._-]/gi, "") || "traveler",
    avatarUrl: user.avatarUrl,
    bio: user.bio ?? "Explorer in progress.",
    city: user.city,
    country: user.country,
    tripsCount: 1,
    followersCount: 0,
    followingCount: 0,
  };
}

/** Current viewer id for cache keys — stable even before auth hydrates. */
export function currentViewerId(): string {
  try {
    return authService.getSession()?.user.id ?? currentUserFromSeed.id;
  } catch {
    return currentUserFromSeed.id;
  }
}

/* ── Cross-cache post patching (optimistic updates) ─────────────── */

function isCommunityKey(key: readonly unknown[]): boolean {
  return key[0] === "community";
}

/**
 * Applies a pure post transformer to every cached list a post can
 * appear in: infinite feeds, the saved list and search results.
 */
function mapPostsEverywhere(
  queryClient: ReturnType<typeof useQueryClient>,
  transform: (post: CommunityPost) => CommunityPost,
) {
  for (const query of queryClient.getQueryCache().getAll()) {
    const key = query.queryKey;
    if (!isCommunityKey(key)) continue;

    if (key[1] === "feed" && key[3] === currentViewerId()) {
      queryClient.setQueryData<{ pages: FeedPageShape[] }>(key, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                posts: page.posts.map(transform),
              })),
            }
          : data,
      );
    } else if (key[1] === "saved" && key[2] === currentViewerId()) {
      queryClient.setQueryData<CommunityPost[]>(key, (posts) =>
        posts?.map(transform),
      );
    } else if (key[1] === "search") {
      queryClient.setQueryData(key, (results: unknown) => {
        if (!results) return results;
        const scoped = results as { posts: CommunityPost[]; trips: CommunityPost[] };
        return {
          ...scoped,
          posts: scoped.posts.map(transform),
          trips: scoped.trips.map(transform),
        };
      });
    }
  }
}

function patchPostEverywhere(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  patch: Partial<Pick<CommunityPost, "likedByMe" | "likesCount" | "savedByMe" | "commentsCount">>,
) {
  mapPostsEverywhere(queryClient, (post) =>
    post.id === postId ? { ...post, ...patch } : post,
  );
}

/** Removes a deleted post from every cached list it may still appear in. */
function removePostEverywhere(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
) {
  for (const query of queryClient.getQueryCache().getAll()) {
    const key = query.queryKey;
    if (!isCommunityKey(key)) continue;

    if (key[1] === "feed") {
      queryClient.setQueryData<{ pages: FeedPageShape[] }>(key, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                total: Math.max(0, page.total - 1),
                posts: page.posts.filter((post) => post.id !== postId),
              })),
            }
          : data,
      );
    } else if (key[1] === "saved" && key[2] === currentViewerId()) {
      queryClient.setQueryData<CommunityPost[]>(key, (posts) =>
        posts?.filter((post) => post.id !== postId),
      );
    }
  }
}

/* ── Queries ───────────────────────────────────────────────────── */

export function useCommunityFeed(tab: FeedTabId) {
  const viewerId = currentViewerId();
  return useInfiniteQuery({
    queryKey: communityKeys.feed(tab, viewerId),
    queryFn: ({ pageParam }) => communityService.getFeed(tab, pageParam, viewerId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    staleTime: 15_000,
  });
}

export function useSavedPosts() {
  const viewerId = currentViewerId();
  return useQuery({
    queryKey: communityKeys.saved(viewerId),
    queryFn: () => communityService.listSavedPosts(),
    staleTime: 15_000,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: communityKeys.trending(),
    queryFn: () => communityService.getTrending(),
    staleTime: 5 * 60_000,
  });
}

export function useCommunitySearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: communityKeys.search(query),
    queryFn: () => communityService.search(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 30_000,
  });
}

export function useShareableTrips(enabled = true) {
  return useQuery({
    queryKey: communityKeys.shareTrips(),
    queryFn: () => communityService.listShareableTrips(),
    enabled,
    staleTime: 30_000,
  });
}

export function useComments(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: communityKeys.comments(postId),
    queryFn: () => communityService.listComments(postId),
    enabled,
    staleTime: 10_000,
  });
}

/* ── Post mutations ────────────────────────────────────────────── */

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      author,
    }: {
      payload: CreatePostPayload;
      author: CommunityUser;
    }) => communityService.createPost(payload, author),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...communityKeys.all, "feed"],
      });
      void queryClient.invalidateQueries({ queryKey: communityKeys.trending() });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      payload,
    }: {
      postId: string;
      payload: CreatePostPayload;
    }) => communityService.updatePost(postId, payload),
    onSuccess: (updated) => {
      // Server record is authoritative — repaint every cached copy.
      mapPostsEverywhere(queryClient, (post) =>
        post.id === updated.id ? updated : post,
      );
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => communityService.deletePost(postId),
    onMutate: (postId) => {
      removePostEverywhere(queryClient, postId);
    },
  });
}

export function useTogglePostLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => communityService.toggleLike(postId),
    onMutate: (postId) => {
      // Optimistic flip; the server response reconciles the exact count.
      mapPostsEverywhere(queryClient, (post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likesCount: Math.max(
                0,
                post.likesCount + (post.likedByMe ? -1 : 1),
              ),
            }
          : post,
      );
    },
    onSuccess: ({ liked, count }, postId) => {
      patchPostEverywhere(queryClient, postId, {
        likedByMe: liked,
        likesCount: count,
      });
    },
  });
}

export function useTogglePostSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => communityService.toggleSave(postId),
    onMutate: (postId) => {
      mapPostsEverywhere(queryClient, (post) =>
        post.id === postId ? { ...post, savedByMe: !post.savedByMe } : post,
      );
    },
    onSuccess: ({ saved }, postId) => {
      patchPostEverywhere(queryClient, postId, { savedByMe: saved });
      void queryClient.invalidateQueries({
        queryKey: [...communityKeys.all, "saved"],
      });
    },
  });
}

export function useShareTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      author,
    }: {
      payload: ShareTripPayload;
      author: CommunityUser;
    }) => communityService.shareTrip(payload, author),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...communityKeys.all, "feed"],
      });
    },
  });
}

export function useCopySharedTrip() {
  return useMutation({
    mutationFn: (tripId: string) => communityService.copySharedTrip(tripId),
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: (payload: ReportPostPayload) =>
      communityService.reportPost(payload),
  });
}

/* ── Comment mutations ─────────────────────────────────────────── */

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      author,
    }: {
      payload: Omit<CreateCommentPayload, "postId">;
      author: CommunityUser;
    }) => communityService.addComment({ ...payload, postId }, author),
    onMutate: async ({ payload, author }) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.comments(postId) });
      const previous = queryClient.getQueryData<CachedComment[]>(
        communityKeys.comments(postId),
      );
      const optimistic: CachedComment = {
        id: `optimistic_cmt_${Date.now().toString(36)}`,
        postId,
        author,
        content: payload.content.trim(),
        createdAt: new Date().toISOString(),
        parentCommentId: payload.parentCommentId,
        likedByMe: false,
        likesCount: 0,
        pending: true,
      };
      queryClient.setQueryData<CachedComment[]>(
        communityKeys.comments(postId),
        (existing) => [optimistic, ...(existing ?? [])],
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(communityKeys.comments(postId), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: communityKeys.comments(postId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...communityKeys.all, "feed"],
      });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => communityService.deleteComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.comments(postId) });
      const previous = queryClient.getQueryData<CachedComment[]>(
        communityKeys.comments(postId),
      );
      const removed = new Set([commentId]);
      for (const comment of previous ?? []) {
        if (comment.parentCommentId && removed.has(comment.parentCommentId)) {
          removed.add(comment.id);
        }
      }
      queryClient.setQueryData<CachedComment[]>(
        communityKeys.comments(postId),
        (existing) => existing?.filter((c) => !removed.has(c.id)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(communityKeys.comments(postId), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: communityKeys.comments(postId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...communityKeys.all, "feed"],
      });
    },
  });
}

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => communityService.toggleCommentLike(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.comments(postId) });
      const previous = queryClient.getQueryData<CachedComment[]>(
        communityKeys.comments(postId),
      );
      queryClient.setQueryData<CachedComment[]>(
        communityKeys.comments(postId),
        (existing) =>
          existing?.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likedByMe: !comment.likedByMe,
                  likesCount: Math.max(
                    0,
                    comment.likesCount + (comment.likedByMe ? -1 : 1),
                  ),
                }
              : comment,
          ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(communityKeys.comments(postId), context.previous);
      }
    },
  });
}

/* ── Follow graph ──────────────────────────────────────────────── */

export function useFollowedIds() {
  return useQuery({
    queryKey: communityKeys.followingIds(),
    queryFn: () => Promise.resolve(communityService.readFollowingIds()),
    staleTime: 10_000,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => communityService.toggleFollow(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: communityKeys.followingIds(),
      });
      void queryClient.invalidateQueries({ queryKey: communityKeys.trending() });
    },
  });
}
