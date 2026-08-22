import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

import { getRegionalPicks, regions } from "@/features/dashboard/dashboard.data";
import { cn } from "@/lib/utils";

export function RegionalSelections() {
  const [activeRegionId, setActiveRegionId] = useState(regions[0].id);
  const activeRegion = regions.find((r) => r.id === activeRegionId) ?? regions[0];
  const picks = getRegionalPicks(activeRegion.id);

  return (
    <section aria-labelledby="regional-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="regional-heading"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            Regional Selections
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Handpicked spots across the globe
          </p>
        </div>
        <Link
          to="/explore"
          className="inline-flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View All
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Region tabs */}
      <div
        role="tablist"
        aria-label="Filter destinations by region"
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {regions.map((region) => {
          const selected = region.id === activeRegionId;
          return (
            <button
              key={region.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveRegionId(region.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-primary text-white shadow-sm"
                  : "border border-subtle-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {region.label}
            </button>
          );
        })}
      </div>

      {/* Cards for the active region */}
      <div aria-live="polite">
        <p className="mt-3 text-sm italic text-secondary-text">
          {activeRegion.blurb}
        </p>
        <ul className="mt-3 flex snap-x gap-4 overflow-x-auto pb-2">
          {picks.map((destination) => (
            <li
              key={destination.id}
              className="w-64 shrink-0 snap-start list-none"
            >
              <Link
                to="/explore"
                className="group block overflow-hidden rounded-xl border border-subtle-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    <MapPin className="size-3" aria-hidden="true" />
                    {destination.country}
                  </span>
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    {destination.city}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {destination.description}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors group-hover:text-primary-hover">
                    Explore
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
