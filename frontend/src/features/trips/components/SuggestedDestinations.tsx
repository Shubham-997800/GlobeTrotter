import { useState } from "react";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuggestedDestinations } from "../useTrips";
import { interestLabel } from "../trips.data";
import { formatMoney } from "../trips.utils";
import type { Destination, InterestId } from "../trips.types";
import { cn } from "@/lib/utils";

type SuggestionFilter = "interests" | "budget" | "popular";

interface SuggestedDestinationsProps {
  interests: InterestId[];
  selectedId: string;
  onSelect: (destination: Destination) => void;
  disabled?: boolean;
}

const FILTER_TABS: { value: SuggestionFilter; label: string }[] = [
  { value: "interests", label: "Based on Interests" },
  { value: "budget", label: "Budget Friendly" },
  { value: "popular", label: "Popular" },
];

/** Horizontal rail of recommended destinations with filter tabs. */
export function SuggestedDestinations({
  interests,
  selectedId,
  onSelect,
  disabled,
}: SuggestedDestinationsProps) {
  const [filter, setFilter] =
    useState<SuggestionFilter>("interests");
  const suggestions = useSuggestedDestinations(filter, interests);

  return (
    <div>
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as SuggestionFilter)}
      >
        <TabsList aria-label="Suggestion filters">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div aria-live="polite" className="mt-4">
        {suggestions.isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-56 w-52 shrink-0 animate-pulse rounded-xl bg-muted"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : suggestions.data && suggestions.data.length > 0 ? (
          <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 pt-0.5 [scrollbar-width:thin]">
            {suggestions.data.slice(0, 6).map((destination) => (
              <li
                key={destination.id}
                className="w-52 shrink-0 snap-start"
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(destination)}
                  aria-pressed={destination.id === selectedId}
                  className={cn(
                    "group h-full w-full overflow-hidden rounded-xl border text-left transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    destination.id === selectedId
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border hover:border-strong-border hover:shadow-md",
                  )}
                >
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.imageAlt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {destination.id === selectedId ? (
                      <span className="absolute left-2 top-2">
                        <Badge className="bg-primary text-primary-foreground shadow">
                          Selected
                        </Badge>
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {destination.city}, {destination.country}
                    </p>
                    <p className="line-clamp-2 min-h-8 text-xs leading-snug text-muted-foreground">
                      {destination.description}
                    </p>
                    <p className="flex items-center justify-between pt-1 text-xs">
                      <span className="inline-flex items-center gap-1 font-medium text-warning-text">
                        <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        {destination.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ≈ {formatMoney(destination.estimatedDailyCostInr, "INR")}/day
                      </span>
                    </p>
                    <p className="flex flex-wrap gap-1 pt-0.5">
                      {destination.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="soft"
                          className="px-1.5 py-0 text-[10px]"
                        >
                          {interestLabel(tag)}
                        </Badge>
                      ))}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-strong-border p-6 text-center">
            <MapPin className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-foreground">
              No matches for this filter yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try another tab or search directly above.
            </p>
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Want more? Browse the full catalog in{" "}
        <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
          <Link to="/explore">Explore</Link>
        </Button>
        .
      </p>
    </div>
  );
}
