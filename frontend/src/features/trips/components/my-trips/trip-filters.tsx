import { useState } from "react";
import { CalendarRange, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import type { DestinationOption } from "../../my-trips.logic";
import type {
  MyTripsDateFilterId,
  MyTripsFilters,
  MyTripsSortId,
} from "../../trips.types";

const DATE_OPTIONS: { value: MyTripsDateFilterId; label: string }[] = [
  { value: "all", label: "Any dates" },
  { value: "upcoming", label: "Upcoming" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

const SORT_OPTIONS: { value: MyTripsSortId; label: string }[] = [
  { value: "recent", label: "Recently created" },
  { value: "upcoming", label: "Upcoming first" },
  { value: "updated", label: "Recently updated" },
  { value: "alpha", label: "Alphabetical" },
];

export interface TripFiltersBarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  filters: MyTripsFilters;
  onFiltersChange: (patch: Partial<MyTripsFilters>) => void;
  onClearAll: () => void;
  destinationOptions: DestinationOption[];
  hasActiveFilters: boolean;
}

/** Search + date + destination + sort controls shared by desktop bar and the mobile sheet. */
function FilterControls({
  idPrefix,
  filters,
  onFiltersChange,
  destinationOptions,
}: Pick<
  TripFiltersBarProps,
  "filters" | "onFiltersChange" | "destinationOptions"
> & { idPrefix: string }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-country`}>Destination</Label>
        <Select
          value={filters.country || "all"}
          onValueChange={(value) =>
            onFiltersChange({ country: value === "all" ? "" : value })
          }
        >
          <SelectTrigger id={`${idPrefix}-country`} aria-label="Filter by country">
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {destinationOptions.map((option) => (
              <SelectItem key={option.country} value={option.country}>
                {option.country} ({option.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-date`}>Travel dates</Label>
        <Select
          value={filters.dateFilter}
          onValueChange={(value) =>
            onFiltersChange({ dateFilter: value as MyTripsDateFilterId })
          }
        >
          <SelectTrigger id={`${idPrefix}-date`} aria-label="Filter by travel dates">
            <CalendarRange className="mr-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="flex-1 text-left">
              {DATE_OPTIONS.find((o) => o.value === filters.dateFilter)?.label ??
                "Any dates"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {DATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filters.dateFilter === "custom" ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <Label
                htmlFor={`${idPrefix}-from`}
                className="text-xs font-normal text-muted-foreground"
              >
                From
              </Label>
              <Input
                id={`${idPrefix}-from`}
                type="date"
                value={filters.customRange?.from ?? ""}
                max={filters.customRange?.to || undefined}
                onChange={(event) =>
                  onFiltersChange({
                    customRange: {
                      from: event.target.value,
                      to: filters.customRange?.to ?? "",
                    },
                  })
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor={`${idPrefix}-to`}
                className="text-xs font-normal text-muted-foreground"
              >
                To
              </Label>
              <Input
                id={`${idPrefix}-to`}
                type="date"
                value={filters.customRange?.to ?? ""}
                min={filters.customRange?.from || undefined}
                onChange={(event) =>
                  onFiltersChange({
                    customRange: {
                      from: filters.customRange?.from ?? "",
                      to: event.target.value,
                    },
                  })
                }
                className="h-9"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-sort`}>Sort by</Label>
        <Select
          value={filters.sort}
          onValueChange={(value) => onFiltersChange({ sort: value as MyTripsSortId })}
        >
          <SelectTrigger id={`${idPrefix}-sort`} aria-label="Sort trips">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * One filter architecture, two presentations: a full inline bar on md+
 * and a bottom sheet behind a single "Filters" button on mobile.
 */
export function TripFiltersBar({
  searchInput,
  onSearchInputChange,
  filters,
  onFiltersChange,
  onClearAll,
  destinationOptions,
  hasActiveFilters,
}: TripFiltersBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activePresetLabel =
    DATE_OPTIONS.find((o) => o.value === filters.dateFilter)?.label ?? "";

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.country ? 1 : 0) +
    (filters.dateFilter !== "all" ? 1 : 0);

  return (
    <>
      {/* ── Desktop / tablet bar ─────────────────────────────── */}
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search trips, cities, countries…"
            aria-label="Search trips"
            className="pl-9 pr-8"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => onSearchInputChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <FilterControls
          idPrefix="desktop"
          filters={filters}
          onFiltersChange={onFiltersChange}
          destinationOptions={destinationOptions}
        />

        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {/* ── Mobile trigger + sheet ───────────────────────────── */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm" className="flex-1 justify-between">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
              </span>
              {activeCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {activeCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <SheetHeader className="pb-2 text-left">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow your journeys by destination and travel dates.
              </SheetDescription>
            </SheetHeader>

            <div className="relative pb-5">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                placeholder="Search trips…"
                aria-label="Search trips"
                className="pl-9 pr-8"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => onSearchInputChange("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-hover hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <FilterControls
              idPrefix="mobile"
              filters={filters}
              onFiltersChange={onFiltersChange}
              destinationOptions={destinationOptions}
            />

            <SheetFooter className="mt-6 flex-row gap-2 pb-0">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  onClearAll();
                  setSheetOpen(false);
                }}
              >
                Reset
              </Button>
              <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                Apply{activePresetLabel && filters.dateFilter !== "all" ? ` · ${activePresetLabel}` : ""}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className={cn("shrink-0")}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </>
  );
}
