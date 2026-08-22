import type { PostMediaItem } from "../community.types";

import { cn } from "@/lib/utils";

/**
 * Photo grid for 1–4 images following the theme's soft-border card
 * language (`rounded-xl`, `border-subtle-border`).
 */
export function PostMedia({ media }: { media: PostMediaItem[] }) {
  if (media.length === 0) return null;
  const images = media.slice(0, 4);

  return (
    <div
      className={cn(
        "grid gap-1 overflow-hidden rounded-xl border border-subtle-border",
        images.length === 1 && "grid-cols-1",
        images.length === 2 && "grid-cols-2",
        images.length === 3 && "grid-cols-2",
        images.length >= 4 && "grid-cols-2",
      )}
    >
      {images.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "relative bg-muted",
            images.length === 1 && "aspect-video",
            images.length === 2 && "h-56",
            images.length === 3 && index === 0 && "col-span-2 h-44",
            images.length === 3 && index > 0 && "h-40",
            images.length >= 4 && "h-40",
          )}
        >
          <img
            src={item.url}
            alt={item.alt}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}