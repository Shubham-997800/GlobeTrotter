import { CalendarCog, Loader2 } from "lucide-react";

import type { ItineraryActivity } from "@/features/trips/itinerary.types";
import type { ItineraryDay } from "@/features/trips/itinerary.types";
import type { ActivityFormValues } from "@/features/trips/schemas/itinerary.schema";
import {
  ACTIVITY_DESCRIPTION_MAX,
  ACTIVITY_NAME_MAX,
} from "@/features/trips/schemas/itinerary.schema";
import { demoRateFromInr } from "@/features/trips/trips.data";
import { ResponsiveModal } from "./ResponsiveModal";
import { ActivityForm } from "./ActivityForm";

interface ActivityEditorDialogProps {
  activity: ItineraryActivity | null;
  days: ItineraryDay[];
  currency: string;
  isMutating: boolean;
  onSave: (values: ActivityFormValues & { estimatedCostInr: number }) => void;
  onOpenChange: (open: boolean) => void;
}

/** Edit an existing timeline entry. */
export function ActivityEditorDialog({
  activity,
  days,
  currency,
  isMutating,
  onSave,
  onOpenChange,
}: ActivityEditorDialogProps) {
  if (!activity) return null;

  const rate = demoRateFromInr[currency] ?? 1;
  const initialValues: Partial<ActivityFormValues> = {
    name: activity.name.slice(0, ACTIVITY_NAME_MAX),
    description: (activity.description ?? "").slice(0, ACTIVITY_DESCRIPTION_MAX),
    location: activity.location ?? "",
    dayId: activity.dayId,
    startTime: activity.startTime,
    endTime: activity.endTime,
    // Stored INR → shown in the trip currency, rounded for editing.
    estimatedCost:
      activity.estimatedCostInr > 0
        ? String(Math.round(activity.estimatedCostInr / rate))
        : "",
  };

  return (
    <ResponsiveModal
      open={Boolean(activity)}
      onOpenChange={onOpenChange}
      title="Edit activity"
      description="Update details or move it to another day."
      className="max-w-lg"
    >
      <ActivityForm
        key={`${activity.id}-${activity.dayId}`}
        currency={currency}
        days={days}
        initialValues={initialValues}
        submitLabel={
          <>
            {isMutating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CalendarCog className="h-4 w-4" aria-hidden="true" />
            )}
            Save changes
          </>
        }
        pending={isMutating}
        onSubmit={onSave}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveModal>
  );
}