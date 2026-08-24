import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Star } from "lucide-react";

import { SafeImg } from "@/components/ui/safe-img";
import type { Destination } from "@/features/dashboard/dashboard.types";
import { cn } from "@/lib/utils";

const CATEGORY_FILTERS = [
  { id: "trending", label: "Trending" },
  { id: "beaches", label: "Beaches" },
  { id: "mountains", label: "Mountains" },
  { id: "cities", label: "Cities" },
  { id: "adventure", label: "Adventure" },
] as const;

type CategoryId = (typeof CATEGORY_FILTERS)[number]["id"];

interface PopularDestinationsProps {
  destinations: Destination[];
  savedIds: string[];
  onToggleSaved: (id: string) => void;
}

function formatReviews(reviews: number): string {
  return reviews >= 1000
    ? `${(reviews / 1000).toFixed(1)}k`
    : `${reviews}`;
}

export function PopularDestinations({
  destinations,
  savedIds,
  onToggleSaved,
}: PopularDestinationsProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("trending");
  const visible = destinations.filter((d) => d.category === activeCategory);

  return (
    <section aria-labelledby="popular-destinations-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="popular-destinations-heading"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            Popular Destinations
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Loved by travelers worldwide
          </p>
        </div>
        <Link
          to="/explore"
          className="shrink-0 rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Explore All
        </Link>
      </div>

      {/* Category filter tabs */}
      <div
        role="tablist"
        aria-label="Filter destinations by category"
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORY_FILTERS.map((filter) => {
          const selected = filter.id === activeCategory;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveCategory(filter.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-primary text-white shadow-sm"
                  : "border border-subtle-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((destination) => {
          const saved = savedIds.includes(destination.id);
          return (
            <li key={destination.id} className="list-none">
              <article className="group relative h-full overflow-hidden rounded-xl border border-subtle-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SafeImg
                    src={destination.image}
                    alt={destination.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Bookmark */}
                  <button
                    type="button"
                    onClick={() => onToggleSaved(destination.id)}
                    aria-pressed={saved}
                    aria-label={
                      saved
                        ? `Remove ${destination.city} from saved destinations`
                        : `Save ${destination.city} for later`
                    }
                    className="absolute right-2 top-2 z-20 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Bookmark
                      className={cn("size-3.5", saved && "fill-current")}
                      aria-hidden="true"
                    />
                  </button>
                  {/* Whole-card link */}
                  <Link
                    to="/explore"
                    className="absolute inset-0 z-10 rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="sr-only">
                      View {destination.city}, {destination.country}
                    </span>
                  </Link>
                </div>

                <div className="p-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-secondary-text">
                    {destination.country}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-foreground">
                    {destination.city}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {destination.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between border-t border-subtle-border pt-2.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                      <Star
                        className="size-3.5 fill-warning-text text-warning-text"
                        aria-hidden="true"
                      />
                      {destination.rating.toFixed(1)}
                      <span className="font-normal text-secondary-text">
                        ({formatReviews(destination.reviews)})
                      </span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      from{" "}
                      <strong className="font-semibold text-foreground">
                        ₹{destination.estimatedBudgetInr.toLocaleString("en-IN")}
                      </strong>
                    </span>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
