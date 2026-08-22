import { MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/avatar";
import type { CommunityUser } from "../community.types";
import { formatCount } from "../community-format";
import { useFollowedIds, useToggleFollow } from "../useCommunity";

/**
 * Compact profile preview dialog opened from avatars/names anywhere in
 * the module. Shows bio, stats and the follow toggle.
 */
export function ProfileDialog({
  user,
  viewerId,
  onClose,
}: {
  user: CommunityUser | null;
  viewerId: string;
  onClose: () => void;
}) {
  const followedIds = useFollowedIds();
  const toggleFollow = useToggleFollow();

  if (!user) return null;
  const isSelf = user.id === viewerId;
  const isFollowing = followedIds.data?.includes(user.id) ?? false;

  return (
    <Dialog open={Boolean(user)} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md sm:rounded-2xl">
        <DialogHeader className="items-center text-center sm:text-center">
          <UserAvatar
            name={user.name}
            src={user.avatarUrl}
            className="mx-auto size-16 text-base"
          />
          <DialogTitle className="mt-2">{user.name}</DialogTitle>
          <DialogDescription>@{user.username}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {user.bio ? (
            <p className="text-center text-sm leading-relaxed text-foreground">{user.bio}</p>
          ) : null}
          {user.city && user.country ? (
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-travel-blue" aria-hidden="true" />
              {user.city}, {user.country}
            </p>
          ) : null}

          <dl className="grid grid-cols-3 divide-x divide-subtle-border rounded-xl border border-border py-3 text-center">
            {[
              { label: "Trips", value: user.tripsCount },
              { label: "Followers", value: user.followersCount },
              { label: "Following", value: user.followingCount },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="order-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="order-1 text-sm font-semibold text-card-foreground">
                  {formatCount(stat.value)}
                </dd>
              </div>
            ))}
          </dl>

          {!isSelf ? (
            <Button
              className="w-full"
              variant={isFollowing ? "outline" : "default"}
              disabled={toggleFollow.isPending}
              onClick={() =>
                toggleFollow.mutate(user.id, {
                  onSuccess: ({ following }) =>
                    toast.success(following ? `Following ${user.name}` : `Unfollowed ${user.name}`),
                })
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

