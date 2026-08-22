import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CalendarRange, CheckCircle2, Clock3, HelpCircle, MapPin, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { formatDateRange, formatMoney, tripDuration } from "@/features/trips/trips.utils";
import {
  completionPercent,
  tripChecklist,
  type ChecklistItem,
} from "@/features/trips/my-trips.logic";
import {
  describeDate,
  formatTime,
  activityDurationLabel,
} from "@/features/trips/itinerary.utils";
import {
  buildTripStats,
  findNextActivity,
  previewDays,
  type DayPreview,
  type NextActivityResult,
} from "@/features/trips/trip-details.logic";
import type { ItineraryRecord } from "@/features/trips/itinerary.types";
import type { TripRecord } from "@/features/trips/trips.types";

interface OverviewTabProps {
  trip: TripRecord;
  itinerary: ItineraryRecord | null | undefined;
  onOpenBuilder: () => void;
  tabId?: "overview";
}

const CHECKLIST_LABELS: Record<ChecklistItem["field"], string> = {
  name: "Trip name",
  dates: "Travel dates",
  destination: "Destination",
  budget: "Budget",
  interests: "Interests",
  activities: "Activities",
};

const CHECKLIST_HINTS: Record<ChecklistItem["field"], string> = {
  name: "Give your trip a memorable name",
  dates: "Set start and end dates",
  destination: "Pick where you're going",
  budget: "Set your total budget",
  interests: "Select your travel interests",
  activities: "Add at least one activity",
};

export function OverviewTab({ trip, itinerary, onOpenBuilder, tabId = "overview" }: OverviewTabProps) {
  const stats = useMemo(() => buildTripStats(trip, itinerary), [trip, itinerary]);
  const next = useMemo(() => findNextActivity(itinerary ?? undefined), [itinerary]);
  const checklist = useMemo(() => tripChecklist(trip), [trip]);
  const preview = useMemo(() => previewDays(itinerary ?? undefined), [itinerary]);
  const duration = tripDuration(trip.startDate, trip.endDate);
  const daysUntil = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86400000);
  const isUpcoming = daysUntil > 0;
  const isActive = daysUntil <= 0 && new Date(trip.endDate) >= new Date();
  const completion = completionPercent(trip);

  return (
    <section aria-label="Trip overview" className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary/80">
                {isUpcoming ? "Trip starts in" : isActive ? "Trip in progress" : "Trip completed"}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                {isUpcoming ? `${daysUntil} day${daysUntil !== 1 ? "s" : ""}` : isActive ? "Now" : "Done"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateRange(trip.startDate, trip.endDate)}
                {duration && ` · ${duration.days} days · ${duration.nights} nights`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Progress
                value={completion}
                className="w-48 h-2"
                aria-label={`Planning ${completion}% complete`}
              />
              <span className="text-sm font-mono text-muted-foreground w-10 text-right">
                {completion}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {next && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              Next up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NextActivityCard activity={next.activity} day={next.day} trip={trip} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
            Planning checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklist.map((item) => (
              <ChecklistItem key={item.field} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarRange className="h-4 w-4 text-primary" aria-hidden="true" />
                Itinerary preview
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onOpenBuilder}>
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {preview.map((p, idx) => (
                <DayPreviewCard key={p.day.id} preview={p} dayIndex={idx} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="default"
            className="h-auto py-3 gap-2"
            onClick={onOpenBuilder}
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>Open itinerary builder</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 gap-2" onClick={onOpenBuilder}>
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            <span>Add first activity</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 gap-2">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            <span>Planning tips</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 gap-2">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span>Check conflicts</span>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function NextActivityCard({
  activity,
  day,
  trip,
}: { activity: ItineraryActivity; day: ItineraryDay; trip: TripRecord }) {
  const dateInfo = describeDate(day.date);
  return (
    <Link
      to={`/trips/${trip.id}/itinerary`}
      className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <Clock3 className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{activity.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
            {dateInfo?.shortDate ?? day.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {formatTime(activity.startTime)}–{formatTime(activity.endTime)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {activity.location ?? "Location TBD"}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {activityDurationLabel(activity.startTime, activity.endTime)}
          {activity.estimatedCostInr > 0 && (
            <>
              {" · "}
              {formatMoney(activity.estimatedCostInr, trip.currency)} est.
            </>
          )}
        </p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
    </Link>
  );
}

function DayPreviewCard({ preview, dayIndex }: { preview: DayPreview; dayIndex: number }) {
  const { day, activityCount, costInr } = preview;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <span className="text-sm font-medium text-muted-foreground">
            Day {dayIndex + 1}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground truncate max-w-xs">
            {day.date}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-xs">
            {activityCount} activity{activityCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      {costInr > 0 && (
        <span className="text-sm font-medium text-muted-foreground">
          {costInr.toLocaleString()}₹
        </span>
      )}
    </div>
  );
}

function ChecklistItem({ item }: { item: ChecklistItem }) {
  const Icon = item.met ? CheckCircle2 : AlertCircle;
  return (
    <div className="flex items-start gap-3">
      <Icon
        className={`h-5 w-5 flex-shrink-0 ${
          item.met ? "text-green-500" : "text-amber-500"
        }`}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${item.met ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {CHECKLIST_LABELS[item.field]}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{CHECKLIST_HINTS[item.field]}</p>
      </div>
      {item.met && (
        <Badge variant="secondary" className="text-xs">
          Done
        </Badge>
      )}
    </div>
  );
}

type ItineraryActivity = ItineraryRecord["activities"][0];
type ItineraryDay = ItineraryRecord["days"][0];