import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Luggage, MapPin, Search, Ticket, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { getSearchItems } from "@/features/dashboard/dashboard.data";
import type { SearchItem } from "@/features/dashboard/dashboard.types";
import { cn } from "@/lib/utils";

const GROUP_ORDER = ["Destinations", "Trips", "Activities"] as const;

const GROUP_ICONS: Record<SearchItem["group"], typeof MapPin> = {
  Destinations: MapPin,
  Trips: Luggage,
  Activities: Ticket,
};

const POPULAR_IDS = [
  "dest-kyoto",
  "dest-paris",
  "dest-bali-d",
  "trip-trip-japan",
  "act-mountain-hiking",
  "act-street-food-tour",
];

const MAX_PER_GROUP = 3;
const RECENT_KEY = "globetrotter.search.recent";
const MAX_RECENT = 5;

function readRecentSearches(): SearchItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(item: SearchItem): void {
  try {
    const existing = readRecentSearches().filter((r) => r.id !== item.id);
    const next = [item, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
}

export function GlobalSearch() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = useMemo(() => getSearchItems(), []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>(() =>
    readRecentSearches(),
  );

  /* Grouped results, capped per group. */
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matched = q
      ? allItems.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.sublabel?.toLowerCase().includes(q),
        )
      : allItems.filter((item) => POPULAR_IDS.includes(item.id));

    return GROUP_ORDER.map((group) => ({
      group,
      results: matched.filter((item) => item.group === group).slice(0, MAX_PER_GROUP),
    })).filter((entry) => entry.results.length > 0);
  }, [allItems, query]);

  const flatResults = useMemo(
    () => groups.flatMap((entry) => entry.results),
    [groups],
  );

  /* Stable id → flat position map for highlight bookkeeping. */
  const flatIndex = useMemo(
    () => new Map(flatResults.map((item, i) => [item.id, i])),
    [flatResults],
  );

  const hasQuery = query.trim().length > 0;

  /* Close when clicking outside the search container. */
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  /* Keep the highlight inside bounds whenever the result set changes. */
  function onQueryChange(next: string) {
    setQuery(next);
    setActiveIndex(-1);
    setOpen(true);
  }

  function select(item: SearchItem) {
    saveRecentSearch(item);
    setRecentSearches(readRecentSearches());
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    navigate(item.href);
  }

  function removeRecent(id: string) {
    try {
      const existing = readRecentSearches().filter((r) => r.id !== id);
      localStorage.setItem(RECENT_KEY, JSON.stringify(existing));
      setRecentSearches(existing);
    } catch {
      // storage unavailable
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!flatResults.length) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        setOpen(true);
        setActiveIndex((prev) => (prev + 1) % flatResults.length);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        setOpen(true);
        setActiveIndex(
          (prev) =>
            (prev - 1 + flatResults.length) % flatResults.length,
        );
        break;
      }
      case "Home": {
        event.preventDefault();
        setActiveIndex(0);
        break;
      }
      case "End": {
        event.preventDefault();
        setActiveIndex(flatResults.length - 1);
        break;
      }
      case "Enter": {
        event.preventDefault();
        const next =
          activeIndex >= 0 ? activeIndex : 0;
        select(flatResults[next]);
        break;
      }
    }
  }

  const showRecent = !hasQuery && recentSearches.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <label htmlFor="global-search" className="sr-only">
        Search destinations, trips and activities
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id="global-search"
        ref={inputRef}
        type="search"
        autoComplete="off"
        placeholder="Search destinations, trips, activities…"
        className={cn(
          "rounded-full bg-muted/50 pl-9 pr-9",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
        role="combobox"
        aria-expanded={open}
        aria-controls="global-search-listbox"
        aria-autocomplete="list"
        aria-activedescendant={
          open && activeIndex >= 0 && flatResults[activeIndex]
            ? `gs-opt-${flatResults[activeIndex].id}`
            : undefined
        }
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {hasQuery ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {open ? (
        <div
          id="global-search-listbox"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[22rem] overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-lg shadow-black/5 dark:shadow-black/25"
        >
          {/* Recent searches */}
          {showRecent ? (
            <div className="py-1">
              <p className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-text">
                Recent searches
              </p>
              {recentSearches.map((item) => (
                <button
                  key={`recent-${item.id}`}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-hover"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(item)}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {item.label}
                    </span>
                    {item.sublabel ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.sublabel}
                      </span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={`Remove ${item.label} from recent searches`}
                    className="shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeRecent(item.id);
                    }}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </button>
              ))}
            </div>
          ) : null}

          {flatResults.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matches for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <>
              {!hasQuery && !showRecent ? (
                <p className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-text">
                  Popular right now
                </p>
              ) : null}
              {!hasQuery && showRecent ? null : null}
              {groups.map((entry) => (
                <div key={entry.group} className="py-1">
                  {hasQuery ? (
                    <p
                      id={`gs-group-${entry.group}`}
                      className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-text"
                    >
                      {entry.group}
                    </p>
                  ) : null}
                  {entry.results.map((item) => {
                    const itemIndex = flatIndex.get(item.id) ?? -1;
                    const isActive = itemIndex === activeIndex;
                    const Icon = GROUP_ICONS[item.group];
                    return (
                      <button
                        key={item.id}
                        id={`gs-opt-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                          isActive
                            ? "bg-active-nav text-primary"
                            : "hover:bg-hover",
                        )}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => select(item)}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-light dark:bg-primary/15">
                          <Icon className="size-4 text-primary" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {item.label}
                          </span>
                          {item.sublabel ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.sublabel}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <p aria-live="polite" className="sr-only">
                {flatResults.length} suggestion
                {flatResults.length === 1 ? "" : "s"} available
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
