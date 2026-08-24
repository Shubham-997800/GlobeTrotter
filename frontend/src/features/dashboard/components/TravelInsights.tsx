import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  MapPinned,
  Plane,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { insights } from "@/features/dashboard/dashboard.data";
import { cn } from "@/lib/utils";

const INSIGHT_ICONS: LucideIcon[] = [
  Trophy,
  MapPinned,
  Plane,
  CalendarRange,
];

const CARD_COLORS = [
  "from-primary/5 to-primary/10 border-primary/20",
  "from-blue-500/5 to-blue-500/10 border-blue-500/20",
  "from-violet-500/5 to-violet-500/10 border-violet-500/20",
  "from-amber-500/5 to-amber-500/10 border-amber-500/20",
];

const ICON_COLORS = [
  "bg-primary/15 text-primary",
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
];

export function TravelInsights() {
  return (
    <section aria-labelledby="insights-heading">
      <div className="mb-5">
        <h2
          id="insights-heading"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          Travel Insights
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your journey, in numbers
        </p>
      </div>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {insights.map((insight, index) => {
          const Icon = INSIGHT_ICONS[index % INSIGHT_ICONS.length];
          const up = insight.trendDirection === "up";
          return (
            <div
              key={insight.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all hover:shadow-lg sm:p-6",
                CARD_COLORS[index % CARD_COLORS.length],
              )}
            >
              {/* Decorative circle */}
              <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/40 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/5" />

              <dt className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    ICON_COLORS[index % ICON_COLORS.length],
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {insight.label}
                </span>
              </dt>

              <dd className="mt-4 flex items-end justify-between">
                <span className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {insight.value}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                    up
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {up ? (
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="size-3.5" aria-hidden="true" />
                  )}
                  {up ? "Up" : "Down"}
                </span>
              </dd>

              <p className="mt-2 text-sm text-muted-foreground">
                {insight.trend}
              </p>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
