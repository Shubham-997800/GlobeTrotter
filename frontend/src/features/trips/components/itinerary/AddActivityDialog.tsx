import { useState } from "react";
import { CalendarPlus, Loader2, Plus, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActivitySuggestion } from "@/features/trips/trips.types";
import {
  ACTIVITY_FILTERS,
  type ItineraryDay,
} from "@/features/trips/itinerary.types";
import { useActivitySearch } from "@/features/trips/useItinerary";
import { FILTER_TO_CATALOG_CATEGORY, categoryAccentClass } from "@/features/trips/itinerary.data";
import { formatMoney } from "@/features/trips/trips.utils";
import { cn } from "@/lib/utils";
import { ActivityForm } from "./ActivityForm";
import { ActivitySearchPanel } from "./ActivitySearchPanel";
import { ResponsiveModal } from "./ResponsiveModal";
import type { ActivityFormValues } from "@/features/trips/schemas/itinerary.schema";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: ItineraryDay[];
  defaultDayId?: string;
  currency: string;
  isAdding: boolean;
  /** Catalog ids already on the timeline (dedupe + disabled state). */
  addedIds: Set<string>;
  onAddFromCatalog: (suggestion: ActivitySuggestion) => void;
  onAddCustom: (
    values: ActivityFormValues & { estimatedCostInr: number },
  ) => void;
}

const TAB_VALUES = ["search", "browse", "custom"] as const;
type TabValue = (typeof TAB_VALUES)[number];

/**
 * Add-activity surface with three paths — catalog search, category
 * browsing and a custom form. Dialog on desktop, sheet on mobile.
 */
export function AddActivityDialog({
  open,
  onOpenChange,
  days,
  defaultDayId,
  currency,
  isAdding,
  addedIds,
  onAddFromCatalog,
  onAddCustom,
}: AddActivityDialogProps) {
  const [tab, setTab] = useState<TabValue>("search");

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setTab("search");
      }}
      title="Add activity"
      description="Search the catalog or create your own."
      className="max-w-lg"
    >
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TabValue)}
        className="gap-4"
      >
        <TabsList aria-label="Ways to add an activity" className="grid w-full grid-cols-3">
          <TabsTrigger value="search">
            <Search className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Search
          </TabsTrigger>
          <TabsTrigger value="browse">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <ActivitySearchPanel
            currency={currency}
            isAdding={isAdding}
            addedIds={addedIds}
            onAdd={onAddFromCatalog}
          />
        </TabsContent>

        <TabsContent value="browse" className="space-y-3">
          <BrowsePanel
            currency={currency}
            isAdding={isAdding}
            addedIds={addedIds}
            onAdd={onAddFromCatalog}
          />
        </TabsContent>

        <TabsContent value="custom">
          <ActivityForm
            currency={currency}
            days={days}
            defaultDayId={defaultDayId}
            submitLabel={
              <>
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Add to day
              </>
            }
            pending={isAdding}
            onSubmit={onAddCustom}
            onCancel={() => onOpenChange(false)}
          />
        </TabsContent>
      </Tabs>
    </ResponsiveModal>
  );
}

interface BrowsePanelProps {
  currency: string;
  isAdding: boolean;
  addedIds: Set<string>;
  onAdd: (suggestion: ActivitySuggestion) => void;
}

function BrowsePanel({ currency, isAdding, addedIds, onAdd }: BrowsePanelProps) {
  const [filter, setFilter] = useState<(typeof ACTIVITY_FILTERS)[number]["id"]>("all");
  const catalogCategory = FILTER_TO_CATALOG_CATEGORY[filter] ?? "adventure";
  const search = useActivitySearch("", catalogCategory, filter !== "all");

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div
        role="group"
        aria-label="Filter suggestions by interest"
        className="flex flex-wrap gap-1.5"
      >
        {ACTIVITY_FILTERS.map((item) => {
          const active = item.id === filter;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary-subtle text-primary dark:bg-primary/20 dark:text-primary"
                  : "border-subtle-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="min-h-40 space-y-2">
        {search.isFetching ? (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading ideas…
          </p>
        ) : null}

        {!search.isFetching && (search.data ?? []).length === 0 ? (
          <div role="status" className="rounded-xl border border-dashed border-subtle-border px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">No ideas in this category</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try another filter or add a custom activity.
            </p>
          </div>
        ) : null}

        {(search.data ?? []).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-hover"
          >
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image ? (
                <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "inline-block rounded-full border px-1.5 py-0 text-[10px]",
                    categoryAccentClass(item.category),
                  )}
                >
                  <span className="capitalize">{item.category}</span>
                </span>
                ≈ {formatMoney(item.costInr, currency)} · {Math.round(item.durationHours * 60)} min
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onAdd(item)}
              disabled={isAdding || addedIds.has(item.id)}
              aria-label={`Add ${item.name} to the day`}
            >
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}