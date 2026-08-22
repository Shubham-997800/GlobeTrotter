import { CalendarDays, Clock3, MapPin, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { budgetTiers, interestLabel } from "../trips.data";
import type { ActivitySuggestion, Destination } from "../trips.types";
import {
  budgetSummary,
  estimateSpendingInr,
  formatDateRange,
  formatMoney,
  tripDuration,
} from "../trips.utils";
import type { TripFormValues } from "../schemas/create-trip.schema";

interface TripPreviewProps {
  values: TripFormValues;
  destination: Destination | null;
  activities: ActivitySuggestion[];
}

/** Sticky live summary of everything chosen so far. */
export function TripPreview({
  values,
  destination,
  activities,
}: TripPreviewProps) {
  const duration = tripDuration(values.startDate, values.endDate);
  const tier =
    budgetTiers.find((candidate) => candidate.id === values.budgetTier) ??
    budgetTiers.find((candidate) => candidate.id === "custom")!;
  const amount = Number(values.budgetAmount || 0);
  const estimated =
    duration && destination
      ? estimateSpendingInr({ destination, duration, tier })
      : null;
  const summary = budgetSummary({
    amount,
    destination: destination ?? undefined,
    duration,
    tier,
  });

  return (
    <aside
      aria-label="Trip preview"
      className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Cover */}
        <div className="relative h-36 w-full overflow-hidden bg-muted">
          {values.coverImage || destination ? (
            <img
              src={values.coverImage || (destination?.image ?? "")}
              alt={
                values.coverImage
                  ? "Selected trip cover"
                  : destination?.imageAlt ?? ""
              }
              className={values.coverImage ? "object-cover" : "object-cover opacity-90"}
            />
          ) : null}
          {!values.coverImage && !destination ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
          ) : null}
          <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-semibold capitalize text-white drop-shadow">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {destination ? `${destination.city}, ${destination.country}` : "Pick a destination"}
          </span>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <h3 className="truncate text-base font-bold text-foreground">
              {values.name.trim() || "Untitled Adventure"}
            </h3>
            {values.description.trim() ? (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {values.description.trim()}
              </p>
            ) : null}
          </div>

          {/* Key facts */}
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Dates
              </dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {formatDateRange(values.startDate, values.endDate) ||
                  "Not set"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Duration
              </dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {duration
                  ? `${duration.days} days / ${duration.nights} nights`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" aria-hidden="true" /> Style
              </dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {tier.label}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Travelers</dt>
              <dd className="mt-0.5 font-medium text-foreground">Just you</dd>
            </div>
          </dl>

          <Separator />

          {/* Budget block */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget
            </p>
            <p className="mt-1 text-lg font-bold text-primary">
              {amount > 0
                ? `${formatMoney(amount, values.currency)}`
                : "Set your total"}
            </p>
            {estimated !== null ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Estimated spend{" "}
                <span className="font-medium text-foreground">
                  {formatMoney(estimated, values.currency)}
                </span>
                {summary.remaining !== null ? (
                  <> · Headroom{" "}
                    <span
                      className={
                        summary.remaining >= 0
                          ? "font-medium text-primary"
                          : "font-medium text-destructive"
                      }
                    >
                      {formatMoney(Math.abs(summary.remaining), values.currency)}
                      {summary.remaining < 0 ? " over" : ""}
                    </span>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add dates + destination for an estimate.
              </p>
            )}
          </div>

          {/* Interests */}
          {values.interests.length > 0 ? (
            <>
              <Separator />
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Interests
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {values.interests.map((interest) => (
                    <li key={interest}>
                      <Badge variant="soft" className="text-[11px]">
                        {interestLabel(interest)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}

          {/* Added activities */}
          {activities.length > 0 ? (
            <>
              <Separator />
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Activities ({activities.length})
                </p>
                <ul className="space-y-1.5">
                  {activities.slice(0, 4).map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="min-w-0 truncate text-foreground">
                        {activity.name}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        ≈ ₹{activity.costInr.toLocaleString()}
                      </span>
                    </li>
                  ))}
                  {activities.length > 4 ? (
                    <li className="text-xs text-muted-foreground">
                      +{activities.length - 4} more
                    </li>
                  ) : null}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
        This is a live preview — your itinerary is generated after you create the trip.
      </p>
    </aside>
  );
}
