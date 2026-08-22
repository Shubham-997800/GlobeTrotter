import { useState } from "react";
import { CalendarArrowDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ItineraryActivity, ItineraryDay } from "@/features/trips/itinerary.types";
import { describeDate } from "@/features/trips/itinerary.utils";
import { cn } from "@/lib/utils";
import { ResponsiveModal } from "./ResponsiveModal";

interface MoveActivityDialogProps {
  activity: ItineraryActivity | null;
  days: ItineraryDay[];
  isMutating: boolean;
  onMove: (dayId: string) => void;
  onOpenChange: (open: boolean) => void;
}

/** Pick a destination day for the chosen activity. */
export function MoveActivityDialog({
  activity,
  days,
  isMutating,
  onMove,
  onOpenChange,
}: MoveActivityDialogProps) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const open = Boolean(activity);
  const target = selectedDayId ?? activity?.dayId ?? null;

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectedDayId(null);
        onOpenChange(next);
      }}
      title="Move to another day"
      description={
        activity ? `Choose where “${activity.name}” should live.` : undefined
      }
      className="max-w-md"
    >
      <fieldset disabled={isMutating} className="space-y-4">
        <legend className="sr-only">Target day</legend>
        <ul role="radiogroup" aria-label="Target day" className="space-y-2">
          {days.map((day, index) => (
            <li key={day.id}>
              <button
                type="button"
                role="radio"
                aria-checked={target === day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  target === day.id
                    ? "border-primary bg-primary-subtle text-primary dark:bg-primary/20"
                    : "border-border bg-card hover:border-strong-border",
                )}
              >
                <span>
                  Day {index + 1} · {describeDate(day.date)?.shortDate ?? day.date}
                  {activity?.dayId === day.id ? (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      (current)
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedDayId(null);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!target || !activity || target === activity.dayId || isMutating}
            onClick={() => {
              if (target && activity && target !== activity.dayId) {
                onMove(target);
              }
            }}
          >
            {isMutating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Moving…
              </>
            ) : (
              <>
                <CalendarArrowDown className="h-4 w-4" aria-hidden="true" />
                Move activity
              </>
            )}
          </Button>
        </div>
      </fieldset>
    </ResponsiveModal>
  );
}