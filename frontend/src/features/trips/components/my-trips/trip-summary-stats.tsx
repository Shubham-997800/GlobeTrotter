import {
  BadgeCheck,
  CalendarClock,
  Compass,
  Luggage,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatDef {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Icon chip colors from travel-entity tokens (theme.md §09). */
  iconClass: string;
  context: (value: number) => string | null;
}

/**
 * Summary metrics derived entirely from shared trip-count logic —
 * the same numbers the tabs and highlight use.
 */
export function TripSummaryStats({
  counts,
}: {
  counts: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
  };
}) {
  const { total, upcoming, ongoing, completed } = counts;

  const stats: StatDef[] = [
    {
      key: "total",
      label: "Total Trips",
      icon: Luggage,
      iconClass: "bg-primary/15 text-primary",
      context: () => (total === 0 ? "Start planning" : "Across all statuses"),
    },
    {
      key: "upcoming",
      label: "Upcoming",
      icon: CalendarClock,
      iconClass: "bg-info-bg text-info-text",
      context: () =>
        upcoming === 0
          ? "Nothing booked yet"
          : upcoming === 1
            ? "1 adventure ahead"
            : `${upcoming} adventures ahead`,
    },
    {
      key: "ongoing",
      label: "Ongoing",
      icon: Compass,
      iconClass: "bg-success-bg text-success-text",
      context: () => (ongoing > 0 ? "Happening now" : null),
    },
    {
      key: "completed",
      label: "Completed",
      icon: BadgeCheck,
      iconClass: "bg-muted text-secondary-text",
      context: () =>
        total > 0 && completed > 0
          ? `${Math.round((completed / total) * 100)}% of your trips`
          : null,
    },
  ];

  return (
    <section aria-label="Trip summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm sm:p-4"
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              stat.iconClass,
            )}
          >
            <stat.icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xl font-bold leading-tight tracking-tight text-foreground">
              {counts[stat.key as keyof typeof counts]}
            </p>
            <p className="truncate text-xs font-medium text-secondary-text">
              {stat.label}
            </p>
            {stat.context(counts[stat.key as keyof typeof counts]) ? (
              <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                {stat.context(counts[stat.key as keyof typeof counts])}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
