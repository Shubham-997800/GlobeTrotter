import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, ListChecks, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import { tripsService } from "@/features/trips/trips.service";

/**
 * Post-create landing page for a trip. The full itinerary builder is
 * the next milestone; this screen proves the trip record exists and
 * gives the traveler a clear next step instead of a dead end.
 */
export function ItineraryBuilderPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [tripName, setTripName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void tripsService.listTrips().then((trips) => {
      if (!cancelled) {
        setTripName(trips.find((trip) => trip.id === tripId)?.name ?? null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  return (
    <AppShell
      crumbs={[
        { label: "My Trips", to: "/trips" },
        { label: tripName ?? "Itinerary" },
      ]}
      title={tripName ?? "Your Trip"}
      description={`Trip ID: ${tripId}`}
    >
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Trip created successfully!
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tripName
                ? `“${tripName}” is saved.`
                : "Your trip is saved."}{" "}
              The day-wise itinerary builder is coming up next.
            </p>
          </div>

          <ul className="w-full space-y-2 text-left" aria-label="What's next">
            {[
              { icon: MapPinned, label: "Arrange cities into day-wise stops" },
              { icon: ListChecks, label: "Schedule your saved activities" },
              { icon: CalendarDays, label: "Visualize everything on your travel calendar" },
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-subtle-border bg-muted/40 px-4 py-3"
              >
                <item.icon className="h-4 w-4 shrink-0 text-travel-blue" aria-hidden="true" />
                <span className="text-sm text-secondary-text">{item.label}</span>
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Soon
                </span>
              </li>
            ))}
          </ul>

          <Button asChild variant="secondary" className="mt-2 w-full sm:w-auto">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}

export default ItineraryBuilderPage;
