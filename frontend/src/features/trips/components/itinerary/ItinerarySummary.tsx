import { CalendarDays, Clock3, Coins, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ItineraryRecord } from "@/features/trips/itinerary.types";
import { itineraryTotals, totalDurationLabel } from "@/features/trips/itinerary.utils";
import { formatMoney } from "@/features/trips/trips.utils";

interface ItinerarySummaryProps {
  days: any[];
  currency: string;
}

export function ItinerarySummary({ days, currency }: ItinerarySummaryProps) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
      <div className="rounded-xl border border-subtle-border bg-card px-3 py-2.5 shadow-sm">
        <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
          Trip length
        </dt>
        <dd className="mt-1 truncate text-lg font-semibold tabular-nums text-foreground">
          {days.length} {days.length === 1 ? "day" : "days"}
        </dd>
      </div>
      <div className="rounded-xl border border-subtle-border bg-card px-3 py-2.5 shadow-sm">
        <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
          Total time
        </dt>
        <dd className="mt-1 truncate text-lg font-semibold tabular-nums text-foreground">
          —
        </dd>
      </div>
      <div className="rounded-xl border border-subtle-border bg-card px-3 py-2.5 shadow-sm">
        <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Coins className="h-3.5 w-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
          Est. total
        </dt>
        <dd className="mt-1 truncate text-lg font-semibold tabular-nums text-foreground">
          —
        </dd>
      </div>
      <div className="rounded-xl border border-subtle-border bg-card px-3 py-2.5 shadow-sm">
        <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
          Planned days
        </dt>
        <dd className="mt-1 truncate text-lg font-semibold tabular-nums text-foreground">
          —
        </dd>
      </div>
    </dl>
  );
}

export function PreviewStats({ record, currency }: { record: ItineraryRecord; currency: string }) {
  const totals = itineraryTotals(record);
  const plannedDays = record.days.filter((day) =>
    record.activities.some((a) => a.dayId === day.id)
  ).length;

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="secondary">{totals.totalActivities} activities</Badge>
      <Badge variant="secondary">{totalDurationLabel(totals.totalDurationMinutes)}</Badge>
      <Badge variant="secondary">≈ {formatMoney(totals.totalCostInr, currency)}</Badge>
      <Badge variant="outline">
        {plannedDays}/{record.days.length} days planned
      </Badge>
    </div>
  );
}