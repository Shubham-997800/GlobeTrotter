import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Download,
  Edit3,
  MoreVertical,
  Pencil,
  Share2,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/features/dashboard/components/States";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useItinerary, useTrip } from "@/features/trips/useItinerary";
import { tripsService } from "@/features/trips/trips.service";
import type { TripRecord } from "@/features/trips/trips.types";
import type {
  ItineraryRecord,
} from "@/features/trips/itinerary.types";
import type { TripBadgeStatus } from "@/features/trips/components/my-trips/trip-status-badge";

import { shareTripLink } from "@/features/trips/components/my-trips/share-trip";
import { TripStatusBadge } from "@/features/trips/components/my-trips/trip-status-badge";

import {
  formatDateRange,
  tripDuration,
  formatMoney,
} from "@/features/trips/trips.utils";

/* ── Helpers ─────────────────────────────────────────────────── */

function currencySymbol(code: string): string {
  const map: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  return map[code] ?? code;
}

function getTripStatus(trip: TripRecord, now = new Date()): TripBadgeStatus {
  if (trip.status === "draft") return "draft";
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "ongoing";
}

/* ── Trip Hero ───────────────────────────────────────────────── */

function TripHero({
  trip,
  onEdit,
  onShare,
  onExport,
  onDelete,
}: {
  trip: TripRecord;
  onEdit: () => void;
  onShare: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const status = getTripStatus(trip);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-subtle-border bg-card">
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
        {trip.coverImage ? (
          <img
            src={trip.coverImage}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-5xl">🌍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute right-3 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-black/40 text-white hover:bg-black/60"
                aria-label="More trip actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Trip
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onExport}>
                <Download className="mr-2 h-4 w-4" /> Export / Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Trip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {trip.name}
              </h1>
              <TripStatusBadge status={status} />
            </div>
            {trip.description ? (
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                {trip.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
            <Button size="sm" onClick={onEdit}>
              <Edit3 className="mr-1.5 h-4 w-4" /> Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-xl border border-subtle-border bg-background px-3 py-2.5">
            <CalendarDays className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Travel Dates</p>
              <p className="truncate text-sm font-medium">
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-subtle-border bg-background px-3 py-2.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="truncate text-sm font-medium">
                {(() => {
                  const d = tripDuration(trip.startDate, trip.endDate);
                  return d
                    ? `${d.days} ${d.days === 1 ? "day" : "days"} · ${d.nights} ${d.nights === 1 ? "night" : "nights"}`
                    : "—";
                })()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-subtle-border bg-background px-3 py-2.5">
            <Wallet className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="truncate text-sm font-medium">
                {formatMoney(trip.budgetAmount, trip.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Overview Tab ────────────────────────────────────────────── */

function OverviewTab({
  trip,
  itinerary,
}: {
  trip: TripRecord;
  itinerary: ItineraryRecord;
}) {
  const navigate = useNavigate();

  const days = itinerary.days;
  const activities = itinerary.activities;
  const plannedDays = days.filter((d) =>
    activities.some((a) => a.dayId === d.id),
  ).length;
  const totalCost = activities.reduce(
    (sum, a) => sum + a.estimatedCostInr,
    0,
  );
  const status = getTripStatus(trip);

  const dayPreviews = days.slice(0, 3);

  const progress =
    days.length > 0 ? Math.round((plannedDays / days.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Days" value={String(days.length)} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard label="Planned Days" value={`${plannedDays}/${days.length}`} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Activities" value={String(activities.length)} icon={<Sparkles className="h-4 w-4" />} />
        <StatCard
          label="Est. Activity Cost"
          value={`₹${totalCost.toLocaleString()}`}
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      {/* Trip status summary */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Planning Progress
            </h3>
            <p className="text-xs text-muted-foreground">
              {progress}% of your {days.length}-day trip is planned
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {status}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Itinerary preview */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Itinerary Preview
          </h3>
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
          >
            View Full Itinerary <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {dayPreviews.length === 0 ? (
            <p className="col-span-full rounded-xl border border-dashed border-subtle-border px-4 py-8 text-center text-sm text-muted-foreground">
              No days planned yet. Start building your itinerary.
            </p>
          ) : (
            dayPreviews.map((day, i) => {
              const dayActivities = activities
                .filter((a) => a.dayId === day.id)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              return (
                <Card key={day.id} className="p-4">
                  <p className="text-xs font-semibold text-primary">
                    Day {i + 1}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {dayActivities.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No activities yet
                      </p>
                    ) : (
                      dayActivities.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                          <span className="truncate">{a.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigate(`/trips/${trip.id}/itinerary`)}>
          <ClipboardList className="mr-1.5 h-4 w-4" /> Continue Planning
        </Button>
        <Button variant="outline" onClick={() => navigate("/calendar")}>
          <CalendarDays className="mr-1.5 h-4 w-4" /> View Calendar
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-primary">{icon}</div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

/* ── Activities Tab ───────────────────────────────────────────── */

function ActivitiesTab({
  trip,
  itinerary,
}: {
  trip: TripRecord;
  itinerary: ItineraryRecord;
}) {
  const navigate = useNavigate();
  const sorted = [...itinerary.activities].sort((a, b) => {
    const dayA = itinerary.days.find((d) => d.id === a.dayId);
    const dayB = itinerary.days.find((d) => d.id === b.dayId);
    if (!dayA || !dayB) return 0;
    return (
      dayA.date.localeCompare(dayB.date) ||
      a.startTime.localeCompare(b.startTime)
    );
  });

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-subtle-border px-4 py-12 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          No activities yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add activities to your itinerary to see them here.
        </p>
        <Button
          className="mt-4"
          onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
        >
          Add Activity
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((activity) => {
        const day = itinerary.days.find((d) => d.id === activity.dayId);
        return (
          <Card key={activity.id} className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {activity.image ? (
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {activity.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {activity.category} · {activity.location}
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">
                {activity.startTime} – {activity.endTime}
              </p>
              <p className="text-xs text-muted-foreground">
                {day
                  ? new Date(day.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
              ₹{activity.estimatedCostInr.toLocaleString()}
            </span>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Budget Tab ───────────────────────────────────────────────── */

function BudgetTab({
  trip,
  itinerary,
}: {
  trip: TripRecord;
  itinerary: ItineraryRecord;
}) {
  const activities = itinerary.activities;
  const totalActivityCost = activities.reduce(
    (sum, a) => sum + a.estimatedCostInr,
    0,
  );
  const budget = trip.budgetAmount;
  const remaining = budget - totalActivityCost;
  const spentPct = budget > 0 ? (totalActivityCost / budget) * 100 : 0;

  const categories: Record<string, number> = {};
  for (const a of activities) {
    categories[a.category] = (categories[a.category] ?? 0) + a.estimatedCostInr;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Budget</p>
          <p className="text-2xl font-bold text-foreground">
            {currencySymbol(trip.currency)}
            {budget.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Est. Activity Cost</p>
          <p className="text-2xl font-bold text-foreground">
            {currencySymbol(trip.currency)}
            {totalActivityCost.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p
            className={cn(
              "text-2xl font-bold",
              remaining < 0 ? "text-destructive" : "text-foreground",
            )}
          >
            {currencySymbol(trip.currency)}
            {remaining.toLocaleString()}
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-sm font-semibold text-foreground">Budget Progress</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              spentPct > 100 ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${Math.min(spentPct, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {spentPct.toFixed(0)}% of budget allocated to activities
        </p>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          By Category
        </h3>
        <div className="space-y-2">
          {Object.keys(categories).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activity costs recorded yet.
            </p>
          ) : (
            Object.entries(categories).map(([cat, amount]) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-lg border border-subtle-border px-3 py-2.5"
              >
                <span className="text-sm capitalize text-foreground">
                  {cat}
                </span>
                <span className="text-sm font-medium text-foreground">
                  ₹{amount.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Notes Tab ────────────────────────────────────────────────── */

function NotesTab({ itinerary }: { itinerary: ItineraryRecord }) {
  const daysWithNotes = itinerary.days.filter((d) => d.notes.trim());

  if (daysWithNotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-subtle-border px-4 py-12 text-center">
        <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          No notes yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add day notes in the itinerary builder.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {daysWithNotes.map((day) => (
        <Card key={day.id} className="p-4">
          <p className="text-xs font-semibold text-primary">
            {new Date(day.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {day.notes}
          </p>
        </Card>
      ))}
    </div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────── */

function TripDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-72 rounded-lg" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */

export function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const tripQuery = useTrip(tripId);
  const itineraryQuery = useItinerary(tripId);

  const trip = tripQuery.data;
  const itinerary = itineraryQuery.data;

  const handleShare = async () => {
    if (!trip) return;
    try {
      const result = await shareTripLink(trip);
      if (result === "copied") {
        toast.success("Trip link copied to clipboard");
      }
    } catch {
      toast.error("Sharing failed. Please try again.");
    }
  };

  const handleExport = () => {
    if (!trip || !itinerary) return;
    const data = {
      trip,
      itinerary,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.name.replace(/\s+/g, "-").toLowerCase()}-trip.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Trip exported");
  };

  const handleDelete = async () => {
    if (!tripId) return;
    try {
      await tripsService.deleteTrip(tripId);
      toast.success("Trip deleted");
      navigate("/trips", { replace: true });
    } catch {
      toast.error("Couldn't delete the trip. Please try again.");
    }
    setDeleteOpen(false);
  };

  const isLoading = tripQuery.isLoading || itineraryQuery.isLoading;

  return (
    <AppShell
      crumbs={[
        { label: "Home", to: "/dashboard" },
        { label: "My Trips", to: "/trips" },
        { label: trip?.name ?? "Trip" },
      ]}
    >
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-1 -ml-2 text-muted-foreground"
          onClick={() => navigate("/trips")}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to My Trips
        </Button>

        {tripQuery.isError ? (
          <ErrorState
            title="Trip not found"
            description="This trip may have been deleted or the link is incorrect."
            onRetry={() => void tripQuery.refetch()}
          />
        ) : null}

        {isLoading ? (
          <TripDetailsSkeleton />
        ) : trip && itinerary ? (
          <>
            <TripHero
              trip={trip}
              onEdit={() => navigate(`/trips/${trip.id}/edit`)}
              onShare={handleShare}
              onExport={handleExport}
              onDelete={() => setDeleteOpen(true)}
            />

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-5"
            >
              <TabsList className="flex w-full gap-1 overflow-x-auto sm:w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab trip={trip} itinerary={itinerary} />
              </TabsContent>
              <TabsContent value="itinerary">
                <div className="rounded-2xl border border-dashed border-subtle-border px-4 py-12 text-center">
                  <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Open the full itinerary builder
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Drag-and-drop planning lives in the dedicated builder.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
                  >
                    Open Itinerary Builder <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="activities">
                <ActivitiesTab trip={trip} itinerary={itinerary} />
              </TabsContent>
              <TabsContent value="budget">
                <BudgetTab trip={trip} itinerary={itinerary} />
              </TabsContent>
              <TabsContent value="notes">
                <NotesTab itinerary={itinerary} />
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{trip?.name}" and its itinerary.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDelete()}
            >
              Delete Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export default TripDetailsPage;
