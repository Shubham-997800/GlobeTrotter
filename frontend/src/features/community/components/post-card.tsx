import { useState } from "react";
import {
  Bookmark,
  Flag,
  Heart,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type {
  CommunityPost,
  CommunityUser,
  ReportReason,
} from "../community.types";
import { formatCount, formatRelativeTime } from "../community-format";
import { PostMedia } from "./post-media";
import { SharedTripCard } from "./shared-trip-card";
import { PostComments } from "./post-comments";
import {
  useDeletePost,
  useReportPost,
  useTogglePostLike,
  useTogglePostSave,
  useUpdatePost,
} from "../useCommunity";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or scam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Something else" },
];

/**
 * Feed post card — author header, story content or shared-trip embed,
 * engagement actions and the inline comment thread.
 */
export function PostCard({
  post,
  viewer,
  onOpenProfile,
  onTagClick,
}: {
  post: CommunityPost;
  viewer: CommunityUser;
  onOpenProfile: (user: CommunityUser) => void;
  onTagClick?: (tag: string) => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");

  const toggleLike = useTogglePostLike();
  const toggleSave = useTogglePostSave();
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();
  const reportPost = useReportPost();

  const isOwner = post.author.id === viewer.id;

  const saveEdit = () => {
    const content = editText.trim();
    if (!content) return;
    updatePost.mutate(
      {
        postId: post.id,
        payload: {
          content,
          media: post.media.map(({ url, alt }) => ({ url, alt })),
          tags: post.tags,
          privacy: post.privacy,
          locationName: post.locationName,
        },
      },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success("Post updated");
        },
        onError: () => toast.error("Could not update the post."),
      },
    );
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/community?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <article className="rounded-2xl border bg-card p-4 shadow-sm">
      {/* ── Header ── */}
      <header className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onOpenProfile(post.author)}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${post.author.name}'s profile`}
        >
          <UserAvatar name={post.author.name} src={post.author.avatarUrl} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 text-sm">
            <button
              type="button"
              onClick={() => onOpenProfile(post.author)}
              className="font-semibold text-card-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {post.author.name}
            </button>
            <span className="truncate text-xs text-muted-foreground">
              @{post.author.username}
            </span>
            {post.privacy === "private" ? (
              <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px]">
                <Lock className="size-3" aria-hidden="true" />
                Private
              </Badge>
            ) : null}
          </div>
          <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
            {formatRelativeTime(post.createdAt)}
            {post.updatedAt ? " · edited" : null}
            {post.locationName ? (
              <>
                {" · "}
                <MapPin className="size-3.5 text-travel-blue" aria-hidden="true" />
                {post.locationName}
              </>
            ) : null}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground"
              aria-label="Post options"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && post.kind === "story" ? (
              <DropdownMenuItem
                onClick={() => {
                  setEditText(post.content);
                  setEditing(true);
                }}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit post
              </DropdownMenuItem>
            ) : null}
            {isOwner ? (
              <>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <Flag className="size-4" aria-hidden="true" />
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Body ── */}
      {editing ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            rows={4}
            aria-label="Edit post content"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setEditText(post.content);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveEdit}
              disabled={!editText.trim() || updatePost.isPending}
            >
              {updatePost.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          {post.kind === "shared-trip" && post.shareNote ? (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
              {post.shareNote}
            </p>
          ) : (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
              {post.content}
            </p>
          )}

          {post.media.length > 0 ? (
            <div className="mt-3">
              <PostMedia media={post.media} />
            </div>
          ) : null}

          {post.kind === "shared-trip" && post.sharedTrip ? (
            <div className="mt-3">
              <SharedTripCard snapshot={post.sharedTrip} />
            </div>
          ) : null}

          {post.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-travel-blue transition-colors hover:border-strong-border hover:bg-accent"
                  onClick={() => onTagClick?.(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}

      {/* ── Engagement bar ── */}
      <footer className="mt-3 flex items-center gap-1 border-t border-subtle-border pt-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5 text-muted-foreground", post.likedByMe && "text-primary")}
          onClick={() => toggleLike.mutate(post.id)}
          disabled={toggleLike.isPending}
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? "Unlike" : "Like"}
        >
          <Heart
            className={cn("size-4", post.likedByMe && "fill-current")}
            aria-hidden="true"
          />
          {formatCount(post.likesCount)}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => setCommentsOpen((open) => !open)}
          aria-expanded={commentsOpen}
          aria-label="Toggle comments"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          {formatCount(post.commentsCount)}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={shareLink}
          aria-label="Copy post link"
        >
          <Share2 className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto gap-1.5 text-muted-foreground"
          onClick={() =>
            toggleSave.mutate(post.id, {
              onSuccess: ({ saved }) =>
                toast.success(saved ? "Saved to your collection" : "Removed from saved"),
            })
          }
          disabled={toggleSave.isPending}
          aria-pressed={post.savedByMe}
          aria-label={post.savedByMe ? "Unsave" : "Save"}
        >
          <Bookmark
            className={cn("size-4", post.savedByMe && "fill-current text-primary")}
            aria-hidden="true"
          />
        </Button>
      </footer>

      {/* ── Comments ── */}
      {commentsOpen ? (
        <div className="mt-3 border-t border-subtle-border pt-3">
          <PostComments postId={post.id} viewer={viewer} onOpenProfile={onOpenProfile} />
        </div>
      ) : null}

      {/* ── Delete confirmation ── */}
      <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <DialogContent className="sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
            <DialogDescription>
              This removes the post, its photos and all comments. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deletePost.isPending}
              onClick={() =>
                deletePost.mutate(post.id, {
                  onSuccess: () => {
                    setConfirmingDelete(false);
                    toast.success("Post deleted");
                  },
                  onError: () => toast.error("Could not delete the post."),
                })
              }
            >
              {deletePost.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Report dialog ── */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Report this post</DialogTitle>
            <DialogDescription>
              Tell us what's wrong — our moderation team will review it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={reportReason} onValueChange={(value) => setReportReason(value as ReportReason)}>
              <SelectTrigger aria-label="Report reason">
                <SelectValue placeholder="Pick a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value.slice(0, 500))}
              placeholder="Additional details (optional)"
              rows={3}
              aria-label="Report details"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>
              <X className="size-4" aria-hidden="true" />
              Cancel
            </Button>
            <Button
              disabled={reportPost.isPending}
              onClick={() =>
                reportPost.mutate(
                  { postId: post.id, reason: reportReason, details: reportDetails.trim() || undefined },
                  {
                    onSuccess: ({ referenceId }) => {
                      setReportOpen(false);
                      setReportDetails("");
                      toast.success("Report submitted", {
                        description: `Reference ${referenceId}. Thank you for keeping the community safe.`,
                      });
                    },
                    onError: () => toast.error("Could not submit the report."),
                  },
                )
              }
            >
              {reportPost.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Flag className="size-4" aria-hidden="true" />
              )}
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
