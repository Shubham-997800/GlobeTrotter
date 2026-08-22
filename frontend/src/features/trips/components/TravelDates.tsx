import { CalendarDays, MoonStar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tripDuration } from "../trips.utils";

interface TravelDatesProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  errors?: {
    startDate?: string;
    endDate?: string;
  };
  disabled?: boolean;
}

function todayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/**
 * Date-only range picker built on native inputs — no date library
 * dependency. Duration math lives in `trips.utils` and stays UTC-safe.
 */
export function TravelDates({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  errors,
  disabled,
}: TravelDatesProps) {
  const duration = tripDuration(startDate, endDate);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="trip-start-date">Start date</Label>
          <Input
            id="trip-start-date"
            type="date"
            min={todayIso()}
            value={startDate}
            disabled={disabled}
            aria-invalid={Boolean(errors?.startDate)}
            aria-describedby={
              errors?.startDate ? "trip-start-date-error" : undefined
            }
            onChange={(event) => onStartDateChange(event.target.value)}
          />
          {errors?.startDate ? (
            <p id="trip-start-date-error" role="alert" className="text-sm text-destructive">
              {errors.startDate}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="trip-end-date">End date</Label>
          <Input
            id="trip-end-date"
            type="date"
            min={startDate || todayIso()}
            value={endDate}
            disabled={disabled}
            aria-invalid={Boolean(errors?.endDate)}
            aria-describedby={
              errors?.endDate ? "trip-end-date-error" : undefined
            }
            onChange={(event) => onEndDateChange(event.target.value)}
          />
          {errors?.endDate ? (
            <p id="trip-end-date-error" role="alert" className="text-sm text-destructive">
              {errors.endDate}
            </p>
          ) : null}
        </div>
      </div>

      {/* Duration feedback — appears only when the range is complete. */}
      <div aria-live="polite" className="mt-3 min-h-6">
        {duration ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {duration.days} {duration.days === 1 ? "day" : "days"} ·{" "}
            <MoonStar className="h-3.5 w-3.5" aria-hidden="true" />
            {duration.nights} {duration.nights === 1 ? "night" : "nights"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
