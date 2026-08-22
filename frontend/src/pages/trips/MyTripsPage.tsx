import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/features/dashboard/components/States";
import {
  applyMyTripsFilters,
  computeTripCounts,
  createTripCardModel,
  deriveDestinationOptions,
  findNextUpcoming,
  sortMyTrips,
} from "@/features/trips/my-trips.logic";
import type { TripCardModel } from "@/features/trips/my-trips.logic";
import type { MyTripsFilters, MyTripsStatusFilter } from "@/features/trips/trips.types";
import {
  useDeleteTrips,
  useDuplicateTrip,
  useSetTripsArchived,
  useTripsList,
} from "@/features/trips/useTrips";
import { BulkActionBar } from "@/features/trips/components/my-trips/bulk-action-bar";
import {
  DeleteTripsDialog,
  type PendingDeleteTrips,
} from "@/features/trips/components/my-trips/delete-trips-dialog";
import { DraftTripCard } from "@/features/trips/components/my-trips/draft-trip-card";
import {
  NoDraftsState,
  NoResultsState,
  NoTripsState,
  NoUpcomingState,
} from "@/features/trips/components/my-trips/empty-states";
import { downloadTripsExport } from "@/features/trips/components/my-trips/export-trips";
import {
  TripGridSkeleton,
  TripHighlightSkeleton,
  TripListSkeleton,
  TripStatsSkeleton,
} from "@/features/trips/components/my-trips/skeletons";
import { shareTripLink } from "@/features/trips/components/my-trips/share-trip";
import { TripFiltersBar } from "@/features/trips/components/my-trips/trip-filters";
import { TripCard } from "@/features/trips/components/my-trips/trip-card";
import { TripListRow } from "@/features/trips/components/my-trips/trip-list-row";
import { TripStatusTabs } from "@/features/trips/components/my-trips/trip-status-tabs";
import { TripSummaryStats } from "@/features/trips/components/my-trips/trip-summary-stats";
import { UpcomingTripHighlight } from "@/features/trips/components/my-trips/upcoming-trip-highlight";
import { ViewToggle } from "@/features/trips/components/my-trips/view-toggle";
import type { ExportFormat } from "@/features/trips/components/my-trips/export-trips";

const PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 300;

export function MyTripsPage() {
  const tripsQuery = useTripsList();
  const records = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data]);

  const deleteTrips = useDeleteTrips();
  const duplicateTrip = useDuplicateTrip();
  const setArchived = useSetTripsArchived();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const pageNum = Number.parseInt(searchParams.get("page") ?? "1", 10);
    return {
      search: searchParams.get("q") ?? "",
      status: searchParams.get("status") ?? "all",
      country: searchParams.get("country") ?? "",
      dateFilter: searchParams.get("date") ?? "all",
      customRange: {
        from: searchParams.get("from") ?? "",
        to: searchParams.get("to") ?? "",
      },
      sort: searchParams.get("sort") ?? "recent",
      view: searchParams.get("view") === "list" ? ("list" as const) : ("grid" as const),
      page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (patch: Record<string, string | null>, options?: { resetPage?: boolean }) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      if (options?.resetPage !== false) next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const [searchInput, setSearchInput] = useState(params.search);
  useEffect(() => {
    setSearchInput((prev) => (prev !== params.search && !searchParams.has("q") ? params.search : prev));
  }, [params.search, searchParams]);
  useEffect(() => {
    if (searchInput === params.search) return;
    const timer = window.setTimeout(() => updateParams({ q: searchInput || null }), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, params.search, updateParams]);

  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of ["q", "status", "country", "date", "from", "to", "sort"]) next.delete(key);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const filters: MyTripsFilters = useMemo(
    () => ({
      search: params.search,
      status: params.status as MyTripsFilters["status"],
      country: params.country,
      dateFilter: params.dateFilter as MyTripsFilters["dateFilter"],
      customRange: params.customRange,
      sort: params.sort as MyTripsFilters["sort"],
    }),
    [params],
  );

  const hasActiveFilters =
    Boolean(filters.search || filters.country) ||
    filters.status !== "all" ||
    filters.dateFilter !== "all";

  const now = useMemo(() => new Date(), [tripsQuery.dataUpdatedAt]);

  const modelsById = useMemo(() => {
    const map = new Map<string, TripCardModel>();
    for (const record of records) map.set(record.id, createTripCardModel(record, now));
    return map;
  }, [records, now]);

  const counts = useMemo(() => computeTripCounts(records, now), [records, now]);
  const nextUpcomingRecord = useMemo(() => findNextUpcoming(records, now), [records, now]);

  const drafts = useMemo(
    () =>
      sortMyTrips(records.filter((r) => r.status === "draft" && !r.archivedAt), "updated").map(
        (record) => modelsById.get(record.id)!,
      ),
    [records, modelsById],
  );

  const filteredRecords = useMemo(
    () => applyMyTripsFilters(records, filters, now),
    [records, filters, now],
  );

  const sortedRecords = useMemo(
    () => sortMyTrips(filteredRecords, filters.sort),
    [filteredRecords, filters.sort],
  );

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));
  const currentPage = Math.min(params.page, totalPages);
  const visibleModels = sortedRecords
    .slice(0, currentPage * PAGE_SIZE)
    .map((record) => modelsById.get(record.id)!);

  const destinationOptions = useMemo(() => deriveDestinationOptions(records), [records]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const recordIdsKey = records.map((r) => r.id).join("|");
  useEffect(() => {
    const valid = new Set(recordIdsKey ? recordIdsKey.split("|") : []);
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [recordIdsKey]);

  const toggleSelect = useCallback((tripId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(tripId);
      else next.delete(tripId);
      return next;
    });
  }, []);

  const allVisibleSelected =
    visibleModels.length > 0 && visibleModels.every((m) => selectedIds.has(m.record.id));

  const visibleIdsKey = sortedRecords
    .slice(0, currentPage * PAGE_SIZE)
    .map((r) => r.id)
    .join("|");
  const toggleSelectAllVisible = useCallback(() => {
    const visibleIds = visibleIdsKey ? visibleIdsKey.split("|") : [];
    setSelectedIds((prev) => {
      if (visibleIds.length > 0 && visibleIds.every((id) => prev.has(id))) {
        return new Set([...prev].filter((id) => !visibleIds.includes(id)));
      }
      return new Set([...prev, ...visibleIds]);
    });
  }, [visibleIdsKey]);

  const selectedTrips = useMemo(
    () => [...selectedIds].map((id) => modelsById.get(id)).filter(Boolean) as TripCardModel[],
    [selectedIds, modelsById],
  );

  const [deleteTarget, setDeleteTarget] = useState<PendingDeleteTrips | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestDelete = (ids: string[], names: string[]) => {
    setDeleteError(null);
    setDeleteTarget({ ids, names });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const result = await deleteTrips.mutateAsync(deleteTarget.ids);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of result.deletedIds) next.delete(id);
        return next;
      });
      if (result.failedIds.length > 0) {
        setDeleteError("Some trips could not be deleted — they may already be gone.");
      } else {
        setDeleteTarget(null);
        toast.success(`Deleted ${result.deletedIds.length} ${result.deletedIds.length === 1 ? "trip" : "trips"}`);
      }
    } catch {
      setDeleteError("We couldn't delete the trips. Check your connection and try again.");
    }
  };

  const handleDuplicate = async (trip: TripCardModel) => {
    try {
      const copy = await duplicateTrip.mutateAsync(trip.record.id);
      if (!copy) {
        toast.error(`Couldn't duplicate "${trip.name}" — it may have been deleted.`);
        return;
      }
      toast.success("Trip duplicated", {
        description: `"${copy.name}" was created.`,
      });
    } catch {
      toast.error("Duplication failed. Please try again.");
    }
  };

  const handleShare = async (trip: TripCardModel) => {
    try {
      const result = await shareTripLink(trip.record);
      if (result === "copied") {
        toast.success("Trip link copied to clipboard");
      }
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return;
      toast.error("Sharing failed. Please try again.");
    }
  };

  const handleArchiveToggle = async (trip: TripCardModel) => {
    const archived = !trip.record.archivedAt;
    try {
      await setArchived.mutateAsync({ tripIds: [trip.record.id], archived });
      toast.success(archived ? "Trip archived" : "Trip restored");
    } catch {
      toast.error(archived ? "Couldn't archive the trip." : "Couldn't restore the trip.");
    }
  };

  const handleBulkArchive = async (archived: boolean) => {
    if (selectedTrips.length === 0) return;
    try {
      await setArchived.mutateAsync({
        tripIds: selectedTrips.map((t) => t.record.id),
        archived,
      });
      setSelectedIds(new Set());
      toast.success(
        `${archived ? "Archived" : "Restored"} ${selectedTrips.length} ${selectedTrips.length === 1 ? "trip" : "trips"}`,
      );
    } catch {
      toast.error("Bulk archive failed. Please try again.");
    }
  };

  const handleBulkExport = (format: ExportFormat) => {
    if (selectedTrips.length === 0) return;
    downloadTripsExport(selectedTrips.map((t) => t.record), format);
    toast.success(`Exported ${selectedTrips.length} ${selectedTrips.length === 1 ? "trip" : "trips"} as ${format.toUpperCase()}`);
  };

  const tabs = [
    { value: "all" as MyTripsStatusFilter, label: "All Trips", count: counts.total },
    { value: "upcoming" as MyTripsStatusFilter, label: "Upcoming", count: counts.upcoming },
    { value: "ongoing" as MyTripsStatusFilter, label: "Ongoing", count: counts.ongoing },
    { value: "completed" as MyTripsStatusFilter, label: "Completed", count: counts.completed },
    { value: "draft" as MyTripsStatusFilter, label: "Drafts", count: counts.drafts },
    ...(counts.archived > 0
      ? [{ value: "archived" as MyTripsStatusFilter, label: "Archived", count: counts.archived }]
      : []),
  ];

  const renderEmptyState = () => {
    if (counts.total === 0 && counts.drafts === 0) return <NoTripsState />;
    if (filters.status === "draft") return <NoDraftsState />;
    if (
      filters.status === "upcoming" &&
      !filters.search &&
      !filters.country &&
      filters.dateFilter === "all"
    ) {
      return <NoUpcomingState />;
    }
    return <NoResultsState onClearFilters={clearAllFilters} />;
  };

  const isLoading = tripsQuery.isLoading;

  return (
    <AppShell crumbs={[{ label: "Home", to: "/dashboard" }, { label: "My Trips" }]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                My Trips
              </h1>
              <span
                aria-live="polite"
                aria-label={`${counts.total} trips created`}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              >
                {isLoading ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : null}
                {isLoading ? "…" : `${counts.total} ${counts.total === 1 ? "Trip" : "Trips"}`}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and explore all your journeys
            </p>
          </div>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/trips/create">
              <PlusCircle />
              Create New Trip
            </Link>
          </Button>
        </div>

        {isLoading ? <TripStatsSkeleton /> : <TripSummaryStats counts={counts} />}

        {isLoading ? (
          <TripHighlightSkeleton />
        ) : nextUpcomingRecord ? (
          <UpcomingTripHighlight trip={modelsById.get(nextUpcomingRecord.id)!} />
        ) : null}

        {!isLoading && drafts.length > 0 && filters.status !== "draft" && filters.status !== "archived" ? (
          <section aria-label="Draft trips" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Drafts
                <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full border border-warning-border bg-warning-bg px-2 py-0.5 align-middle text-xs font-semibold text-warning-text">
                  {drafts.length}
                </span>
              </h2>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Incomplete plans you can pick back up anytime
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {drafts.slice(0, 3).map((trip) => (
                <DraftTripCard
                  key={trip.record.id}
                  trip={trip}
                  onDeleteRequest={(t) => requestDelete([t.record.id], [t.name])}
                />
              ))}
            </div>
          </section>
        ) : null}

        {tripsQuery.isError ? (
          <ErrorState
            title="Unable to load your trips"
            description="We couldn't reach your travel library. Your trips are safe — try again."
            onRetry={() => void tripsQuery.refetch()}
          />
        ) : null}

        {!isLoading && !tripsQuery.isError ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TripStatusTabs
                value={filters.status}
                onValueChange={(value) => updateParams({ status: value })}
                tabs={tabs}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    allVisibleSelected ? true : selectedIds.size > 0 ? "indeterminate" : false
                  }
                  onCheckedChange={toggleSelectAllVisible}
                  disabled={visibleModels.length === 0}
                  aria-label="Select all shown trips"
                  title="Select all shown"
                  className="size-[18px]"
                />
                <ViewToggle
                  value={params.view}
                  onChange={(next) => updateParams({ view: next }, { resetPage: false })}
                />
              </div>
            </div>

            <TripFiltersBar
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
              filters={filters}
              onFiltersChange={(patch) =>
                updateParams({
                  ...(patch.country !== undefined ? { country: patch.country } : {}),
                  ...(patch.dateFilter !== undefined ? { date: patch.dateFilter } : {}),
                  ...("customRange" in patch && patch.customRange
                    ? { from: patch.customRange.from, to: patch.customRange.to }
                    : {}),
                  ...(patch.sort !== undefined ? { sort: patch.sort } : {}),
                })
              }
              onClearAll={clearAllFilters}
              destinationOptions={destinationOptions}
              hasActiveFilters={hasActiveFilters}
            />

            {hasActiveFilters ? (
              <p aria-live="polite" className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">{sortedRecords.length}</span> of{" "}
                {counts.total} {counts.total === 1 ? "trip" : "trips"}
              </p>
            ) : null}
          </div>
        ) : null}

        {isLoading ? (
          params.view === "list" ? <TripListSkeleton /> : <TripGridSkeleton />
        ) : !tripsQuery.isError ? (
          visibleModels.length === 0 ? (
            renderEmptyState()
          ) : params.view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleModels.map((trip) => (
                <TripCard
                  key={trip.record.id}
                  trip={trip}
                  selected={selectedIds.has(trip.record.id)}
                  selectionActive={selectedIds.size > 0}
                  onToggleSelect={toggleSelect}
                  onDuplicate={(t) => void handleDuplicate(t)}
                  onShare={(t) => void handleShare(t)}
                  onDeleteRequest={(t) => requestDelete([t.record.id], [t.name])}
                  onArchiveToggle={(t) => void handleArchiveToggle(t)}
                  onContinuePlanning={(t) => navigate(`/trips/${t.record.id}/itinerary`)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleModels.map((trip) => (
                <TripListRow
                  key={trip.record.id}
                  trip={trip}
                  selected={selectedIds.has(trip.record.id)}
                  selectionActive={selectedIds.size > 0}
                  onToggleSelect={toggleSelect}
                  onDuplicate={(t) => void handleDuplicate(t)}
                  onShare={(t) => void handleShare(t)}
                  onDeleteRequest={(t) => requestDelete([t.record.id], [t.name])}
                  onArchiveToggle={(t) => void handleArchiveToggle(t)}
                />
              ))}
            </div>
          )
        ) : null}

        {!isLoading && !tripsQuery.isError && currentPage < totalPages ? (
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <Button
              variant="secondary"
              onClick={() => updateParams({ page: String(currentPage + 1) }, { resetPage: false })}
            >
              Load More
              <span className="text-xs text-muted-foreground">
                ({sortedRecords.length - visibleModels.length} remaining)
              </span>
            </Button>
            <p className="text-xs text-muted-foreground">
              Showing {visibleModels.length} of {sortedRecords.length}
            </p>
          </div>
        ) : null}

        <BulkActionBar
          selectedTrips={selectedTrips}
          onClearSelection={() => setSelectedIds(new Set())}
          onSelectAllVisible={toggleSelectAllVisible}
          onDeleteRequest={() =>
            requestDelete(
              selectedTrips.map((t) => t.record.id),
              selectedTrips.map((t) => t.name),
            )
          }
          onArchive={(archived) => void handleBulkArchive(archived)}
          onExport={handleBulkExport}
          archiveBusy={setArchived.isPending}
          allVisibleSelected={allVisibleSelected}
        />

        <DeleteTripsDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
              setDeleteError(null);
            }
          }}
          trips={deleteTarget}
          pending={deleteTrips.isPending}
          error={deleteError}
          onConfirm={() => void confirmDelete()}
        />

        <Button
          asChild
          size="lg"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-30 rounded-full pl-4 pr-5 shadow-lg shadow-black/20 sm:hidden"
        >
          <Link to="/trips/create" aria-label="Create a new trip">
            <PlusCircle />
            New Trip
          </Link>
        </Button>

        <div className="sr-only" aria-live="polite">
          {isLoading
            ? "Loading your trips."
            : `Showing ${visibleModels.length} of ${sortedRecords.length} trips.`}
        </div>
      </div>
    </AppShell>
  );
}

export default MyTripsPage;