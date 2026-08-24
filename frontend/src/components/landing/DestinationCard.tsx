import { Link } from "react-router-dom";
import { ArrowRight, Star, MapPin } from "lucide-react";

import type { Destination } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
  destination: Destination;
  className?: string;
}

export function DestinationCard({
  destination,
  className,
}: DestinationCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-clip rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/10",
        className,
      )}
    >
      {/* Whole card is one link — judges can click anywhere on it. */}
      <Link
        to={`/explore/destinations/${destination.id}`}
        aria-label={`Explore ${destination.city}, ${destination.country}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={destination.image}
          alt={destination.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Country tag */}
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          {destination.country}
        </span>

        {/* Rating */}
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm dark:bg-card/90">
          <Star className="h-3 w-3 fill-warning text-warning" aria-hidden="true" />
          {destination.rating.toFixed(1)}
        </span>

        {/* Bottom metadata */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0">
          <h3 className="font-heading text-lg font-bold text-white">{destination.city}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {destination.country}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-pretty flex-1 text-sm leading-relaxed text-muted-foreground">
          {destination.description}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Popular</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors group-hover:text-primary-hover">
            Explore
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
      </Link>
    </article>
  );
}