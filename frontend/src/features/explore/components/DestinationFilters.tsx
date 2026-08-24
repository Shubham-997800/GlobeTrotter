import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarRange, Filter, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ExploreFilters, RegionId, BudgetTierFilter, DurationFilter, SortOption } from "../explore.types";
import { regions, budgetFilters, durationFilters, sortOptions } from "../explore.data";
import { activeFilterCount as computeActiveFilterCount } from "../explore.service";

interface DestinationFiltersBarProps {
  filters: ExploreFilters;
  onFiltersChange: (patch: Partial<ExploreFilters>) => void;
  onClearAll: () => void;
  /** Mobile: open bottom sheet; Desktop: inline bar */
  mobileSheet?: boolean;
}

export function DestinationFiltersBar({
  filters,
  onFiltersChange,
  onClearAll,
  mobileSheet = true,
}: DestinationFiltersBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync URL with filters
  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      next.delete("page"); // Reset pagination on filter change
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleFilterChange = useCallback(
    (patch: Partial<ExploreFilters>) => {
      onFiltersChange(patch);
      // Update URL params
      const params: Record<string, string | null> = {};
      if (patch.category !== undefined) params.category = patch.category === "all" ? null : patch.category;
      if (patch.region !== undefined) params.region = patch.region === "all" ? null : patch.region;
      if (patch.budget !== undefined) params.budget = patch.budget === "all" ? null : patch.budget;
      if (patch.duration !== undefined) params.duration = patch.duration === "all" ? null : patch.duration;
      if (patch.sort !== undefined) params.sort = patch.sort === "popular" ? null : patch.sort;
      updateParams(params);
    },
    [onFiltersChange, updateParams]
  );

  const handleClearAll = useCallback(() => {
    onClearAll();
    const next = new URLSearchParams(searchParams);
    for (const key of ["category", "region", "budget", "duration", "sort", "page"]) {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
    setSheetOpen(false);
  }, [onClearAll, searchParams, setSearchParams]);

  const activeFilterCount = computeActiveFilterCount(filters);

  // Desktop inline bar
  const desktopBar = (
    <div className="hidden flex-wrap items-center gap-3 lg:flex lg:items-center lg:justify-between">
      {/* Region filter */}
      <div className="space-y-1.5">
        <label htmlFor="filter-region" className="text-xs font-medium text-muted-foreground">
          Region
        </label>
        <Select
          value={filters.region}
          onValueChange={(value) => handleFilterChange({ region: value as RegionId | "all" })}
        >
          <SelectTrigger id="filter-region" className="w-[180px] sm:w-[200px]">
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.label} ({region.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget filter */}
      <div className="space-y-1.5">
        <label htmlFor="filter-budget" className="text-xs font-medium text-muted-foreground">
          Budget
        </label>
        <Select
          value={filters.budget}
          onValueChange={(value) => handleFilterChange({ budget: value as BudgetTierFilter | "all" })}
        >
          <SelectTrigger id="filter-budget" className="w-[160px] sm:w-[180px]">
            <SelectValue placeholder="Any budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any budget</SelectItem>
            {budgetFilters.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration filter */}
      <div className="space-y-1.5">
        <label htmlFor="filter-duration" className="text-xs font-medium text-muted-foreground">
          Duration
        </label>
        <Select
          value={filters.duration}
          onValueChange={(value) => handleFilterChange({ duration: value as DurationFilter | "all" })}
        >
          <SelectTrigger id="filter-duration" className="w-[160px] sm:w-[180px]">
            <CalendarRange className="mr-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <SelectValue placeholder="Any duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any duration</SelectItem>
            {durationFilters.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort filter */}
      <div className="space-y-1.5">
        <label htmlFor="filter-sort" className="text-xs font-medium text-muted-foreground">
          Sort
        </label>
        <Select
          value={filters.sort}
          onValueChange={(value) => handleFilterChange({ sort: value as SortOption })}
        >
          <SelectTrigger id="filter-sort" className="w-[160px] sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          <X className="size-4 mr-1" aria-hidden="true" />
          Clear all
        </Button>
      )}
    </div>
  );

  // Mobile sheet trigger + content
  const mobileTrigger = (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="flex-1 lg:hidden justify-between">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pb-2 text-left">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Narrow your discovery by region, budget, and trip duration.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-2">
          {/* Region */}
          <div className="space-y-2">
            <label htmlFor="mobile-region" className="text-sm font-medium text-foreground">
              Region
            </label>
            <Select
              value={filters.region}
              onValueChange={(value) => handleFilterChange({ region: value as RegionId | "all" })}
            >
              <SelectTrigger id="mobile-region" className="w-full">
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.label} ({region.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label htmlFor="mobile-budget" className="text-sm font-medium text-foreground">
              Budget
            </label>
            <Select
              value={filters.budget}
              onValueChange={(value) => handleFilterChange({ budget: value as BudgetTierFilter | "all" })}
            >
              <SelectTrigger id="mobile-budget" className="w-full">
                <SelectValue placeholder="Any budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any budget</SelectItem>
                {budgetFilters.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.label} — {b.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="mobile-duration" className="text-sm font-medium text-foreground">
              Trip Duration
            </label>
            <Select
              value={filters.duration}
              onValueChange={(value) => handleFilterChange({ duration: value as DurationFilter | "all" })}
            >
              <SelectTrigger id="mobile-duration" className="w-full">
                <CalendarRange className="mr-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <SelectValue placeholder="Any duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any duration</SelectItem>
                {durationFilters.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label htmlFor="mobile-sort" className="text-sm font-medium text-foreground">
              Sort By
            </label>
            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange({ sort: value as SortOption })}
            >
              <SelectTrigger id="mobile-sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="mt-6 flex-row gap-2 pb-0">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
          <Button className="flex-1" onClick={() => setSheetOpen(false)}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  if (mobileSheet) {
    return (
      <>
        {desktopBar}
        {mobileTrigger}
      </>
    );
  }

  return desktopBar;
}

/**
 * Filter summary badge - shows active filter count
 */
export function FilterSummary({
  activeCount,
  onClear,
}: {
  activeCount: number;
  onClear: () => void;
}) {
  if (activeCount === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
      <Filter className="size-3.5" aria-hidden="true" />
      <span>{activeCount} filter{activeCount > 1 ? "s" : ""} active</span>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear all filters"
        className="ml-1 rounded-full p-0.5 text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}