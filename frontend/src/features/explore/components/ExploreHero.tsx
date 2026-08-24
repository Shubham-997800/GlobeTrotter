import { Link } from "react-router-dom";
import { MapPin, Star, Users, Activity } from "lucide-react";

import type { ExploreDestination } from "../explore.types";

interface ExploreHeroProps {
  destination: ExploreDestination;
  stats?: {
    popularDestinations: number;
    activities: number;
    countries: number;
  };
}

/**
 * Featured destination hero section for the Explore page.
 * Uses a high-quality image with gradient overlay for text readability.
 */
export function ExploreHero({ destination, stats }: ExploreHeroProps) {
  const tags = destination.tags.slice(0, 4);

  return (
    <section aria-labelledby="explore-hero-heading" className="relative rounded-3xl overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={destination.image}
          alt={destination.imageAlt}
          className="h-full w-full object-cover"
          loading="eager"
        />
        {/* Multi-stop gradient for readability in both light/dark modes */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-10 lg:p-14">
        <div className="mx-auto max-w-2xl">
          {/* Country tag */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            <MapPin className="size-3.5" aria-hidden="true" />
            {destination.country}
          </span>

          {/* Destination name */}
          <h1
            id="explore-hero-heading"
            className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance"
          >
            {destination.city}
          </h1>

          {/* Description */}
          <p className="mt-3 text-lg text-white/90 max-w-xl text-pretty">
            {destination.description}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Categories">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm"
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            ))}
          </div>

          {/* Quick stats */}
          {stats && (
            <div className="mt-6 flex flex-wrap items-center gap-6 text-white/80" aria-label="Quick statistics">
              <div className="flex items-center gap-1.5">
                <Users className="size-5" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold tracking-tight">{stats.popularDestinations.toLocaleString()}+</p>
                  <p className="text-xs">Popular Destinations</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="size-5" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold tracking-tight">{stats.activities.toLocaleString()}+</p>
                  <p className="text-xs">Activities</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-5" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold tracking-tight">{stats.countries}+</p>
                  <p className="text-xs">Countries</p>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 lg:mt-8">
            <Link
              to={`/explore/destinations/${destination.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            >
              Explore Now
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Rating badge */}
      <div className="absolute right-6 bottom-6 z-10 flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-sm">
        <Star className="size-5 fill-warning text-warning" aria-hidden="true" />
        <span className="text-white font-semibold">{destination.rating.toFixed(1)}</span>
        <span className="text-white/70 text-sm">({destination.reviews.toLocaleString()} reviews)</span>
      </div>
    </section>
  );
}

/**
 * Hero skeleton for loading state
 */
export function ExploreHeroSkeleton() {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-muted" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted/10" />
      <div className="relative z-10 p-6 md:p-10 lg:p-14">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-6 w-32 animate-pulse rounded-full bg-muted-foreground/20" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted-foreground/20" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted-foreground/20" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-muted-foreground/20" />
            ))}
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-5 w-5 animate-pulse rounded bg-muted-foreground/20" />
                <div className="space-y-1">
                  <div className="h-6 w-16 animate-pulse rounded bg-muted-foreground/20" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted-foreground/20" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-12 w-48 animate-pulse rounded-xl bg-muted-foreground/20" />
        </div>
      </div>
    </section>
  );
}