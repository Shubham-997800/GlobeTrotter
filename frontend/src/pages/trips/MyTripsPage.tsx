import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  useTripsList,
  useDeleteTrips,
  useDuplicateTrip,
  useSetTripsArchived,
} from "@/features/trips/useTrips";
import {
  applyMyTripsFilters,
  sortMyTrips,
  createTripCardModel,
  computeTripCounts,
  findNextUpcoming,
  deriveDestinationOptions,
  type TripCardModel,
} from "@/features/trips/my-trips.logic";
import { TripCard } from "@/features/trips/components/my-trips/trip-card";
import { TripListRow } from "@/features/trips/components/my-trips/trip-list-row";
import { TripFiltersBar } from "@/features/trips/components/my-trips/trip-filters";
import {
  TripStatusTabs,
  type StatusTabInfo,
} from "@/features/trips/components/my-trips/trip-status-tabs";
import { ViewToggle } from "@/features/trips/components/my-trips/view-toggle";
import { BulkActionBar } from "@/features/trips/components/my-trips/bulk-action-bar";
import {
  DeleteTripsDialog,
  type PendingDeleteTrips,
} from "@/features/trips/components/my-trips/delete-trips-dialog";
import { TripSummaryStats } from "@/features/trips/components/my-trips/trip-summary-stats";
import { UpcomingTripHighlight } from "@/features/trips/components/my-trips/upcoming-trip-highlight";
import { DraftTripCard } from "@/features/trips/components/my-trips/draft-trip-card";
import { NoTripsState, NoResultsState } from "@/features/trips/components/my-trips/empty-states";
import {
  TripStatsSkeleton,
  TripHighlightSkeleton,
  TripGridSkeleton,
} from "@/features/trips/components/my-trips/skeletons";
import { shareTripLink } from "@/features/trips/components/my-trips/share-trip";
import {
  downloadTripsExport,
  type ExportFormat,
} from "@/features/trips/components/my-trips/export-trips";
import type { MyTripsFilters, MyTripsViewMode } from "@/features/trips/trips.types";

function defaultFilters(): MyTripsFilters {
  return {
    search: "",
    status: "all",
    country: "",
    dateFilter: "all",
    customRange: undefined,
    sort: "recent",
  };
}

export function MyTripsPage() {
  const list = useTripsList();
  const deleteTrips = useDeleteTrips();
  const duplicateTrip = useDuplicateTrip();
  const setArchived = useSetTripsArchived();

  const [filters, setFilters] = useState<MyTripsFilters>(defaultFilters);
  const [view, setView] = useState<MyTripsViewMode>("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteTrips | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const now = useMemo(() => new Date(), [list.data]);

  const records = list.data ?? [];
  const counts = computeTripCounts(records, now);
  const filteredSorted = sortMyTrips(
    applyMyTripsFilters(records, filters, now),
    filters.sort,
  );
  const models = filteredSorted.map((record) => createTripCardModel(record, now));
  const mainModels = models.filter((model) => model.status !== "draft");
  const draftModels = models.filter((model) => model.status === "draft");
  const destinationOptions = deriveDestinationOptions(records, now);
  const nextUpcoming = findNextUpcoming(records, now);
  const nextHighlight = filters.status === "all" ? nextUpcoming : null;

  const isDraftView = filters.status === "draft";
  const showStats = filters.status === "all";

  const hasActiveFilters =
    filters.search !== "" ||
    filters.country !== "" ||
    filters.dateFilter !== "all" ||
    filters.status !== "all";

  const selectedTrips = mainModels.filter((model) => selected.includes(model.record.id));
  const allVisibleSelected =
    mainModels.length > 0 && mainModels.every((model) => selected.includes(model.record.id));

  const statusTabs: StatusTabInfo[] = [
    { value: "all", label: "All", count: counts.total },
    { value: "upcoming", label: "Upcoming", count: counts.upcoming },
    { value: "ongoing", label: "Ongoing", count: counts.ongoing },
    { value: "completed", label: "Completed", count: counts.completed },
    { value: "draft", label: "Drafts", count: counts.drafts },
    { value: "archived", label: "Archived", count: counts.archived },
  ];

  const clearFilters = () => {
    setFilters(defaultFilters());
    setSelected([]);
  };

  const toggleSelect = (id: string, next: boolean) => {
    setSelected((prev) =>
      next ? [...new Set([...prev, id])] : prev.filter((existing) => existing !== id),
    );
  };

  const handleShare = async (trip: TripCardModel) => {
    try {
      await shareTripLink({ id: trip.record.id, name: trip.name });
    } catch {
      /* Sharing was dismissed or the clipboard is unavailable. */
    }
  };

  const handleDuplicate = async (trip: TripCardModel) => {
    await duplicateTrip.mutateAsync(trip.record.id);
  };

  const handleArchiveToggle = async (trip: TripCardModel, next: boolean) => {
    await setArchived.mutateAsync({ tripIds: [trip.record.id], archived: next });
    setSelected((prev) => prev.filter((existing) => existing !== trip.record.id));
  };

  const openDeleteOne = (trip: TripCardModel) => {
    setDeleteError(null);
    setPendingDelete({ ids: [trip.record.id], names: [trip.name] });
  };

  const openDeleteMany = (trips: TripCardModel[]) => {
    setDeleteError(null);
    setPendingDelete({
      ids: trips.map((trip) => trip.record.id),
      names: trips.map((trip) => trip.name),
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTrips.mutateAsync(pendingDelete.ids);
      setSelected((prev) => prev.filter((existing) => !pendingDelete.ids.includes(existing)));
      setPendingDelete(null);
      setDeleteError(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "We couldn't delete those trips. Please try again.",
      );
    }
  };

  const handleBulkArchive = async (archived: boolean) => {
    if (selectedTrips.length === 0) return;
    await setArchived.mutateAsync({
      tripIds: selectedTrips.map((trip) => trip.record.id),
      archived,
    });
    setSelected([]);
  };

  const handleExport = (format: ExportFormat) => {
    downloadTripsExport(
      selectedTrips.map((trip) => trip.record),
      format,
    );
  };

  const cardActions = {
    onDuplicate: handleDuplicate,
    onShare: handleShare,
    onDeleteRequest: openDeleteOne,
    onArchiveToggle: handleArchiveToggle,
    onToggleSelect: (trip: TripCardModel, next: boolean) =>
      toggleSelect(trip.record.id, next),
  };
  const rowActions = {
    onDuplicate: handleDuplicate,
    onShare: handleShare,
    onDeleteRequest: openDeleteOne,
    onArchiveToggle: handleArchiveToggle,
    onToggleSelect: (trip: TripCardModel, next: boolean) =>
      toggleSelect(trip.record.id, next),
  };

  if (list.isLoading) {
    return (
      <AppShell
        crumbs={[{ label: "Home", to: "/dashboard" }, { label: "My Trips" }]}
        title="My Trips"
        description="Every plan you've started, sorted by what's next."
      >
        <div className="space-y-6">
          <TripStatsSkeleton />
          <TripHighlightSkeleton />
          <TripGridSkeleton count={6} />
        </div>
      </AppShell>
    );
  }

  if (list.isError || !list.data) {
    return (
      <AppShell
        crumbs={[{ label: "Home", to: "/dashboard" }, { label: "My Trips" }]}
      >
        <div className="rounded-2xl border border-error-border bg-error-bg p-6 text-center">
          <p className="font-semibold text-error-text">Couldn't load your trips</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching your trips.
          </p>
          <Button className="mt-4" onClick={() => list.refetch()}>
            Try again
          </Button>
        </div>
      </AppShell>
    );
  }

  if (records.length === 0) {
    return (
      <AppShell
        crumbs={[{ label: "Home", to: "/dashboard" }, { label: "My Trips" }]}
      >
        <NoTripsState />
      </AppShell>
    );
  }

  return (
    <AppShell
      crumbs={[{ label: "Home", to: "/dashboard" }, { label: "My Trips" }]}
      title="My Trips"
      description="Every plan you've started, sorted by what's next."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh trips"
            onClick={() => list.refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
          </Button>
          <Button asChild>
            <Link to="/trips/create">
              <Plus className="size-4" aria-hidden="true" />
              New Trip
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {showStats ? (
          <TripSummaryStats
            counts={{
              total: counts.total,
              upcoming: counts.upcoming,
              ongoing: counts.ongoing,
              completed: counts.completed,
            }}
          />
        ) : null}

        {nextHighlight ? (
          <UpcomingTripHighlight trip={createTripCardModel(nextHighlight, now)} />
        ) : null}

        <div className="flex flex-col gap-4">
          <TripStatusTabs
            value={filters.status}
            onValueChange={(next) => setFilters((prev) => ({ ...prev, status: next }))}
            tabs={statusTabs}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <TripFiltersBar
                searchInput={filters.search}
                onSearchInputChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
                filters={filters}
                onFiltersChange={setFilters}
                onClearAll={clearFilters}
                destinationOptions={destinationOptions}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {models.length === 0 ? (
          <NoResultsState onClearFilters={clearFilters} />
        ) : isDraftView ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {draftModels.map((trip) => (
              <DraftTripCard
                key={trip.record.id}
                trip={trip}
                onDeleteRequest={openDeleteOne}
              />
            ))}
          </div>
        ) : (
          <>
            {filters.status === "all" && draftModels.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Continue Planning
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {draftModels.length} {draftModels.length === 1 ? "draft" : "drafts"}
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {draftModels.map((trip) => (
                    <DraftTripCard
                      key={trip.record.id}
                      trip={trip}
                      onDeleteRequest={openDeleteOne}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {mainModels.length > 0 ? (
              view === "grid" ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {mainModels.map((trip) => (
                    <TripCard
                      key={trip.record.id}
                      trip={trip}
                      selected={selected.includes(trip.record.id)}
                      selectionActive={selected.length > 0}
                      {...cardActions}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {mainModels.map((trip) => (
                    <TripListRow
                      key={trip.record.id}
                      trip={trip}
                      selected={selected.includes(trip.record.id)}
                      selectionActive={selected.length > 0}
                      {...rowActions}
                    />
                  ))}
                </div>
              )
            ) : null}
          </>
        )}
      </div>

      {selected.length > 0 ? (
        <BulkActionBar
          selectedTrips={selectedTrips}
          onClearSelection={() => setSelected([])}
          onSelectAllVisible={() => setSelected(mainModels.map((trip) => trip.record.id))}
          onDeleteRequest={() => openDeleteMany(selectedTrips)}
          onArchive={handleBulkArchive}
          onExport={handleExport}
          archiveBusy={setArchived.isPending}
          allVisibleSelected={allVisibleSelected}
        />
      ) : null}

      <DeleteTripsDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        trips={pendingDelete}
        pending={deleteTrips.isPending}
        error={deleteError}
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}

export default MyTripsPage;
