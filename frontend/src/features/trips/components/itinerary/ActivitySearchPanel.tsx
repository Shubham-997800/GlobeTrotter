import { useEffect, useState } from "react";
import { Clock, Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ActivitySuggestion } from "@/features/trips/trips.types";
import { useActivitySearch } from "@/features/trips/useItinerary";
import { itineraryService } from "@/features/trips/itinerary.service";
import { formatMoney } from "@/features/trips/trips.utils";
import { categoryAccentClass } from "@/features/trips/itinerary.data";
import { cn } from "@/lib/utils";

interface ActivitySearchPanelProps {
  currency: string;
  isAdding: boolean;
  onAdd: (suggestion: ActivitySuggestion) => void;
  addedIds: Set<string>;
}

export function ActivitySearchPanel({
  currency,
  isAdding,
  onAdd,
  addedIds,
}: ActivitySearchPanelProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [recents, setRecents] = useState<string[]>(() =>
    itineraryService.readRecentSearches(),
  );

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [query]);

  const search = useActivitySearch(debounced, "all", debounced.length > 0);
  const results = search.data ?? [];

  useEffect(() => {
    if (debounced.length >= 3 && !search.isFetching && results.length > 0) {
      const next = itineraryService.pushRecentSearch(debounced);
      setRecents(next);
    }
  }, [debounced, search.isFetching]);

  const showRecents = query.trim().length === 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="activity-search"
          placeholder="Try \u201Ctemple\u201D, \u201Csnorkeling\u201D, \u201Cmarket\u201D\u2026"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-describedby="activity-search-hint"
          autoComplete="off"
          className="pl-9 pr-9"
        />
        {query ? (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : null}
        <p id="activity-search-hint" className="sr-only">
          Results appear automatically while you type.
        </p>
      </div>

      {showRecents ? (
        <RecentSearches
          recents={recents}
          onPick={setQuery}
          onClear={() => {
            setRecents([]);
          }}
        />
      ) : null}

      <div aria-live="polite" className="min-h-40 space-y-2" role="listbox" aria-label="Search results">
        {search.isFetching ? (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Searching catalog\u2026
          </p>
        ) : null}

        {!search.isFetching && debounced.length > 0 && results.length === 0 ? (
          <div
            role="status"
            className="rounded-xl border border-dashed border-subtle-border px-4 py-8 text-center"
          >
            <p className="text-sm font-medium text-foreground">No matches found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different keyword, or create a custom activity instead.
            </p>
          </div>
        ) : null}

        {!showRecents &&
          results.map((item) => (
            <CatalogResultRow
              key={item.id}
              item={item}
              currency={currency}
              disabled={isAdding || addedIds.has(item.id)}
              alreadyAdded={addedIds.has(item.id)}
              onAdd={() => onAdd(item)}
            />
          ))}
      </div>
    </div>
  );
}

interface CatalogResultRowProps {
  item: ActivitySuggestion;
  currency: string;
  disabled: boolean;
  alreadyAdded: boolean;
  onAdd: () => void;
}

function CatalogResultRow({
  item,
  currency,
  disabled,
  alreadyAdded,
  onAdd,
}: CatalogResultRowProps) {
  return (
    <div
      role="option"
      aria-selected={alreadyAdded}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-hover"
    >
      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <Badge
            variant="outline"
            className={cn("px-1.5 py-0 text-[10px]", categoryAccentClass(item.category))}
          >
            <span className="capitalize">{item.category}</span>
          </Badge>
          <span>\u2248 {formatMoney(item.costInr, currency)}</span>
          <span>{Math.round(item.durationHours * 60)} min</span>
        </p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={onAdd}
        disabled={disabled}
        aria-label={`Add ${item.name} to the day`}
      >
        Add
      </Button>
    </div>
  );
}

function RecentSearches({
  recents,
  onPick,
  onClear,
}: {
  recents: string[];
  onPick: (value: string) => void;
  onClear: () => void;
}) {
  if (recents.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden="true" />
          Recent searches
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {recents.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => onPick(term)}
            className="rounded-full border border-subtle-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}