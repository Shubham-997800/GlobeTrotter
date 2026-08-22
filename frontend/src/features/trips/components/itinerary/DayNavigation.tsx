import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItineraryActivity, ItineraryDay } from "../../itinerary.types";
import { destinations } from "../../trips.data";
import { cn } from "@/lib/utils";
import { describeDate } from "../../itinerary.utils";

interface DayNavigationProps {
  days: ItineraryDay[];
  activities: ItineraryActivity[];
  selectedDayId: string;
  onSelect: (dayId: string) => void;
}

function cityFor(destinationId: string | null): string | null {
  if (!destinationId) return null;
  const match = destinations.find((d) => d.id === destinationId);
  return match ? match.city : null;
}

/**
 * Previous / next arrows, horizontally scrollable day tabs and a compact
 * day selector. Tabs show day number, date, city and activity count.
 */
export function DayNavigation({
  days,
  activities,
  selectedDayId,
  onSelect,
}: DayNavigationProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    days.findIndex((day) => day.id === selectedDayId),
  );
  const atFirst = selectedIndex <= 0;
  const atLast = selectedIndex >= days.length - 1;

  /* Keep the active tab visible when the selection changes. */
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedDayId]);

  if (days.length === 0) return null;

  const goPrevious = () => {
    if (!atFirst) onSelect(days[selectedIndex - 1].id);
  };
  const goNext = () => {
    if (!atLast) onSelect(days[selectedIndex + 1].id);
  };

  return (
    <nav aria-label="Trip days" className="flex items-center gap-1.5 sm:gap-2">
      {/* Previous */}
      <button
        type="button"
        onClick={goPrevious}
        disabled={atFirst}
        aria-label="Previous day"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-secondary-text transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Scrollable day tabs */}
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Select day"
        className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:gap-2"
      >
        {days.map((day, index) => {
          const info = describeDate(day.date);
          const city = cityFor(day.destinationId);
          const count = activities.filter((a) => a.dayId === day.id).length;
          const active = day.id === selectedDayId;
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-current={active ? "true" : undefined}
              data-active={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(day.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" && index < days.length - 1) {
                  event.preventDefault();
                  onSelect(days[index + 1].id);
                }
                if (event.key === "ArrowLeft" && index > 0) {
                  event.preventDefault();
                  onSelect(days[index - 1].id);
                }
              }}
              className={cn(
                "flex w-[7.25rem] shrink-0 snap-start flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary/40 bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-strong-border hover:bg-hover",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                Day {index + 1}
              </span>
              <span className="text-sm font-medium leading-tight text-foreground">
                {info?.shortDate ?? day.date}
              </span>
              <span className="flex w-full items-center gap-1 truncate text-[11px] text-muted-foreground">
                {city ? (
                  <>
                    <MapPin className="h-3 w-3 shrink-0 text-travel-blue" aria-hidden="true" />
                    <span className="truncate">{city}</span>
                  </>
                ) : (
                  <span className="italic">Not set</span>
                )}
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[10px] font-medium",
                  count > 0
                    ? "bg-primary-light text-primary dark:text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count === 0
                  ? "Empty"
                  : `${count} ${count === 1 ? "activity" : "activities"}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={goNext}
        disabled={atLast}
        aria-label="Next day"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-secondary-text transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Compact day selector */}
      <Select value={selectedDayId} onValueChange={onSelect}>
        <SelectTrigger
          aria-label="Jump to day"
          className="h-9 w-[6.5rem] shrink-0 sm:w-36"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {days.map((day, index) => (
            <SelectItem key={day.id} value={day.id}>
              Day {index + 1} · {describeDate(day.date)?.shortDate ?? day.date}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </nav>
  );
}
