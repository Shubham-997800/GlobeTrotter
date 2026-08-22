import { Heart, MessageCircle, MapPin } from "lucide-react";

import type { TravelStory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TravelStoryCardProps {
  story: TravelStory;
  className?: string;
}

export function TravelStoryCard({ story, className }: TravelStoryCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        className,
      )}
    >
      {/* Post image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={story.image}
          alt={story.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"
        />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {story.destination}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3">
          <img
            src={story.avatar}
            alt={`${story.username} avatar`}
            loading="lazy"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {story.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {story.handle} · {story.destination}
            </p>
          </div>
        </div>

        <p className="text-pretty mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {story.story}
        </p>

        <div className="mt-4 flex items-center gap-5 border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors group-hover:text-primary">
            <Heart className="h-4 w-4" aria-hidden="true" />
            {story.likes}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {story.comments}
          </span>
          <span className="ml-auto text-xs font-medium text-primary">View</span>
        </div>
      </div>
    </article>
  );
}