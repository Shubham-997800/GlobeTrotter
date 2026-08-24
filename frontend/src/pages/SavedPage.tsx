import { useEffect, useMemo, useState } from "react";
import { Bookmark, Clock, DollarSign, MapPin, Search, SlidersHorizontal, Sparkles, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/features/dashboard/components/States";
import { destinations, activities } from "@/features/trips/trips.data";
import type { Destination, ActivitySuggestion } from "@/features/trips/trips.types";

const SAVED_DEST_KEY = "globetrotter.saved.destinations";
const SAVED_ACT_KEY = "globetrotter.saved.activities";

function readJsonSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((id): id is string => typeof id === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

function writeJsonSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // storage unavailable
  }
}

type TabKey = "all" | "destinations" | "activities";

export function SavedPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "name">("newest");
  const [savedDestinations, setSavedDestinations] = useState<Set<string>>(
    () => readJsonSet(SAVED_DEST_KEY),
  );
  const [savedActivities, setSavedActivities] = useState<Set<string>>(
    () => readJsonSet(SAVED_ACT_KEY),
  );

  useEffect(() => {
    writeJsonSet(SAVED_DEST_KEY, savedDestinations);
  }, [savedDestinations]);

  useEffect(() => {
    writeJsonSet(SAVED_ACT_KEY, savedActivities);
  }, [savedActivities]);

  const visibleDestinations = useMemo(() => {
    const filtered = destinations.filter((d) => {
      if (!savedDestinations.has(d.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        return d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q);
      }
      return true;
    });
    if (sort === "name") filtered.sort((a, b) => a.city.localeCompare(b.city));
    return filtered;
  }, [savedDestinations, search, sort]);

  const visibleActivities = useMemo(() => {
    const filtered = activities.filter((a) => {
      if (!savedActivities.has(a.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [savedActivities, search, sort]);

  const totalCount = visibleDestinations.length + visibleActivities.length;

  const removeDestination = (id: string) => {
    setSavedDestinations((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("Removed from saved");
  };

  const removeActivity = (id: string) => {
    setSavedActivities((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("Removed from saved");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Saved
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep destinations, activities and trips you want to revisit.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/explore">
              <Bookmark className="mr-1.5 size-4" aria-hidden="true" />
              Explore
            </Link>
          </Button>
        </div>

        {/* Search + Sort + Tabs */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved items..."
                className="h-10 w-full rounded-xl border border-border bg-muted/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={() => setSort((s) => (s === "newest" ? "name" : "newest"))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              {sort === "newest" ? "Recently saved" : "A — Z"}
            </button>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList>
              <TabsTrigger value="all">
                All ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="destinations">
                Destinations ({visibleDestinations.length})
              </TabsTrigger>
              <TabsTrigger value="activities">
                Activities ({visibleActivities.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          {/* All */}
          <TabsContent value="all" className="space-y-8">
            {totalCount === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="Nothing saved yet"
                description="Save destinations, activities and trips to find them here later."
              />
            ) : (
              <>
                {visibleDestinations.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                      Destinations
                      <span className="ml-2 text-xs font-normal">({visibleDestinations.length})</span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {visibleDestinations.map((d) => (
                        <DestinationCard key={d.id} destination={d} onRemove={removeDestination} />
                      ))}
                    </div>
                  </section>
                )}
                {visibleActivities.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                      Activities
                      <span className="ml-2 text-xs font-normal">({visibleActivities.length})</span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {visibleActivities.map((a) => (
                        <ActivityCard key={a.id} activity={a} onRemove={removeActivity} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </TabsContent>

          {/* Destinations */}
          <TabsContent value="destinations" className="space-y-3">
            {visibleDestinations.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No saved destinations"
                description="Browse Explore and tap the bookmark to save places for later."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleDestinations.map((d) => (
                  <DestinationCard key={d.id} destination={d} onRemove={removeDestination} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activities */}
          <TabsContent value="activities" className="space-y-3">
            {visibleActivities.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No saved activities"
                description="Discover experiences for your next trip and save the ones you love."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleActivities.map((a) => (
                  <ActivityCard key={a.id} activity={a} onRemove={removeActivity} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

/* ── Destination Card ─────────────────────────────────────── */

function DestinationCard({
  destination,
  onRemove,
}: {
  destination: Destination;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={destination.image}
          alt={destination.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <button
          type="button"
          onClick={() => onRemove(destination.id)}
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/40 text-white opacity-100 sm:opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 sm:group-hover:opacity-100"
          aria-label="Remove from saved"
        >
          <Trash2 className="size-3.5" />
        </button>
        <div className="absolute bottom-2.5 left-2.5">
          {destination.rating ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              <Star className="size-3 fill-warning text-warning" aria-hidden="true" />
              {destination.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{destination.country}</p>
        <p className="mt-0.5 font-semibold text-foreground">{destination.city}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {destination.description}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/explore/${destination.id}`}>View</Link>
          </Button>
          <button
            type="button"
            onClick={() => onRemove(destination.id)}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove from saved"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Activity Card ────────────────────────────────────────── */

function ActivityCard({
  activity,
  onRemove,
}: {
  activity: ActivitySuggestion;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="group flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative w-32 shrink-0 overflow-hidden bg-muted sm:w-40">
        <img
          src={activity.image}
          alt={activity.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white backdrop-blur-sm">
          {activity.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="font-semibold text-foreground">{activity.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {activity.city}, {activity.country}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {activity.durationHours ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden="true" />
                ~{activity.durationHours}h
              </span>
            ) : null}
            {activity.costInr ? (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3" aria-hidden="true" />
                ~{activity.costInr.toLocaleString("en-IN")}
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/explore`}>View Activity</Link>
          </Button>
          <button
            type="button"
            onClick={() => onRemove(activity.id)}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove from saved"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavedPage;
