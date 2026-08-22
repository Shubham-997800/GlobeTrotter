import { useState } from "react";
import { CornerDownRight, Heart, Loader2, SendHorizonal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CommunityUser, PostComment } from "../community.types";
import { formatRelativeTime } from "../community-format";
import {
  useAddComment,
  useComments,
  useDeleteComment,
  useToggleCommentLike,
} from "../useCommunity";

const COMMENT_MAX = 500;

/**
 * Comment thread for one post — flat list rendered as parent rows with
 * their one-level replies nested beneath them.
 */
export function PostComments({
  postId,
  viewer,
  onOpenProfile,
}: {
  postId: string;
  viewer: CommunityUser;
  onOpenProfile: (user: CommunityUser) => void;
}) {
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);
  const addComment = useAddComment(postId);
  const deleteComment = useDeleteComment(postId);
  const toggleLike = useToggleCommentLike(postId);

  const allRows =
    (useComments(postId, true).data ?? []) as (PostComment & {
      pending?: boolean;
    })[];
  const parents = allRows.filter((row) => !row.parentCommentId);
  const repliesByParent = new Map<string, PostComment[]>();
  for (const row of allRows) {
    if (!row.parentCommentId) continue;
    const list = repliesByParent.get(row.parentCommentId) ?? [];
    list.push(row);
    repliesByParent.set(row.parentCommentId, list);
  }

  const submit = () => {
    const content = draft.trim();
    if (!content || content.length > COMMENT_MAX || addComment.isPending) return;
    addComment.mutate(
      { payload: { content, parentCommentId: replyTo?.id }, author: viewer },
      {
        onSuccess: () => {
          setDraft("");
          setReplyTo(null);
        },
        onError: () => toast.error("Could not post that comment."),
      },
    );
  };

  const renderRow = (
    comment: PostComment & { pending?: boolean },
    reply?: boolean,
  ) => (
    <li key={comment.id} className={cn(reply && "ml-10", comment.pending && "opacity-60")}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onOpenProfile(comment.author)}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${comment.author.name}'s profile`}
        >
          <UserAvatar
            name={comment.author.name}
            src={comment.author.avatarUrl}
            className={reply ? "size-7" : undefined}
          />
        </button>
        <div className="min-w-0 flex-1 rounded-xl bg-muted/60 px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-xs font-semibold text-card-foreground">
              {comment.author.name}
              {comment.pending ? (
                <span className="ml-2 font-normal text-muted-foreground">Sending…</span>
              ) : null}
            </p>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground">
            {comment.content}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            {!reply ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-foreground"
                onClick={() => setReplyTo(comment)}
              >
                <CornerDownRight className="size-3.5" aria-hidden="true" />
                Reply
              </button>
            ) : null}
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 hover:text-foreground",
                comment.likedByMe && "text-primary",
              )}
              onClick={() => toggleLike.mutate(comment.id)}
              disabled={comment.pending}
              aria-pressed={comment.likedByMe}
              aria-label="Like comment"
            >
              <Heart
                className={cn("size-3.5", comment.likedByMe && "fill-current")}
                aria-hidden="true"
              />
              {comment.likesCount > 0 ? comment.likesCount : null}
            </button>
            {comment.author.id === viewer.id && !comment.pending ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-destructive"
                onClick={() =>
                  deleteComment.mutate(comment.id, {
                    onError: () => toast.error("Could not delete that comment."),
                  })
                }
                disabled={deleteComment.isPending}
                aria-label="Delete comment"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );

  return (
    <div className="space-y-3">
      <ul className="space-y-3" aria-label="Comments">
        {parents.map((parent) => (
          <div key={parent.id} className="space-y-2">
            {renderRow(parent)}
            <ul className="space-y-2">
              {(repliesByParent.get(parent.id) ?? []).map((reply) =>
                renderRow(reply, true),
              )}
            </ul>
          </div>
        ))}
      </ul>

      {replyTo ? (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <CornerDownRight className="size-3.5" aria-hidden="true" />
          Replying to {replyTo.author.name}
          <button
            type="button"
            className="ml-1 underline hover:text-foreground"
            onClick={() => setReplyTo(null)}
          >
            cancel
          </button>
        </p>
      ) : null}

      <div className="flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, COMMENT_MAX))}
          placeholder={replyTo ? `Reply to ${replyTo.author.name}…` : "Add a comment…"}
          rows={1}
          className="min-h-9 resize-none py-2"
          aria-label="Write a comment"
        />
        <Button
          size="icon"
          onClick={submit}
          disabled={!draft.trim() || addComment.isPending}
          aria-label="Post comment"
        >
          {addComment.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <SendHorizonal className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      {draft.length > COMMENT_MAX - 100 ? (
        <p className="text-right text-[11px] text-muted-foreground">
          {draft.length}/{COMMENT_MAX}
        </p>
      ) : null}
    </div>
  );
}
