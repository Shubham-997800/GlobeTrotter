import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
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

  const now = useMemo(() => new Date(), []);

  const records = list.data ?? [];
  const counts = computeTripCounts(records, now);
  const filteredSorted = sortMyTrips(
    applyMyTripsFilters(records, filters, now),
    filters.sort,
  );
  const models = filteredSorted.map((record) => createTripCardModel(record));
  const mainModels = models.filter((model) => model.status !== "draft");
  const draftModels = models.filter((model) => model.status === "draft");
  const destinationOptions = deriveDestinationOptions(records);
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
    onArchiveToggle: (trip: TripCardModel) =>
      handleArchiveToggle(trip, !trip.record.archivedAt),
    onToggleSelect: toggleSelect,
  };
  const rowActions = {
    onDuplicate: handleDuplicate,
    onShare: handleShare,
    onDeleteRequest: openDeleteOne,
    onArchiveToggle: (trip: TripCardModel) =>
      handleArchiveToggle(trip, !trip.record.archivedAt),
    onToggleSelect: toggleSelect,
  };

  if (list.isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="My Trips"
            description="Plan, organize and manage all your journeys in one place."
          />
          <TripStatsSkeleton />
          <TripHighlightSkeleton />
          <TripGridSkeleton count={6} />
        </div>
      </AppShell>
    );
  }

  if (list.isError || !list.data) {
    return (
      <AppShell>
        <PageHeader
          title="My Trips"
          description="Plan, organize and manage all your journeys in one place."
        />
        <div className="mt-6 rounded-2xl border border-error-border bg-error-bg p-6 text-center">
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
      <AppShell>
        <NoTripsState />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <PageHeader
          title="My Trips"
          description="Plan, organize and manage all your journeys in one place."
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
                  Create Trip
                </Link>
              </Button>
            </div>
          }
        />

        {/* ── Summary Stats ── */}
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

        {/* ── Upcoming Highlight ── */}
        {nextHighlight ? (
          <UpcomingTripHighlight trip={createTripCardModel(nextHighlight)} />
        ) : null}

        {/* ── Filters + Tabs ── */}
        <div className="space-y-3">
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
                onFiltersChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
                onClearAll={clearFilters}
                destinationOptions={destinationOptions}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {/* ── Trip Content ── */}
        {models.length === 0 ? (
          <NoResultsState onClearFilters={clearFilters} />
        ) : isDraftView ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            {/* Drafts Section */}
            {filters.status === "all" && draftModels.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Continue Planning
                  <span className="ml-2 text-xs font-normal">
                    {draftModels.length} {draftModels.length === 1 ? "draft" : "drafts"}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

            {/* Main Trips */}
            {mainModels.length > 0 ? (
              view === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                <div className="space-y-2">
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

      {/* ── Bulk Actions ── */}
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

      {/* ── Delete Dialog ── */}
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
