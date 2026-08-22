import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { TripHeader } from "@/features/trips/components/itinerary/TripHeader";
import { TripStatsBar } from "@/features/trips/components/trip-details/TripStatsBar";
import { TripDetailsTabs, useTripDetailsTabs } from "@/features/trips/components/trip-details/TripDetailsTabs";
import { OverviewTab } from "@/features/trips/components/trip-details/OverviewTab";
import { ItineraryTab } from "@/features/trips/components/trip-details/ItineraryTab";
import { ActivitiesTab } from "@/features/trips/components/trip-details/ActivitiesTab";
import { BudgetTab } from "@/features/trips/components/trip-details/BudgetTab";
import { NotesTab } from "@/features/trips/components/trip-details/NotesTab";
import { TripDetailsSkeleton } from "@/features/trips/components/trip-details/TripDetailsSkeleton";
import { ErrorState } from "@/features/dashboard/components/States";
import { useDeleteTrip, useEditTrip, useItinerary, useTrip } from "@/features/trips/useItinerary";
import { buildTripStats } from "@/features/trips/trip-details.logic";
import type { TripRecord } from "@/features/trips/trips.types";

export function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { activeTab, setTab } = useTripDetailsTabs();

  const tripQuery = useTrip(tripId ?? "");
  const itineraryQuery = useItinerary(tripId ?? "");
  const editTrip = useEditTrip(tripId ?? "");
  const deleteTrip = useDeleteTrip();

  const isLoading = tripQuery.isLoading || itineraryQuery.isLoading;
  const isError = tripQuery.isError || itineraryQuery.isError;
  const trip = tripQuery.data;
  const itinerary = itineraryQuery.data;

  const handleDelete = useCallback(() => {
    if (!tripId) return;
    deleteTrip.mutate(tripId, {
      onSuccess: () => {
        toast.success("Trip deleted");
        navigate("/trips");
      },
      onError: (error) => {
        toast.error("Failed to delete trip", { description: error.message });
      },
    });
  }, [tripId, deleteTrip, navigate]);

  const handleEditSave = useCallback(
    (patch: { name: string; description: string; coverImage: string }) => {
      editTrip.mutate(patch, {
        onSuccess: () => {
          toast.success("Trip updated");
          tripQuery.refetch();
        },
        onError: (error) => {
          toast.error("Failed to update trip", { description: error.message });
        },
      });
    },
    [editTrip, tripQuery]
  );

  const handleOpenBuilder = useCallback(() => {
    if (tripId) navigate(`/trips/${tripId}/itinerary`);
  }, [tripId, navigate]);

  if (isLoading) {
    return <TripDetailsSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load trip"
        description={
          tripQuery.isError
            ? tripQuery.error?.message
            : itineraryQuery.error?.message
        }
        onRetry={() => {
          tripQuery.refetch();
          itineraryQuery.refetch();
        }}
      />
    );
  }

  if (!trip) {
    return (
      <ErrorState
        title="Trip not found"
        description="This trip may have been deleted or the link is invalid."
        action={{ label: "Back to My Trips", to: "/trips" }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-6">
      <TripHeader
        trip={trip}
        isDeleting={deleteTrip.isPending}
        isSavingEdit={editTrip.isPending}
        onDelete={handleDelete}
        onEditSave={handleEditSave}
      />

      <TripStatsBar
        trip={trip}
        stats={itinerary ? buildTripStats(trip, itinerary) : { totalDays: 0, plannedDays: 0, planningPercent: 0, totalCities: 0, totalActivities: 0, totalDurationMinutes: 0, totalCostInr: 0 }}
      />

      <TripDetailsTabs activeTab={activeTab} onTabChange={setTab}>
        <OverviewTab trip={trip} itinerary={itinerary} onOpenBuilder={handleOpenBuilder} tabId="overview" />
        <ItineraryTab trip={trip} itinerary={itinerary} onOpenBuilder={handleOpenBuilder} tabId="itinerary" />
        <ActivitiesTab trip={trip} itinerary={itinerary} onOpenBuilder={handleOpenBuilder} tabId="activities" />
        <BudgetTab trip={trip} itinerary={itinerary} tabId="budget" />
        <NotesTab trip={trip} itinerary={itinerary} tabId="notes" />
      </TripDetailsTabs>
    </div>
  );
}