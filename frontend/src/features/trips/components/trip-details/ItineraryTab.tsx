import { useMemo, useState } from "react";
import { ArrowRight, CalendarRange, ChevronDown, Clock3, MapPin, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { formatDateRange, formatMoney } from "@/features/trips/trips.utils";
import { describeDate, formatTime, sortDayActivities, summarizeDay, activityDurationLabel, type DaySummary } from "@/features/trips/itinerary.utils";
import type { ItineraryRecord } from "@/features/trips/itinerary.types";
import type { TripRecord } from "@/features/trips/trips.types";

interface ItineraryTabProps {
  trip: TripRecord;
  itinerary: ItineraryRecord | null | undefined;
  onOpenBuilder: () => void;
}

export function ItineraryTab({ trip, itinerary, onOpenBuilder }: ItineraryTabProps) {
  const days = useMemo(() => {
    if (!itinerary?.days.length) return [];
    return [...itinerary.days].sort((a, b) => a.date.localeCompare(b.date));
  }, [itinerary]);

  if (days.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarRange className="h-12 w-12 mx-auto text-muted-foreground/50" aria-hidden="true" />
          <p className="mt-4 text-lg font-medium text-foreground">No itinerary yet</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Open the builder to start adding days and activities for your trip.
          </p>
          <Button className="mt-6" onClick={onOpenBuilder}>
            Open itinerary builder <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section aria-label="Itinerary" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{days.length} day{days.length !== 1 ? "s" : ""} planned</p>
          <p className="text-lg font-semibold text-foreground">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
        <Button onClick={onOpenBuilder}>
          Open in builder <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="space-y-3" role="list" aria-label="Days">
        {days.map((day, index) => (
          <DayCard
            key={day.id}
            day={day}
            index={index}
            activities={itinerary?.activities ?? []}
            trip={trip}
          />
        ))}
      </div>
    </section>
  );
}

interface DayCardProps {
  day: ItineraryRecord["days"][0];
  index: number;
  activities: ItineraryRecord["activities"];
  trip: TripRecord;
}

function DayCard({ day, index, activities, trip }: DayCardProps) {
  const dayActivities = useMemo(
    () => sortDayActivities(activities, day.id),
    [activities, day.id]
  );
  const summary: DaySummary = summarizeDay(activities, day.id);
  const [isOpen, setIsOpen] = useState(dayActivities.length > 0);
  const dateInfo = describeDate(day.date);

  return (
    <Card>
      <CardHeader
        className="py-3 cursor-pointer"
        onClick={() => dayActivities.length > 0 && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                Day {index + 1}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground truncate max-w-md">
                Day {index + 1}
              </p>
              <p className="text-sm text-muted-foreground">
                {dateInfo?.shortDate ?? day.date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <CalendarRange className="h-3 w-3" aria-hidden="true" />
              {summary.activityCount} activity{summary.activityCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Wallet className="h-3 w-3" aria-hidden="true" />
              {formatMoney(summary.costInr, trip.currency)}
            </Badge>
            {dayActivities.length > 0 && (
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </CardHeader>

      {isOpen && dayActivities.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2 pb-2">
            {dayActivities.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} trip={trip} />
            ))}
          </div>
        </CardContent>
      )}

      {dayActivities.length === 0 && (
        <CardContent className="pt-0 pb-3 text-center text-sm text-muted-foreground py-4">
          No activities scheduled for this day.
        </CardContent>
      )}
    </Card>
  );
}

function ActivityRow({ activity, trip }: { activity: ItineraryRecord["activities"][0]; trip: TripRecord }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
      <div className="flex-shrink-0 w-10 text-right text-sm text-muted-foreground font-mono">
        {formatTime(activity.startTime)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{activity.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {activity.location ?? "Location TBD"}
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock3 className="h-3 w-3" aria-hidden="true" />
          {activityDurationLabel(activity.startTime, activity.endTime)}
        </span>
        {activity.estimatedCostInr > 0 && (
          <span className="flex items-center gap-1">
            <Wallet className="h-3 w-3" aria-hidden="true" />
            {formatMoney(activity.estimatedCostInr, trip.currency)}
          </span>
        )}
        {activity.category && (
          <Badge variant="outline" className="gap-1 h-5 px-2">
            <MapPin className="h-2.5 w-2.5" aria-hidden="true" />
            {activity.category}
          </Badge>
        )}
      </div>
    </div>
  );
}