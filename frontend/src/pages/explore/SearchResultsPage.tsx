import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  X,
  Ticket,
  Globe,
  ArrowRight,
  Star,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DestinationCard } from "@/features/explore/components/DestinationCard";
import { SearchResultsSkeleton } from "@/features/explore/components/ExploreSkeletons";
import { NoResultsState, ErrorState } from "@/features/explore/components/ExploreEmptyStates";
import { useSearchResults, useSavedDestinationIds } from "@/features/explore/useExplore";
import type { ExploreActivity, PlaceCard } from "@/features/explore/explore.types";

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(query);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== query) {
      const next = new URLSearchParams(searchParams);
      if (debouncedQuery) next.set("q", debouncedQuery);
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }
  }, [debouncedQuery, query, searchParams, setSearchParams]);

  const { data: results, isLoading, isError, refetch } = useSearchResults(debouncedQuery, debouncedQuery.trim().length > 0);
  const { data: savedIds = [] } = useSavedDestinationIds();

  const handleAddToTrip = useCallback((id: string) => {
    const dest = results?.destinations.find((d) => d.id === id);
    if (dest) toast.info(`Add ${dest.city} to a trip — coming soon!`);
  }, [results]);

  // Group results
  const destinations = results?.destinations ?? [];
  const activities = results?.activities ?? [];
  const places = results?.places ?? [];

  const totalCount = destinations.length + activities.length + places.length;

  return (
    <div className="space-y-8">
      {/* ── Search Bar ── */}
      <div className="relative max-w-3xl mx-auto">
        <label htmlFor="search-results-input" className="sr-only">
          Search destinations, activities, places
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="search-results-input"
          type="search"
          autoComplete="off"
          placeholder="Search destinations, activities, places…"
          className="rounded-full bg-muted/50 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        />
        {searchInput ? (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchInput("")}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* ── Results Summary ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {debouncedQuery
              ? `Results for &ldquo;${debouncedQuery}&rdquo;`
              : "Search Destinations"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} result{totalCount !== 1 ? "s" : ""} found
            {destinations.length && <span> · {destinations.length} destination{destinations.length !== 1 ? "s" : ""}</span>}
            {activities.length && <span> · {activities.length} activit{activities.length !== 1 ? "ies" : "y"}</span>}
            {places.length && <span> · {places.length} place{places.length !== 1 ? "s" : ""}</span>}
          </p>
        </div>
        {debouncedQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchInput("")}>
            <X className="size-4 mr-1" aria-hidden="true" />
            Clear search
          </Button>
        )}
      </div>

      {/* ── Loading ── */}
      {isLoading ? (
        <SearchResultsSkeleton />
      ) : isError ? (
        <ErrorState
          title="Search failed"
          description="We couldn't complete your search. Please try again."
          onRetry={() => refetch()}
        />
      ) : totalCount === 0 ? (
        <NoResultsState query={debouncedQuery} />
      ) : (
        <>
          {/* ── Destinations ── */}
          {destinations.length > 0 && (
            <section aria-labelledby="search-destinations-heading" className="space-y-4">
              <h2 id="search-destinations-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="size-5 text-primary" aria-hidden="true" />
                Destinations <span className="text-sm font-normal text-muted-foreground">({destinations.length})</span>
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
                {destinations.map((destination) => (
                  <li key={destination.id}>
                    <DestinationCard
                      destination={destination}
                      saved={savedIds.includes(destination.id)}
                      onAddToTrip={handleAddToTrip}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Activities ── */}
          {activities.length > 0 && (
            <section aria-labelledby="search-activities-heading" className="space-y-4">
              <h2 id="search-activities-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
                <Ticket className="size-5 text-primary" aria-hidden="true" />
                Activities <span className="text-sm font-normal text-muted-foreground">({activities.length})</span>
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {activities.map((activity) => (
                  <li key={activity.id}>
                    <ActivityCardResult activity={activity} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Places ── */}
          {places.length > 0 && (
            <section aria-labelledby="search-places-heading" className="space-y-4">
              <h2 id="search-places-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
                <Globe className="size-5 text-primary" aria-hidden="true" />
                Places <span className="text-sm font-normal text-muted-foreground">({places.length})</span>
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {places.map((place) => (
                  <li key={place.id}>
                    <PlaceCardResult place={place} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ── Result Card Components ── */

function ActivityCardResult({ activity }: { activity: ExploreActivity }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-subtle-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={activity.image}
          alt={activity.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{activity.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {activity.durationHours}h
          </span>
          {activity.rating && (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-warning-text text-warning-text" aria-hidden="true" />
              {activity.rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden="true" />
            {activity.location}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-subtle-border pt-3">
          <span className="font-medium text-foreground">{activity.costInr.toLocaleString("en-IN")}</span>
          <Button asChild variant="outline" size="sm">
            <Link to={`/explore/destinations/${activity.city.toLowerCase()}`}>
              View Destination
              <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function PlaceCardResult({ place }: { place: PlaceCard }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-subtle-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={place.image}
          alt={place.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 text-white">
          <h3 className="font-semibold">{place.name}</h3>
          <p className="text-sm text-white/80">{place.category}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>
        <Button asChild variant="outline" size="sm" className="mt-3 w-full">
          <Link to={`/explore/destinations/${place.destinationId}?place=${place.id}`}>
            View Details
            <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export default SearchResultsPage;