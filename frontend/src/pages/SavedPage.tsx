import { useEffect, useMemo, useState } from "react";
import { MapPin, Sparkles, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

type TabKey = "destinations" | "activities";

export function SavedPage() {
  const [tab, setTab] = useState<TabKey>("destinations");
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

  const visibleDestinations = useMemo(
    () => destinations.filter((d) => savedDestinations.has(d.id)),
    [savedDestinations],
  );
  const visibleActivities = useMemo(
    () => activities.filter((a) => savedActivities.has(a.id)),
    [savedActivities],
  );

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
    <AppShell
      title="Saved"
      description="Your saved destinations and activities, all in one place."
      actions={
        <Button variant="outline" asChild>
          <Link to="/explore">Explore more</Link>
        </Button>
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-5">
        <TabsList>
          <TabsTrigger value="destinations">
            Destinations ({visibleDestinations.length})
          </TabsTrigger>
          <TabsTrigger value="activities">
            Activities ({visibleActivities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="space-y-3">
          {visibleDestinations.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No saved destinations"
              description="Browse Explore and tap the bookmark to save places for later."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDestinations.map((d: Destination) => (
                <Card key={d.id} className="group overflow-hidden">
                  <div className="relative aspect-[16/10] bg-muted">
                    <img src={d.image} alt={d.imageAlt} loading="lazy" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeDestination(d.id)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">{d.country}</p>
                    <p className="font-semibold text-foreground">{d.city}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {d.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-3">
          {visibleActivities.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No saved activities"
              description="Find experiences in Explore and save the ones you love."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleActivities.map((a: ActivitySuggestion) => (
                <Card key={a.id} className="group overflow-hidden">
                  <div className="relative aspect-[16/10] bg-muted">
                    <img src={a.image} alt={a.imageAlt} loading="lazy" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeActivity(a.id)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs capitalize text-muted-foreground">{a.category}</p>
                    <p className="font-semibold text-foreground">{a.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.city}, {a.country}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

export default SavedPage;
