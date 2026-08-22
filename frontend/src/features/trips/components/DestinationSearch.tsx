import { useId, useRef, useState } from "react";
import { ChevronDown, Loader2, MapPin, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDestinationSearch } from "../useTrips";
import type { Destination } from "../trips.types";
import { cn } from "@/lib/utils";

interface DestinationSearchProps {
  /** Currently selected destination, or null when nothing is picked. */
  selected: Destination | null;
  onSelect: (destination: Destination) => void;
  onClear: () => void;
  error?: string;
  disabled?: boolean;
  /** Overrides so other features (e.g. day editor) can reuse the field. */
  fieldId?: string;
  label?: string;
  placeholder?: string;
  /** Renders visually hidden label text (for tight layouts). */
  hideLabel?: boolean;
}

const DEBOUNCE_MS = 300;

/**
 * Accessible combobox for destination search: debounced catalog query,
 * ARIA listbox semantics and keyboard navigation
 * (↑/↓ move, Enter select, Esc close). Selection renders as a chip so
 * it survives closing the popover.
 */
export function DestinationSearch({
  selected,
  onSelect,
  onClear,
  error,
  disabled,
  fieldId = "trip-destination",
  label = "Where to?",
  placeholder,
  hideLabel = false,
}: DestinationSearchProps) {
  const listboxId = useId();
  const errorId = `${fieldId}-error`;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { data: results = [], isFetching } = useDestinationSearch(
    debouncedQuery,
    open && !selected,
  );

  const handleQueryChange = (next: string) => {
    setQuery(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(next), DEBOUNCE_MS);
    setActiveIndex(-1);
  };

  const selectDestination = (destination: Destination) => {
    onSelect(destination);
    setOpen(false);
    setQuery("");
    setDebouncedQuery("");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        if (open && results[activeIndex]) {
          event.preventDefault();
          selectDestination(results[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </Label>

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={fieldId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          placeholder={placeholder ?? (selected ? selected.city : "Search cities or countries…")}
          className="pl-9 pr-16"
          value={query}
          disabled={disabled}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
        />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isFetching ? (
            <Loader2
              aria-hidden="true"
              className="h-4 w-4 animate-spin text-muted-foreground"
            />
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </div>

        {open && !selected ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Destinations"
            className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-lg"
          >
            {query.trim() === "" ? (
              <li
                role="option"
                aria-selected="false"
                className="cursor-default px-3 py-6 text-center text-sm text-muted-foreground"
              >
                Start typing to search destinations
              </li>
            ) : isFetching && results.length === 0 ? (
              <li
                role="option"
                aria-selected="false"
                className="cursor-default px-3 py-6 text-center text-sm text-muted-foreground"
              >
                Searching…
              </li>
            ) : results.length === 0 ? (
              <li
                role="option"
                aria-selected="false"
                className="cursor-default px-3 py-6 text-center text-sm text-muted-foreground"
              >
                No destinations match “{query}”. Try another spelling.
              </li>
            ) : (
              results.map((destination, index) => (
                <li
                  key={destination.id}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectDestination(destination)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm",
                    index === activeIndex && "bg-hover",
                  )}
                >
                  <img
                    src={destination.image}
                    alt=""
                    loading="lazy"
                    className="h-10 w-14 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {destination.city}
                      <span className="font-normal text-muted-foreground">
                        , {destination.country}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      ★ {destination.rating.toFixed(1)} ·{" "}
                      {destination.reviews.toLocaleString()} reviews
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      {/* Selection chip */}
      <div aria-live="polite" className="min-h-8 pt-0.5">
        {selected ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-subtle-border bg-muted py-1 pl-1 pr-1.5">
            <img
              src={selected.image}
              alt=""
              loading="lazy"
              className="h-6 w-8 rounded-full object-cover"
            />
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
            <span className="max-w-52 truncate text-sm font-medium text-foreground">
              {selected.city}, {selected.country}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              disabled={disabled}
              aria-label={`Remove ${selected.city} from trip`}
              onClick={() => {
                onClear();
                setQuery("");
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </span>
        ) : null}
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
