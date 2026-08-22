import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  MapPinned,
  TicketCheck,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { insights } from "@/features/dashboard/dashboard.data";
import { cn } from "@/lib/utils";

const INSIGHT_ICONS: LucideIcon[] = [
  Trophy,
  MapPinned,
  TicketCheck,
  CalendarRange,
];

export function TravelInsights() {
  return (
    <section aria-labelledby="insights-heading">
      <div className="mb-4">
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
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {insights.map((insight, index) => {
          const Icon = INSIGHT_ICONS[index % INSIGHT_ICONS.length];
          const up = insight.trendDirection === "up";
          return (
            <div
              key={insight.id}
              className="rounded-2xl border border-subtle-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <dt className="flex items-center gap-2 text-xs font-medium text-secondary-text">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary-light dark:bg-primary/15">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                </span>
                {insight.label}
              </dt>
              <dd className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
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
              <p className="mt-1 text-xs text-secondary-text">{insight.trend}</p>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
