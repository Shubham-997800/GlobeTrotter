import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import type {
  ItineraryActivity,
  ItineraryDay,
} from "@/features/trips/itinerary.types";
import {
  ACTIVITY_DESCRIPTION_MAX,
  ACTIVITY_NAME_MAX,
  activityFormSchema,
  emptyActivityForm,
  type ActivityFormValues,
} from "@/features/trips/schemas/itinerary.schema";
import { describeDate } from "@/features/trips/itinerary.utils";

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  days: ItineraryDay[];
  defaultDayId?: string;
  /** Required when mode === "edit". */
  activity?: ItineraryActivity | null;
  isPending: boolean;
  onSubmit: (values: ActivityFormValues) => void;
}

/**
 * Shared create/edit form for itinerary activities. Validation is driven
 * by `activityFormSchema(tripDates)` so day/time/cost rules stay identical
 * between adding and editing.
 */
export function ActivityFormDialog({
  open,
  onOpenChange,
  mode,
  days,
  defaultDayId,
  activity = null,
  isPending,
  onSubmit,
}: ActivityFormDialogProps) {
  const schema = useMemo(
    () => activityFormSchema(days.map((day) => day.date)),
    [days],
  );

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyActivityForm(defaultDayId ?? days[0]?.id ?? ""),
  });

  /* Re-seed whenever the dialog opens or the target activity changes. */
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && activity) {
      form.reset({
        name: activity.name,
        description: activity.description,
        location: activity.location,
        dayId: activity.dayId,
        startTime: activity.startTime,
        endTime: activity.endTime,
        estimatedCost:
          activity.estimatedCostInr > 0 ? String(activity.estimatedCostInr) : "",
      });
    } else {
      form.reset(emptyActivityForm(defaultDayId ?? days[0]?.id ?? ""));
    }
  }, [open, mode, activity, defaultDayId, days, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add an activity" : "Edit activity"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Schedule something new for this trip."
              : "Adjust the details, timing or day."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="activity-name">Name</Label>
            <Input
              id="activity-name"
              placeholder="e.g. Sunrise at Tiger Hill"
              maxLength={ACTIVITY_NAME_MAX}
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p role="alert" className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity-description">Description</Label>
            <Textarea
              id="activity-description"
              rows={3}
              maxLength={ACTIVITY_DESCRIPTION_MAX}
              placeholder="What makes this stop special?"
              aria-invalid={Boolean(form.formState.errors.description)}
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p role="alert" className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity-location">Location</Label>
            <Input
              id="activity-location"
              placeholder="Area, landmark or address"
              aria-invalid={Boolean(form.formState.errors.location)}
              {...form.register("location")}
            />
            {form.formState.errors.location ? (
              <p role="alert" className="text-xs text-destructive">
                {form.formState.errors.location.message}
              </p>
            ) : null}
          </div>

          <Controller
            control={form.control}
            name="dayId"
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="activity-day">Day</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="activity-day"
                    className="w-full"
                    aria-invalid={Boolean(fieldState.error)}
                  >
                    <SelectValue placeholder="Pick a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day, index) => {
                      const info = describeDate(day.date);
                      return (
                        <SelectItem key={day.id} value={day.id}>
                          Day {index + 1} · {info?.shortDate ?? day.date}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {fieldState.error ? (
                  <p role="alert" className="text-xs text-destructive">
                    {fieldState.error.message}
                  </p>
                ) : null}
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="activity-start">Start time</Label>
              <Input
                id="activity-start"
                type="time"
                aria-invalid={Boolean(form.formState.errors.startTime)}
                {...form.register("startTime")}
              />
              {form.formState.errors.startTime ? (
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.startTime.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="activity-end">End time</Label>
              <Input
                id="activity-end"
                type="time"
                aria-invalid={Boolean(form.formState.errors.endTime)}
                {...form.register("endTime")}
              />
              {form.formState.errors.endTime ? (
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.endTime.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity-cost">Estimated cost (INR)</Label>
            <Input
              id="activity-cost"
              inputMode="decimal"
              placeholder="0"
              aria-invalid={Boolean(form.formState.errors.estimatedCost)}
              {...form.register("estimatedCost")}
            />
            {form.formState.errors.estimatedCost ? (
              <p role="alert" className="text-xs text-destructive">
                {form.formState.errors.estimatedCost.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {mode === "create" ? "Add to itinerary" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
