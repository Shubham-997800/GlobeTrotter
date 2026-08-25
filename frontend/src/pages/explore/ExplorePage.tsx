import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Globe, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DestinationSearch } from "@/features/explore/components/DestinationSearch";
import { ExploreHero } from "@/features/explore/components/ExploreHero";
import { ExploreCategories, MobileCategoryPills } from "@/features/explore/components/ExploreCategories";
import { DestinationFiltersBar, FilterSummary } from "@/features/explore/components/DestinationFilters";
import { DestinationCard } from "@/features/explore/components/DestinationCard";
import { AddToTripDialog } from "@/features/explore/components/AddToTripDialog";
import {
  TrendingDestinationsSkeleton,
  DestinationGridSkeleton,
  HeroSkeleton,
} from "@/features/explore/components/ExploreSkeletons";
import { NoResultsState, ErrorState } from "@/features/explore/components/ExploreEmptyStates";
import {
  useTrendingDestinations,
  usePopularDestinations,
  useDestinationsByRegion,
  useDestinationsByCategory,
  useRecommendedDestinations,
  useSavedDestinationIds,
} from "@/features/explore/useExplore";
import { exploreDestinations, exploreActivities, regions } from "@/features/explore/explore.data";
import { activeFilterCount } from "@/features/explore/explore.service";
import type { ExploreFilters, ExploreDestination, CategoryFilter, RegionId, BudgetTierFilter, DurationFilter, SortOption } from "@/features/explore/explore.types";
import { useAuth } from "@/features/auth/useAuth";

const PAGE_SIZE = 12;

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const pageNum = Number.parseInt(searchParams.get("page") ?? "1", 10);
    return {
      query: searchParams.get("q") ?? "",
      category: (searchParams.get("category") as CategoryFilter | "all") ?? "all",
      region: (searchParams.get("region") as RegionId | "all") ?? "all",
      budget: (searchParams.get("budget") as BudgetTierFilter | "all") ?? "all",
      duration: (searchParams.get("duration") as DurationFilter | "all") ?? "all",
      sort: (searchParams.get("sort") as SortOption) ?? "popular",
      page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    };
  }, [searchParams]);

  const [searchInput, setSearchInput] = useState(params.query);
  const [debouncedQuery, setDebouncedQuery] = useState(params.query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedQuery !== params.query) {
      const next = new URLSearchParams(searchParams);
      if (debouncedQuery) next.set("q", debouncedQuery);
      else next.delete("q");
      next.delete("page");
      setSearchParams(next, { replace: true });
    }
  }, [debouncedQuery, params.query, searchParams, setSearchParams]);

  const filters: ExploreFilters = useMemo(
    () => ({
      category: params.category,
      region: params.region,
      budget: params.budget,
      duration: params.duration,
      sort: params.sort,
    }),
    [params],
  );

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.region !== "all" ||
    filters.budget !== "all" ||
    filters.duration !== "all" ||
    filters.sort !== "popular";

  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedQuery("");
    const next = new URLSearchParams(searchParams);
    for (const key of ["q", "category", "region", "budget", "duration", "sort", "page"]) {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const { user } = useAuth();
  const { data: savedIds = [] } = useSavedDestinationIds();
  const userInterests = user?.preferences?.interests ?? [];

  const trendingQuery = useTrendingDestinations(6);
  const popularQuery = usePopularDestinations(9);
  const regionQuery = useDestinationsByRegion(filters.region);
  const categoryQuery = useDestinationsByCategory(filters.category);
  const recommendedQuery = useRecommendedDestinations(userInterests, savedIds, 6);

  const allDestinations = useMemo(() => exploreDestinations, []);

  const filteredDestinations = useMemo(() => {
    let dests: ExploreDestination[];

    if (filters.region !== "all") {
      dests = regionQuery.data ?? [];
    } else if (filters.category !== "all") {
      dests = categoryQuery.data ?? [];
    } else if (debouncedQuery.trim()) {
      dests = allDestinations;
    } else {
      dests = allDestinations;
    }

    if (filters.category !== "all" && filters.region !== "all") {
      dests = dests.filter((d) => d.tags.includes(filters.category as any));
    }

    if (filters.budget !== "all") {
      dests = dests.filter((d) => {
        if (filters.budget === "budget") return d.estimatedDailyCostInr <= 5000;
        if (filters.budget === "moderate") return d.estimatedDailyCostInr > 5000 && d.estimatedDailyCostInr <= 12000;
        if (filters.budget === "premium") return d.estimatedDailyCostInr > 12000;
        return true;
      });
    }

    if (filters.duration !== "all") {
      dests = dests.filter((d) => {
        const days = parseInt(d.recommendedDuration.split("–")[0]) || 0;
        if (filters.duration === "weekend") return days <= 2;
        if (filters.duration === "3-5") return days >= 3 && days <= 5;
        if (filters.duration === "week") return days >= 6 && days <= 8;
        if (filters.duration === "2weeks") return days >= 10;
        return true;
      });
    }

    switch (filters.sort) {
      case "popular":
        dests.sort((a, b) => b.reviews - a.reviews);
        break;
      case "trending":
        dests.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0));
        break;
      case "recommended":
        dests.sort((a, b) => b.rating - a.rating);
        break;
      case "alphabetical":
        dests.sort((a, b) => a.city.localeCompare(b.city));
        break;
    }

    return dests;
  }, [filters, debouncedQuery, regionQuery.data, categoryQuery.data, allDestinations]);

  const totalPages = Math.max(1, Math.ceil(filteredDestinations.length / PAGE_SIZE));
  const currentPage = Math.min(params.page, totalPages);
  const paginatedDestinations = filteredDestinations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const isError = trendingQuery.isError || popularQuery.isError;

  const [addToTripOpen, setAddToTripOpen] = useState(false);
  const [addToTripDestinationId, setAddToTripDestinationId] = useState("");
  const [addToTripDestinationName, setAddToTripDestinationName] = useState("");

  const handleAddToTrip = useCallback((destinationId: string) => {
    const dest = exploreDestinations.find((d) => d.id === destinationId);
    if (dest) {
      setAddToTripDestinationId(dest.id);
      setAddToTripDestinationName(dest.city);
      setAddToTripOpen(true);
    }
  }, []);

  const featuredDestination = trendingQuery.data?.destinations[0] ?? exploreDestinations[0];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* ── Hero + Search ── */}
        <div className="relative z-10 rounded-3xl bg-gradient-to-br from-primary/5 via-travel-blue/5 to-background p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Globe className="size-3.5" aria-hidden="true" />
              Explore
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Where do you want to go?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover destinations and experiences for your next trip.
            </p>
            <div className="mx-auto mt-5 max-w-xl">
              <DestinationSearch
                initialValue={searchInput}
                onSearch={setSearchInput}
                placeholder="Search cities, countries or activities…"
              />
            </div>
            {/* Quick Stats */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                {exploreDestinations.length} destinations
              </span>
              <span>{exploreActivities.length} activities</span>
              <span>{new Set(exploreDestinations.map((d) => d.country)).size} countries</span>
            </div>
          </div>
        </div>

        {/* ── Featured Destination ── */}
        {trendingQuery.isLoading ? (
          <HeroSkeleton />
        ) : featuredDestination ? (
          <ExploreHero
            destination={featuredDestination}
            stats={{
              popularDestinations: exploreDestinations.length,
              activities: exploreActivities.length,
              countries: new Set(exploreDestinations.map((d) => d.country)).size,
            }}
          />
        ) : null}

        {/* ── Category Tabs ── */}
        <div className="space-y-3">
          <SectionHeader
            title="Browse by Category"
            description="Filter destinations by travel style"
          />
          <ExploreCategories
            activeCategory={params.category}
            onCategoryChange={(cat) => {
              const next = new URLSearchParams(searchParams);
              if (cat === "all") next.delete("category");
              else next.set("category", cat);
              next.delete("page");
              setSearchParams(next, { replace: true });
            }}
            variant="tabs"
          />
          <MobileCategoryPills
            activeCategory={params.category}
            onCategoryChange={(cat) => {
              const next = new URLSearchParams(searchParams);
              if (cat === "all") next.delete("category");
              else next.set("category", cat);
              next.delete("page");
              setSearchParams(next, { replace: true });
            }}
            className="lg:hidden"
          />
        </div>

        {/* ── Filters ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Filters</h2>
            {hasActiveFilters && (
              <FilterSummary activeCount={activeFilterCount(filters)} onClear={clearAllFilters} />
            )}
          </div>
          <DestinationFiltersBar
            filters={filters}
            onFiltersChange={(patch) => {
              const next = new URLSearchParams(searchParams);
              Object.entries(patch).forEach(([key, value]) => {
                if (value === "all" || value === undefined) next.delete(key);
                else next.set(key, value);
              });
              next.delete("page");
              setSearchParams(next, { replace: true });
            }}
            onClearAll={clearAllFilters}
          />
        </div>

        {/* ── Trending Now ── */}
        <section className="space-y-4">
          <SectionHeader
            title="Trending Now"
            description="Where travelers are heading right now"
            action={
              <Link to="/explore?sort=trending" className="text-sm font-medium text-primary hover:underline">
                View All
                <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
              </Link>
            }
          />
          {trendingQuery.isLoading ? (
            <TrendingDestinationsSkeleton />
          ) : (
            <DestinationGrid
              destinations={trendingQuery.data?.destinations ?? []}
              savedIds={savedIds}
              onAddToTrip={handleAddToTrip}
            />
          )}
        </section>

        {/* ── Popular Destinations ── */}
        <section className="space-y-4">
          <SectionHeader
            title="Popular Destinations"
            description="Most loved by the GlobeTrotter community"
            action={
              <Link to="/explore?sort=popular" className="text-sm font-medium text-primary hover:underline">
                View All
                <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
              </Link>
            }
          />
          {popularQuery.isLoading ? (
            <DestinationGridSkeleton count={9} />
          ) : (
            <DestinationGrid
              destinations={popularQuery.data ?? []}
              savedIds={savedIds}
              onAddToTrip={handleAddToTrip}
            />
          )}
        </section>

        {/* ── Destinations by Region ── */}
        {filters.region !== "all" && regionQuery.data && (
          <section className="space-y-4">
            <SectionHeader
              title={regions.find((r) => r.id === filters.region)?.label ?? "Region"}
              description={`Destinations in ${regions.find((r) => r.id === filters.region)?.label}`}
            />
            <DestinationGrid
              destinations={regionQuery.data}
              savedIds={savedIds}
              onAddToTrip={handleAddToTrip}
            />
          </section>
        )}

        {/* ── Recommended For You ── */}
        {user && recommendedQuery.data?.destinations && recommendedQuery.data.destinations.length > 0 && (
          <section className="space-y-4">
            <SectionHeader
              title="Recommended For You"
              description={`Based on your ${recommendedQuery.data.destinations[0]?.matchReasons?.length ? "interests" : "travel style"}`}
              action={
                <Link to="/explore?sort=recommended" className="text-sm font-medium text-primary hover:underline">
                  View All
                  <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
                </Link>
              }
            />
            <DestinationGrid
              destinations={recommendedQuery.data.destinations}
              savedIds={savedIds}
              onAddToTrip={handleAddToTrip}
            />
          </section>
        )}

        {/* ── All Destinations ── */}
        {filters.region === "all" && filters.category === "all" && !debouncedQuery && (
          <section className="space-y-4">
            <SectionHeader
              title="All Destinations"
              description="Explore everywhere GlobeTrotter can take you"
            />
            {paginatedDestinations.length === 0 ? (
              <NoResultsState
                onClearFilters={clearAllFilters}
                hasFilters={hasActiveFilters}
              />
            ) : (
              <>
                <DestinationGrid
                  destinations={paginatedDestinations}
                  savedIds={savedIds}
                  onAddToTrip={handleAddToTrip}
                />
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-2 pt-4">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set("page", String(currentPage + 1));
                        setSearchParams(next, { replace: true });
                      }}
                      disabled={currentPage >= totalPages}
                    >
                      Load More
                      <span className="text-xs text-muted-foreground">
                        ({filteredDestinations.length - paginatedDestinations.length} remaining)
                      </span>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Showing {paginatedDestinations.length} of {filteredDestinations.length} destinations
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ── Error State ── */}
        {isError && (
          <ErrorState
            title="Couldn't load destinations"
            description="We had trouble fetching destinations. Please try again."
            onRetry={() => {
              trendingQuery.refetch();
              popularQuery.refetch();
            }}
          />
        )}

        {/* ── Add to Trip Dialog ── */}
        <AddToTripDialog
          open={addToTripOpen}
          onOpenChange={setAddToTripOpen}
          destinationId={addToTripDestinationId}
          destinationName={addToTripDestinationName}
        />
      </div>
    </AppShell>
  );
}

function DestinationGrid({
  destinations,
  savedIds,
  onAddToTrip,
}: {
  destinations: ExploreDestination[];
  savedIds: string[];
  onAddToTrip: (id: string) => void;
}) {
  if (destinations.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No destinations found</p>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="list"
      aria-label="Destinations"
    >
      {destinations.map((destination) => (
        <li key={destination.id}>
          <DestinationCard
            destination={destination}
            saved={savedIds.includes(destination.id)}
            onAddToTrip={onAddToTrip}
          />
        </li>
      ))}
    </ul>
  );
}

export default ExplorePage;
