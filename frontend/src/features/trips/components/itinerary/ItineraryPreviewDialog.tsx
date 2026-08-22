import { Clock3, Coins, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ItineraryActivity, ItineraryDay, ItineraryRecord } from "@/features/trips/itinerary.types";
import { describeDate, summarizeDay, sortDayActivities } from "@/features/trips/itinerary.utils";
import { activityDurationLabel } from "@/features/trips/itinerary.utils";
import { formatMoney } from "@/features/trips/trips.utils";
import { categoryAccentClass } from "@/features/trips/itinerary.data";
import { cn } from "@/lib/utils";
import { ResponsiveModal } from "./ResponsiveModal";
import { PreviewStats } from "./ItinerarySummary";

interface ItineraryPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ItineraryRecord;
  currency: string;
}

export function ItineraryPreviewDialog({
  open,
  onOpenChange,
  record,
  currency,
}: ItineraryPreviewDialogProps) {
  const { days, activities } = record;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Itinerary preview"
      description="Exactly what your trip looks like today."
      className="max-w-2xl"
    >
      <div className="space-y-5">
        <PreviewStats record={record} currency={currency} />

        <ol className="space-y-4">
          {days.map((day, index) => {
            const dayActivities = sortDayActivities(activities, day.id);
            const summary = summarizeDay(activities, day.id);
            return (
              <li
                key={day.id}
                className="rounded-xl border border-border bg-card p-3 sm:p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    Day {index + 1} ·{" "}
                    {describeDate(day.date)?.fullDate ?? day.date}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {summary.activityCount} activities ·{" "}
                    {activityDurationLabel(
                      dayActivities[0]?.startTime ?? "",
                      dayActivities[dayActivities.length - 1]?.endTime ?? "",
                    ) || "Free day"} · ≈{" "}
                    {formatMoney(summary.costInr, currency)}
                  </p>
                </div>

                {dayActivities.length === 0 ? (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    Nothing planned yet.
                  </p>
                ) : (
                  <ol className="mt-2 space-y-2">
                    {dayActivities.map((activity) => (
                      <li key={activity.id} className="flex gap-2.5 text-sm">
                        <span className="w-20 shrink-0 pt-0.5 text-right text-xs tabular-nums text-muted-foreground">
                          {activity.startTime}–{activity.endTime}
                        </span>
                        <div className="min-w-0 border-l-2 border-subtle-border pl-2.5">
                          <p className="font-medium text-foreground">{activity.name}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            <Badge
                              variant="outline"
                              className={cn("px-1.5 py-0 text-[10px]", categoryAccentClass(activity.category))}
                            >
                              <span className="capitalize">{activity.category}</span>
                            </Badge>
                            {activity.location ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" aria-hidden="true" />
                                {activity.location}
                              </span>
                            ) : null}
                            {activity.estimatedCostInr > 0 ? (
                              <span className="inline-flex items-center gap-1 text-budget">
                                <Coins className="h-3 w-3" aria-hidden="true" />
                                {formatMoney(activity.estimatedCostInr, currency)}
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3 w-3" aria-hidden="true" />
                              {activityDurationLabel(activity.startTime, activity.endTime) ?? "—"}
                            </span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                {day.notes ? (
                  <p className="mt-3 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs italic text-secondary-text">
                    “{day.notes}”
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </ResponsiveModal>
  );
}