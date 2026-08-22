import { Hash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/avatar";
import type { CommunityUser } from "../community.types";
import { formatCount } from "../community-format";
import { useFollowedIds, useTrending, useToggleFollow } from "../useCommunity";

/**
 * Right rail of the community page — trending destinations, hot topic
 * tags and suggested travelers with quick-follow actions.
 */
export function TrendingSidebar({
  viewerId,
  onPickQuery,
  onOpenProfile,
}: {
  viewerId: string;
  onPickQuery: (query: string) => void;
  onOpenProfile: (user: CommunityUser) => void;
}) {
  const trending = useTrending();
  const followedIds = useFollowedIds();
  const toggleFollow = useToggleFollow();

  const bundle = trending.data;

  return (
    <aside className="space-y-6" aria-label="Trending in the community">
      {/* Destinations */}
      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-card-foreground">Trending destinations</h2>
        <ul className="mt-3 space-y-3">
          {trending.isLoading
            ? [0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </li>
              ))
            : (bundle?.destinations ?? []).map((destination) => (
                <li key={destination.id}>
                  <button
                    type="button"
                    onClick={() => onPickQuery(destination.city)}
                    className="group flex w-full items-center gap-3 rounded-xl p-1 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {destination.image ? (
                        <img
                          src={destination.image}
                          alt={destination.imageAlt ?? `${destination.city}, ${destination.country}`}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-card-foreground group-hover:underline">
                        {destination.city}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {destination.country} ·{" "}
                        {formatCount(destination.postsCount)} posts
                      </span>
                    </span>
                  </button>
                </li>
              ))}
        </ul>
      </section>

      {/* Tags */}
      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-card-foreground">Hot topics</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(bundle?.tags ?? []).map((tag) => (
            <Badge
              key={tag.tag}
              variant="soft"
              className="cursor-pointer transition-colors hover:border-strong-border hover:bg-accent"
            >
              <button
                type="button"
                className="inline-flex items-center gap-1"
                onClick={() => onPickQuery(tag.tag)}
              >
                <Hash className="size-3" aria-hidden="true" />
                {tag.tag}
              </button>
            </Badge>
          ))}
        </div>
      </section>

      {/* People */}
      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-card-foreground">Travelers to follow</h2>
        <ul className="mt-3 space-y-3">
          {(bundle?.travelers ?? [])
            .filter((traveler) => traveler.id !== viewerId)
            .map((traveler) => {
              const following =
                followedIds.data?.includes(traveler.id) ?? false;
              return (
                <li key={traveler.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenProfile(traveler)}
                    className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View ${traveler.name}'s profile`}
                  >
                    <UserAvatar name={traveler.name} src={traveler.avatarUrl} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenProfile(traveler)}
                    className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block truncate text-sm font-medium text-card-foreground hover:underline">
                      {traveler.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      @{traveler.username}
                      {traveler.city ? ` · ${traveler.city}` : ""}
                    </span>
                  </button>
                  <Button
                    size="sm"
                    variant={following ? "outline" : "default"}
                    disabled={toggleFollow.isPending}
                    onClick={() =>
                      toggleFollow.mutate(traveler.id)
                    }
                    aria-label={following ? `Unfollow ${traveler.name}` : `Follow ${traveler.name}`}
                  >
                    {following ? "Following" : "Follow"}
                  </Button>
                </li>
              );
            })}
        </ul>
      </section>
    </aside>
  );
}

export const TRENDING_SIDEBAR_TESTID = "trending-sidebar";
