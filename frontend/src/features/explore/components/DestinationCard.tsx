import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Star, MapPin, ExternalLink, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ExploreDestination, TripSelectorOption } from "../explore.types";
import { useToggleSavedDestination } from "../useExplore";
import { formatMoneyRaw } from "@/features/trips/trips.utils";

interface DestinationCardProps {
  destination: ExploreDestination;
  /** Optional saved state (if not using mutation) */
  saved?: boolean;
  /** Trip options for "Add to Trip" dropdown */
  tripOptions?: TripSelectorOption[];
  /** Callback when "Add to Trip" is clicked */
  onAddToTrip?: (destinationId: string) => void;
  /** Variant for different contexts */
  variant?: "default" | "compact" | "featured";
  /** Click handler for the whole card */
  onClick?: () => void;
  /** Show match reasons */
  showMatchReasons?: boolean;
}

/**
 * Reusable destination card with wishlist, hover effects, and add-to-trip action.
 */
export function DestinationCard({
  destination,
  saved: initialSaved,
  tripOptions = [],
  onAddToTrip,
  variant = "default",
  onClick,
  showMatchReasons = false,
}: DestinationCardProps) {
  const [localSaved, setLocalSaved] = useState(initialSaved ?? false);

  const toggleSaved = useToggleSavedDestination();

  const saved = initialSaved ?? localSaved;

  const handleSaveToggle = async () => {
    const nextSaved = !saved;
    setLocalSaved(nextSaved); // Optimistic update
    try {
      await toggleSaved.mutateAsync(destination.id);
    } catch {
      setLocalSaved(saved); // Rollback on error
    }
  };

  const handleAddToTripClick = () => {
    if (onAddToTrip) {
      onAddToTrip(destination.id);
    }
  };

  const estimatedBudget = formatMoneyRaw(
    destination.estimatedDailyCostInr * (destination.recommendedDuration.includes("–")
      ? parseInt(destination.recommendedDuration.split("–")[1])
      : parseInt(destination.recommendedDuration)),
    "INR"
  );

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  const cardClasses = cn(
    "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200",
    "hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/25",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
    isFeatured
      ? "aspect-[16/9] min-h-[400px] lg:min-h-[500px]"
      : "h-full",
    isCompact
      ? ""
      : "hover:border-primary/20",
  );

  return (
      <article
        className={cardClasses}
        aria-label={`${destination.city}, ${destination.country}`}
      >
        {/* ── Image ── */}
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            isFeatured ? "absolute inset-0 z-0" : "aspect-[4/3]",
          )}
        >
          <Link
            to={`/explore/destinations/${destination.id}`}
            className={cn("block h-full w-full focus-visible:outline-none", isFeatured ? "absolute inset-0" : "")}
            onClick={(e) => {
              if (onClick) {
                e.preventDefault();
                onClick();
              }
            }}
          >
            <img
              src={destination.image}
              alt={destination.imageAlt}
              width="400"
              height="250"
              loading={isFeatured ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Gradient overlay for featured variant */}
          {isFeatured && (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              />
            </>
          )}

          {/* Country tag */}
          <div className="absolute left-3 top-3 z-10">
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
              isFeatured ? "bg-white/20 text-white" : "bg-black/60 text-white",
            )}>
              <MapPin className="size-3" aria-hidden="true" />
              {destination.country}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute right-3 top-3 z-10">
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shadow-sm",
              isFeatured ? "bg-white/95 text-foreground" : "bg-white/95 dark:bg-[#101914]/90 text-foreground",
            )}>
              <Star className="size-3 fill-warning-text text-warning-text" aria-hidden="true" />
              {destination.rating.toFixed(1)}
            </span>
          </div>

          {/* Wishlist button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveToggle();
                }}
                aria-pressed={saved}
                aria-label={saved ? `Remove ${destination.city} from saved` : `Save ${destination.city}`}
                className={cn(
                  "absolute right-3 bottom-3 z-10 rounded-full p-1.5 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  saved
                    ? "bg-primary text-primary-foreground"
                    : "bg-black/60 text-white hover:bg-black/80",
                )}
              >
                <Bookmark
                  className={cn("size-4", saved && "fill-current")}
                  aria-hidden="true"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center">
              {saved ? "Saved" : "Save for later"}
            </TooltipContent>
          </Tooltip>

          {/* Add to Trip dropdown */}
          {(tripOptions.length > 0 || onAddToTrip) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      aria-label={`Add ${destination.city} to a trip`}
                      className={cn(
                        "absolute left-3 bottom-3 z-10 rounded-full p-1.5 transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                        isFeatured ? "bg-white/20 text-white backdrop-blur-sm" : "bg-black/60 text-white hover:bg-black/80",
                      )}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Add to Trip
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onSelect={() => handleAddToTripClick()}
                  className="flex items-center gap-2"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {onAddToTrip ? "Add to Trip" : "Create New Trip"}
                </DropdownMenuItem>
                {tripOptions.length > 0 && (
                  <>
                    <DropdownMenuItem disabled className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Your Trips
                    </DropdownMenuItem>
                    {tripOptions.slice(0, 5).map((trip) => (
                      <DropdownMenuItem
                        key={trip.id}
                        className="flex flex-col gap-1 p-2"
                        onSelect={() => {/* Handle day selection in real implementation */}}
                      >
                        <Link
                          to={`/trips/${trip.id}/itinerary`}
                          className="font-medium text-foreground hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {trip.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {trip.startDate} – {trip.endDate} · {trip.days.length} days
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {tripOptions.length === 0 && !onAddToTrip && (
                  <DropdownMenuItem disabled className="text-center text-muted-foreground py-2">
                    No trips yet. Create one first!
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Bottom metadata for featured */}
          {isFeatured && (
            <div className="absolute inset-x-3 bottom-4 z-10 translate-y-1 transition-transform duration-300 group-hover:translate-y-0">
              <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                {destination.city}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-white/80">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {destination.country}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {destination.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {!isFeatured && (
          <div className={cn("flex flex-1 flex-col p-4", isCompact && "p-3")}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link
                to={`/explore/destinations/${destination.id}`}
                className="font-semibold text-foreground truncate hover:underline"
                onClick={(e) => {
                  if (onClick) {
                    e.preventDefault();
                    onClick();
                  }
                }}
              >
                {destination.city}
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="font-medium text-foreground">{destination.city}</span>
              <span>{destination.country}</span>
            </div>

            {destination.description && (
              <p className="text-pretty flex-1 text-sm leading-relaxed text-muted-foreground mb-3 line-clamp-2">
                {destination.description}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Categories">
              {destination.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-subtle-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </span>
              ))}
            </div>

            {/* Match reasons */}
            {showMatchReasons && destination.matchReasons?.length && (
              <div className="mb-3 flex flex-wrap gap-1">
                {destination.matchReasons.map((reason) => (
                  <span
                    key={reason}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    <span className="size-2.5 rounded-full bg-primary" aria-hidden="true" />
                    {reason.charAt(0).toUpperCase() + reason.slice(1)}
                  </span>
                ))}
              </div>
            )}

            {/* Info row */}
            <div className="mt-auto flex items-center justify-between border-t border-subtle-border pt-3">
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Star className="size-4 fill-warning-text text-warning-text" aria-hidden="true" />
                {destination.rating.toFixed(1)}
                <span className="text-xs font-normal text-muted-foreground">
                  ({destination.reviews.toLocaleString()})
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                from <strong className="font-semibold text-foreground">{estimatedBudget}</strong>
              </span>
            </div>

            {/* Primary action */}
            <div className="mt-3">
              <Button
                asChild
                className="w-full"
                variant={isCompact ? "outline" : "default"}
              >
                <Link to={`/explore/destinations/${destination.id}`}>
                  <ExternalLink className="size-4 mr-2" aria-hidden="true" />
                  Explore Destination
                </Link>
              </Button>
            </div>
          </div>
        )}
      </article>
  );
}

/**
 * Compact destination card for lists and sidebars
 */
export function DestinationCardCompact({
  destination,
  saved,
  onSaveToggle,
  onClick,
}: {
  destination: ExploreDestination;
  saved?: boolean;
  onSaveToggle?: () => void;
  onClick?: () => void;
}) {
  return (
    <Link
      to={`/explore/destinations/${destination.id}`}
      className="group relative flex items-center gap-3 rounded-xl border border-subtle-border bg-card p-2 transition-colors hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
    >
      <img
        src={destination.image}
        alt={destination.imageAlt}
        width="64"
        height="64"
        className="size-16 shrink-0 rounded-lg object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground truncate">{destination.city}</p>
        <p className="text-xs text-muted-foreground truncate">{destination.country}</p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="size-3 fill-warning-text text-warning-text" aria-hidden="true" />
          <span>{destination.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({destination.reviews.toLocaleString()})</span>
        </div>
      </div>
      {onSaveToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSaveToggle();
          }}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save"}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <Bookmark
            className={cn("size-4", saved && "fill-current")}
            aria-hidden="true"
          />
        </button>
      )}
    </Link>
  );
}