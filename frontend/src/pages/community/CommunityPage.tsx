import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Compass,
  Loader2,
  MapPin,
  PenLine,
  Search,
  Share2,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorState } from "@/features/dashboard/components/States";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import type {
  CommunitySearchResults,
  CommunityUser,
  FeedTabId,
} from "@/features/community/community.types";
import {
  currentViewerId,
  toCommunityUser,
  useCommunityFeed,
  useCommunitySearch,
  useTrending,
} from "@/features/community/useCommunity";import { PostCard } from "@/features/community/components/post-card";
import { PostComposer } from "@/features/community/components/post-composer";
import { ProfileDialog } from "@/features/community/components/profile-dialog";
import { ShareTripDialog } from "@/features/community/components/share-trip-dialog";
import { TrendingSidebar } from "@/features/community/components/trending-sidebar";
import { formatCount } from "@/features/community/community-format";

const FEED_TABS: { id: FeedTabId; label: string }[] = [
  { id: "for-you", label: "For you" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "trips", label: "Trips" },
  { id: "saved", label: "Saved" },
];

export function CommunityPage() {
  const { user } = useAuth();
  const viewer = useMemo(() => toCommunityUser(user), [user]);
  const viewerId = currentViewerId();

  const [tab, setTab] = useState<FeedTabId>("for-you");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [profileUser, setProfileUser] = useState<CommunityUser | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const feed = useCommunityFeed(tab);
  const trending = useTrending();
  const searching = query.length > 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <PageHeader
          title="Community"
          description="Discover real trips and get inspired by other travelers."
          actions={
            <Button size="sm" onClick={() => setShareOpen(true)}>
              <Share2 className="size-4" aria-hidden="true" />
              Share Your Trip
            </Button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <PostComposer viewer={viewer} onPosted={() => setTab("for-you")} />

            {/* Search */}
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search destinations, travelers, or topics…"
                className="h-10 rounded-xl pl-9 pr-9"
                aria-label="Search the community"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <section className="xl:hidden" aria-label="Trending topics">
              <h2 className="mb-2 text-sm font-semibold text-card-foreground">Trending</h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(trending.data?.tags ?? []).slice(0, 5).map((tag) => (
                  <button
                    key={tag.tag}
                    type="button"
                    onClick={() => setSearchInput(tag.tag)}
                    className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-strong-border hover:bg-accent hover:text-foreground"
                  >
                    #{tag.tag}
                  </button>
                ))}
              </div>
            </section>

            {searching ? (
              <SearchResults
                query={query}
                viewer={viewer}
                onOpenProfile={setProfileUser}
              />
            ) : (
              <>
                <Tabs value={tab} onValueChange={(value) => setTab(value as FeedTabId)}>
                  <div className="relative">
                    <TabsList className="w-full justify-start overflow-x-auto">
                      {FEED_TABS.map((entry) => (
                        <TabsTrigger key={entry.id} value={entry.id} className="gap-1.5">
                          {entry.id === "saved" ? (
                            <Bookmark className="size-3.5" aria-hidden="true" />
                          ) : null}
                          {entry.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
                  </div>
                </Tabs>

                {/* Feed */}
                <div className="space-y-4" aria-live="polite">
                  {feed.isLoading ? (
                    [0, 1].map((i) => <PostSkeleton key={i} />)
                  ) : feed.isError ? (
                    <ErrorState
                      title="The feed hit a snag"
                      description="We couldn't load posts just now. Give it another go."
                      onRetry={() => void feed.refetch()}
                    />
                  ) : (feed.data?.pages.flatMap((page) => page.posts).length ?? 0) === 0 ? (
                    <EmptyState
                      icon={PenLine}
                      title={
                        tab === "saved"
                          ? "Nothing saved yet"
                          : tab === "following"
                            ? "Follow some travelers first"
                            : "No stories here yet"
                      }
                      description={
                        tab === "saved"
                          ? "Tap the bookmark on any post to keep it handy."
                          : tab === "following"
                            ? "Posts from people you follow will show up here."
                            : "Be the first — share a story or a trip above."
                      }
                    />
                  ) : (
                    <>
                      {feed.data?.pages.flatMap((page) => page.posts).map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          viewer={viewer}
                          onOpenProfile={setProfileUser}
                          onTagClick={(tag) => setSearchInput(tag)}
                        />
                      ))}
                      {feed.hasNextPage ? (
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            onClick={() => void feed.fetchNextPage()}
                            disabled={feed.isFetchingNextPage}
                          >
                            {feed.isFetchingNextPage ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            ) : null}
                            Load more
                          </Button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden xl:block">
            <TrendingSidebar
              viewerId={viewerId}
              onPickQuery={(picked) => setSearchInput(picked)}
              onOpenProfile={setProfileUser}
            />
          </div>
        </div>

        <ProfileDialog user={profileUser} viewerId={viewerId} onClose={() => setProfileUser(null)} />
        <ShareTripDialog open={shareOpen} viewer={viewer} onClose={() => setShareOpen(false)} />
      </div>
    </AppShell>
  );
}

function SearchResults({
  query,
  viewer,
  onOpenProfile,
}: {
  query: string;
  viewer: CommunityUser;
  onOpenProfile: (user: CommunityUser) => void;
}) {
  const results: CommunitySearchResults | undefined = useCommunitySearch(query, true).data;

  if (!results) {
    return (
      <div className="space-y-3">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  const total =
    results.posts.length +
    results.people.length +
    results.trips.length +
    results.destinations.length;

  if (total === 0) {
    return (
      <EmptyState
        icon={Search}
        title={`No matches for "${query}"`}
        description="Try a city, a traveler name or a topic like Food — then clear the box to return to the feed."
      />
    );
  }

  return (
    <div className="space-y-5">
      {results.people.length > 0 ? (
        <section aria-label="People">
          <h2 className="mb-2 text-sm font-semibold text-card-foreground">People</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {results.people.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => onOpenProfile(person)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-strong-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{person.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      @{person.username} · {formatCount(person.followersCount)} followers
                    </span>
                  </span>
                  <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {[...results.trips, ...results.posts].length > 0 ? (
        <section aria-label="Posts" className="space-y-4">
          <h2 className="text-sm font-semibold text-card-foreground">Posts</h2>
          {[...results.trips, ...results.posts].map((post) => (
            <PostCard key={post.id} post={post} viewer={viewer} onOpenProfile={onOpenProfile} />
          ))}
        </section>
      ) : null}

      {results.destinations.length > 0 ? (
        <section aria-label="Destinations">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
            <MapPin className="size-4 text-travel-blue" aria-hidden="true" />
            Destinations
          </h2>
          <ul className="flex flex-wrap gap-2">
            {results.destinations.map((destination) => (
              <li
                key={destination.id}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {destination.city}, {destination.country} ·{" "}
                {formatCount(destination.postsCount)} posts
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className={cn("rounded-2xl border bg-card p-4")}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
