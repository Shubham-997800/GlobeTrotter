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

const ICON_COLORS = [
  "bg-primary/10 text-primary",
  "bg-travel-blue/10 text-travel-blue",
  "bg-activity/10 text-activity",
  "bg-budget/10 text-budget",
];

export function TravelInsights() {
  return (
    <section aria-labelledby="insights-heading">
      <div className="mb-3">
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
      <dl className="grid grid-cols-2 gap-3">
        {insights.map((insight, index) => {
          const Icon = INSIGHT_ICONS[index % INSIGHT_ICONS.length];
          const up = insight.trendDirection === "up";
          return (
            <div
              key={insight.id}
              className="rounded-xl border border-subtle-border bg-card p-4 transition-colors hover:bg-hover"
            >
              <dt className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    ICON_COLORS[index % ICON_COLORS.length],
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {insight.label}
                </span>
              </dt>
              <dd className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {insight.value}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                    up
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {up ? (
                    <ArrowUpRight className="size-3" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="size-3" aria-hidden="true" />
                  )}
                  {up ? "Up" : "Down"}
                </span>
              </dd>
              <p className="mt-1 text-xs text-muted-foreground">
                {insight.trend}
              </p>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
