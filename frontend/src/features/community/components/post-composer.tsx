import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, MapPin, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  createPostSchema,
  POST_CONTENT_MAX,
  POST_IMAGE_MAX_BYTES,
  POST_MEDIA_MAX,
} from "../schemas/community.schema";
import { COMMUNITY_TAGS, type CommunityUser, type PostMediaItem } from "../community.types";
import { communityService } from "../community.service";
import { useCreatePost } from "../useCommunity";

interface DraftState {
  content: string;
  tags: string[];
  locationName: string;
  privacy: "public" | "private";
}

const EMPTY_DRAFT: DraftState = {
  content: "",
  tags: [],
  locationName: "",
  privacy: "public",
};

/**
 * Feed composer — styled textarea with preset topic tags, optional
 * location and drag-&-drop photo attachments (native input, no editor
 * dependency). Drafts persist per browser via the mock service.
 */
export function PostComposer({
  viewer,
  onPosted,
}: {
  viewer: CommunityUser;
  onPosted?: () => void;
}) {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [media, setMedia] = useState<PostMediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  // Restore draft once on mount.
  useEffect(() => {
    const stored = communityService.readDraft();
    if (!stored) return;
    setDraft({
      content: stored.content ?? "",
      tags: stored.tags ?? [],
      locationName: stored.locationName ?? "",
      privacy: stored.privacy ?? "public",
    });
  }, []);

  // Persist lightweight fields on every change (photos excluded).
  useEffect(() => {
    communityService.writeDraft({
      content: draft.content,
      media: [],
      tags: draft.tags,
      privacy: draft.privacy,
      locationName: draft.locationName || undefined,
    });
  }, [draft]);

  const toggleTag = (tag: string) => {
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }));
  };

  const ingestFiles = (files: FileList | File[]) => {
    setError(null);
    const incoming = Array.from(files);
    const accepted: PostMediaItem[] = [];
    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files can be attached.");
        continue;
      }
      if (file.size > POST_IMAGE_MAX_BYTES) {
        setError("Each photo must be under 5 MB.");
        continue;
      }
      accepted.push({ id: `${Date.now()}_${file.name}`, url: "", alt: file.name });
    }
    if (accepted.length === 0) return;
    setMedia((current) => {
      const room = POST_MEDIA_MAX - current.length;
      if (room <= 0) {
        setError(`Up to ${POST_MEDIA_MAX} photos per post.`);
        return current;
      }
      const sliced = accepted.slice(0, room);
      if (accepted.length > room) {
        setError(`Up to ${POST_MEDIA_MAX} photos per post.`);
      }
      // Read files into data URLs asynchronously.
      for (const item of sliced) {
        const file = incoming.find((candidate) => candidate.name === item.alt);
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => {
          setMedia((latest) =>
            latest.map((entry) =>
              entry.id === item.id
                ? { ...entry, url: String(reader.result ?? "") }
                : entry,
            ),
          );
        };
        reader.readAsDataURL(file);
      }
      return [...current, ...sliced];
    });
  };

  const submit = () => {
    setError(null);
    const parsed = createPostSchema.safeParse({
      content: draft.content,
      media: media.map(({ url, alt }) => ({ url, alt })),
      tags: draft.tags,
      privacy: draft.privacy,
      locationName: draft.locationName.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the post.");
      return;
    }
    const pendingUrls = parsed.data.media.filter((item) => !item.url);
    if (pendingUrls.length > 0) {
      setError("Photos are still loading — try again in a second.");
      return;
    }
    createPost.mutate(
      { payload: parsed.data, author: viewer },
      {
        onSuccess: () => {
          communityService.clearDraft();
          setDraft(EMPTY_DRAFT);
          setMedia([]);
          toast.success("Shared with the community");
          onPosted?.();
        },
        onError: () => setError("Could not publish the post. Please try again."),
      },
    );
  };

  return (
    <section
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm transition-colors",
        dragActive ? "border-primary bg-accent/40" : "border-border",
      )}
      aria-label="Create a post"
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        if (event.dataTransfer.files.length > 0) ingestFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex gap-3">
        <UserAvatar name={viewer.name} src={viewer.avatarUrl} />
        <div className="min-w-0 flex-1 space-y-3">
          <Textarea
            value={draft.content}
            onChange={(event) =>
              setDraft((c) => ({ ...c, content: event.target.value.slice(0, POST_CONTENT_MAX) }))
            }
            placeholder="Share a travel story, tip or question…"
            rows={3}
            className="resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            aria-label="Post content"
          />

          {media.length > 0 ? (
            <ul className="grid grid-cols-4 gap-2" aria-label="Attached photos">
              {media.map((item) => (
                <li key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border border-subtle-border bg-muted">
                  {item.url ? (
                    <img src={item.url} alt={item.alt} className="size-full object-cover" />
                  ) : (
                    <div className="size-full animate-pulse bg-muted" />
                  )}
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => setMedia((c) => c.filter((entry) => entry.id !== item.id))}
                    aria-label={`Remove ${item.alt}`}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Topic tags">
            {COMMUNITY_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={draft.tags.includes(tag)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  draft.tags.includes(tag)
                    ? "border-primary bg-primary-subtle text-primary dark:bg-primary/15"
                    : "border-border text-muted-foreground hover:border-strong-border hover:text-foreground",
                )}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-44 flex-1">
              <MapPin
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-travel-blue"
                aria-hidden="true"
              />
              <Input
                value={draft.locationName}
                onChange={(event) => setDraft((c) => ({ ...c, locationName: event.target.value }))}
                placeholder="Add a place…"
                className="h-9 pl-8"
                aria-label="Location"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) ingestFiles(event.target.files);
                event.target.value = "";
              }}
              aria-hidden="true"
              tabIndex={-1}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4 text-travel-blue" aria-hidden="true" />
              Photos
            </Button>
            <Label className="mr-1 flex items-center gap-2 text-xs text-muted-foreground">
              Private
              <Switch
                checked={draft.privacy === "private"}
                onCheckedChange={(checked) =>
                  setDraft((c) => ({ ...c, privacy: checked ? "private" : "public" }))
                }
                aria-label="Private post"
              />
            </Label>
          </div>

          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between border-t border-subtle-border pt-3">
            <span className="text-[11px] text-muted-foreground">
              {draft.content.length}/{POST_CONTENT_MAX} · drop photos anywhere here
            </span>
            <Button size="sm" onClick={submit} disabled={createPost.isPending}>
              {createPost.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              Post
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}