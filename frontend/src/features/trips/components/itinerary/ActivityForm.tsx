import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Clock3, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ItineraryDay } from "@/features/trips/itinerary.types";
import { describeDate } from "@/features/trips/itinerary.utils";
import {
  ACTIVITY_DESCRIPTION_MAX,
  ACTIVITY_NAME_MAX,
  activityFormSchema,
  emptyActivityForm,
  type ActivityFormValues,
} from "@/features/trips/schemas/itinerary.schema";
import { currencySymbol, demoRateFromInr } from "@/features/trips/trips.data";
import {
  activityDurationLabel,
  parseTime,
} from "@/features/trips/itinerary.utils";

interface ActivityFormProps {
  /** Trip-currency symbol shown inside the cost field. */
  currency: string;
  days: ItineraryDay[];
  defaultDayId?: string;
  initialValues?: Partial<ActivityFormValues>;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: ActivityFormValues & { estimatedCostInr: number }) => void;
  onCancel: () => void;
}

type FieldErrors = Partial<
  Record<keyof ActivityFormValues, { message?: string }>
>;

/**
 * Shared custom-activity / edit-activity form. Costs are typed in the
 * trip currency and converted back into the INR catalog base.
 */
export function ActivityForm({
  currency,
  days,
  defaultDayId,
  initialValues,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const tripDates = days.map((day) => day.date);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema(tripDates)) as never,
    mode: "onTouched",
    defaultValues:
      initialValues && Object.keys(initialValues).length > 0
        ? { ...emptyActivityForm(), ...initialValues }
        : emptyActivityForm(defaultDayId),
  });
  const fieldErrors = errors as unknown as FieldErrors;

  // Re-seed when switching target dialogs/days.
  useEffect(() => {
    reset(
      initialValues && Object.keys(initialValues).length > 0
        ? { ...emptyActivityForm(), ...initialValues }
        : emptyActivityForm(defaultDayId),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDayId]);

  const dayId = watch("dayId");
  const startValue = watch("startTime");
  const endValue = watch("endTime");

  /* Live duration preview derived from the entered times. */
  let durationHint: string | null = null;
  const startMinutes = parseTime(startValue);
  const endMinutes = parseTime(endValue);
  if (startMinutes !== null && endMinutes !== null && endMinutes > startMinutes) {
    durationHint = activityDurationLabel(startValue, endValue);
  }

  const submit = handleSubmit((values) => {
    const rate = demoRateFromInr[currency] ?? 1;
    const costInTripCurrency = Number(values.estimatedCost || 0);
    onSubmit({
      ...values,
      estimatedCostInr: Math.round(costInTripCurrency / rate),
    });
  });

  return (
    <form noValidate onSubmit={submit} className="space-y-4" id="activity-form">
      <div className="space-y-1.5">
        <Label htmlFor="activity-name">
          Activity name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="activity-name"
          placeholder="e.g. Sunset photography walk"
          maxLength={ACTIVITY_NAME_MAX}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "activity-name-error" : undefined}
          {...register("name")}
        />
        {fieldErrors.name ? (
          <p id="activity-name-error" role="alert" className="text-sm text-destructive">
            {fieldErrors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="activity-description">Description</Label>
        <Textarea
          id="activity-description"
          rows={2}
          maxLength={ACTIVITY_DESCRIPTION_MAX}
          placeholder="What's the plan?"
          aria-invalid={Boolean(fieldErrors.description)}
          {...register("description")}
        />
        {fieldErrors.description ? (
          <p role="alert" className="text-sm text-destructive">
            {fieldErrors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="activity-location">Location</Label>
          <Input
            id="activity-location"
            placeholder="Area, landmark or address"
            maxLength={120}
            aria-invalid={Boolean(fieldErrors.location)}
            {...register("location")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="activity-day">
            Date <span className="text-destructive">*</span>
          </Label>
          <input type="hidden" {...register("dayId")} />
          <Select
            value={dayId}
            onValueChange={(value) =>
              setValue("dayId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger
              id="activity-day"
              aria-invalid={Boolean(fieldErrors.dayId)}
              aria-label="Day for this activity"
            >
              <SelectValue placeholder="Pick a day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day, index) => (
                <SelectItem key={day.id} value={day.id}>
                  Day {index + 1} · {describeDate(day.date)?.shortDate ?? day.date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.dayId ? (
            <p role="alert" className="text-sm text-destructive">
              {fieldErrors.dayId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="activity-start">
            Start time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="activity-start"
            type="time"
            aria-invalid={Boolean(fieldErrors.startTime)}
            aria-describedby={
              fieldErrors.endTime ? "activity-time-error" : undefined
            }
            {...register("startTime")}
          />
          {fieldErrors.startTime ? (
            <p role="alert" className="text-sm text-destructive">
              {fieldErrors.startTime.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="activity-end">
            End time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="activity-end"
            type="time"
            aria-invalid={Boolean(fieldErrors.endTime)}
            aria-describedby={
              fieldErrors.endTime ? "activity-time-error" : undefined
            }
            {...register("endTime")}
          />
          {fieldErrors.endTime ? (
            <p id="activity-time-error" role="alert" className="text-sm text-destructive">
              {fieldErrors.endTime.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="activity-cost">
            Estimated cost ({currencySymbol(currency)})
          </Label>
          <Input
            id="activity-cost"
            inputMode="decimal"
            placeholder="Leave empty for free"
            aria-invalid={Boolean(fieldErrors.estimatedCost)}
            {...register("estimatedCost")}
          />
          {fieldErrors.estimatedCost ? (
            <p role="alert" className="text-sm text-destructive">
              {fieldErrors.estimatedCost.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Live duration preview */}
      <p className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        <Clock3 className="h-3.5 w-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
        {durationHint
          ? `Duration: ${durationHint}`
          : "End time must be after start time — it drives your day summary."}
      </p>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
