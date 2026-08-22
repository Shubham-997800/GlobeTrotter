import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSearchSuggestions } from "../useExplore";
import { readRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from "../explore.data";
import type { SearchSuggestion } from "../explore.types";

interface DestinationSearchProps {
  /** Initial search value from URL or parent state */
  initialValue?: string;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show the search as full-width on mobile */
  fullWidthMobile?: boolean;
}

export function DestinationSearch({
  initialValue = "",
  onSearch,
  placeholder = "Search destinations, activities, places…",
  fullWidthMobile = true,
}: DestinationSearchProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showRecent, setShowRecent] = useState(false);

  // Sync initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Fetch suggestions
  const { data: suggestions } = useSearchSuggestions(query, open && query.trim().length > 0);

  // Get recent searches from localStorage
  const recentSearches = useMemo(() => readRecentSearches(), [query]);

  // Build flat results array for keyboard navigation
  const flatResults = useMemo(() => {
    if (!suggestions) return [];
    return [
      ...suggestions.destinations.map((s) => ({ ...s, group: "destinations" as const })),
      ...suggestions.activities.map((s) => ({ ...s, group: "activities" as const })),
      ...suggestions.places.map((s) => ({ ...s, group: "places" as const })),
    ];
  }, [suggestions]);

  const totalResults = flatResults.length + recentSearches.length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Focus management
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleQueryChange = useCallback((next: string) => {
    setQuery(next);
    setActiveIndex(-1);
    setOpen(true);
    setShowRecent(next.trim().length === 0);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        return;
      }

      if (!totalResults) {
        if (event.key === "Enter") {
          event.preventDefault();
          if (query.trim()) {
            handleSearch(query.trim());
          }
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          setOpen(true);
          setActiveIndex((prev) => (prev + 1) % totalResults);
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          setOpen(true);
          setActiveIndex((prev) => (prev - 1 + totalResults) % totalResults);
          break;
        }
        case "Home": {
          event.preventDefault();
          setActiveIndex(0);
          break;
        }
        case "End": {
          event.preventDefault();
          setActiveIndex(totalResults - 1);
          break;
        }
        case "Enter": {
          event.preventDefault();
          const next = activeIndex >= 0 ? activeIndex : 0;
          if (next < flatResults.length) {
            selectResult(flatResults[next]);
          } else {
            const recentIndex = next - flatResults.length;
            if (recentSearches[recentIndex]) {
              selectRecentSearch(recentSearches[recentIndex].query);
            }
          }
          break;
        }
      }
    },
    [activeIndex, flatResults, query, recentSearches, totalResults]
  );

  const selectResult = (result: SearchSuggestion) => {
    setOpen(false);
    setActiveIndex(-1);
    addRecentSearch(result.label);
    if (result.href) {
      navigate(result.href);
    } else if (onSearch) {
      onSearch(result.label);
    }
  };

  const selectRecentSearch = (recentQuery: string) => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery(recentQuery);
    if (onSearch) {
      onSearch(recentQuery);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setOpen(false);
    setActiveIndex(-1);
    addRecentSearch(searchQuery);
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (event: React.MouseEvent, recentQuery: string) => {
    event.preventDefault();
    event.stopPropagation();
    removeRecentSearch(recentQuery);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
  };

  const hasQuery = query.trim().length > 0;
  const showDropdown = open && (hasQuery || showRecent);

  return (
    <div ref={containerRef} className={cn("relative w-full", fullWidthMobile && "max-w-xl sm:max-w-md lg:max-w-lg")}>
      <label htmlFor="destination-search" className="sr-only">
        {placeholder}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id="destination-search"
        ref={inputRef}
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        className={cn(
          "rounded-full bg-muted/50 pl-9 pr-9",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="destination-search-listbox"
        aria-autocomplete="list"
        aria-activedescendant={
          showDropdown && activeIndex >= 0 && activeIndex < flatResults.length
            ? `ds-opt-${flatResults[activeIndex].id}`
            : showDropdown && activeIndex >= flatResults.length && recentSearches[activeIndex - flatResults.length]
              ? `ds-recent-${activeIndex - flatResults.length}`
              : undefined
        }
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => {
          setOpen(true);
          setShowRecent(!hasQuery);
        }}
        onKeyDown={handleKeyDown}
      />
      {hasQuery ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleClear}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {showDropdown ? (
        <div
          id="destination-search-listbox"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[28rem] overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-lg shadow-black/5 dark:shadow-black/25"
        >
          {hasQuery ? (
            <>
              {flatResults.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matches for &ldquo;{query.trim()}&rdquo;
                </p>
              ) : (
                <>
                  {suggestions?.destinations.length && (
                    <div className="py-1">
                      <p
                        id="ds-group-destinations"
                        className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-text"
                      >
                        Destinations
                      </p>
                      {suggestions.destinations.map((item, idx) => {
                        const itemIndex = idx;
                        const isActive = itemIndex === activeIndex;
                        return (
                          <button
                            key={item.id}
                            id={`ds-opt-${item.id}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                              isActive
                                ? "bg-active-nav text-primary"
                                : "hover:bg-subtle-bg-hover",
                            )}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectResult({ ...item, group: "destinations" })}
                          >
                            {item.image && (
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-light dark:bg-primary/15 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{item.label}</span>
                              <span className="block truncate text-xs text-muted-foreground">{item.sublabel}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {suggestions?.activities.length && (
                    <div className="py-1">
                      <p
                        id="ds-group-activities"
                        className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-text"
                      >
                        Activities
                      </p>
                      {suggestions.activities.map((item, idx) => {
                        const itemIndex = (suggestions?.destinations.length ?? 0) + idx;
                        const isActive = itemIndex === activeIndex;
                        return (
                          <button
                            key={item.id}
                            id={`ds-opt-${item.id}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                              isActive
                                ? "bg-active-nav text-primary"
                                : "hover:bg-subtle-bg-hover",
                            )}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectResult({ ...item, group: "activities" })}
                          >
                            {item.image && (
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-light dark:bg-primary/15 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{item.label}</span>
                              <span className="block truncate text-xs text-muted-foreground">{item.sublabel}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {suggestions?.places.length && (
                    <div className="py-1">
                      <p
                        id="ds-group-places"
                        className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-text"
                      >
                        Places
                      </p>
                      {suggestions.places.map((item, idx) => {
                        const itemIndex =
                          (suggestions?.destinations.length ?? 0) + (suggestions?.activities.length ?? 0) + idx;
                        const isActive = itemIndex === activeIndex;
                        return (
                          <button
                            key={item.id}
                            id={`ds-opt-${item.id}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                              isActive
                                ? "bg-active-nav text-primary"
                                : "hover:bg-subtle-bg-hover",
                            )}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectResult({ ...item, group: "places" })}
                          >
                            {item.image && (
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-light dark:bg-primary/15 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{item.label}</span>
                              <span className="block truncate text-xs text-muted-foreground">{item.sublabel}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          ) : showRecent && recentSearches.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-3 pb-1 pt-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
                  Recent Searches
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearRecent}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="size-3.5 mr-1" aria-hidden="true" />
                  Clear all
                </Button>
              </div>
              {recentSearches.map((recent, idx) => {
                const itemIndex = flatResults.length + idx;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    key={recent.query}
                    id={`ds-recent-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                      isActive ? "bg-active-nav text-primary" : "hover:bg-subtle-bg-hover",
                    )}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectRecentSearch(recent.query)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{recent.query}</span>
                    </span>
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Remove ${recent.query} from recent searches`}
                      className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-colors"
                      onMouseDown={(e) => handleRemoveRecent(e, recent.query)}
                      onClick={(e) => handleRemoveRecent(e, recent.query)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </button>
                );
              })}
            </>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Start typing to discover destinations, activities, and places
            </p>
          )}

          <p aria-live="polite" className="sr-only">
            {totalResults} suggestion{totalResults === 1 ? "" : "s"} available
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Mobile search trigger that opens a full-screen sheet
 */
export function MobileDestinationSearch({
  onSearch,
  placeholder = "Search destinations, activities, places…",
}: { onSearch?: (query: string) => void; placeholder?: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 justify-start gap-2 lg:hidden"
          aria-label="Open search"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate text-sm text-muted-foreground">{placeholder}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90vh] p-0">
        <SheetHeader className="p-4 border-b border-subtle-border">
          <SheetTitle>Search</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <DestinationSearch
            onSearch={(query) => {
              onSearch?.(query);
              setSheetOpen(false);
            }}
            fullWidthMobile
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}