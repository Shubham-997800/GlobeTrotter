import { useState } from "react";
import { BookmarkCheck, BookmarkPlus, Clock, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSavedActivityIds, useSuggestedActivities, useToggleSavedActivity } from "../useTrips";
import type { ActivityCategoryId, ActivitySuggestion } from "../trips.types";
import { cn } from "@/lib/utils";

const ACTIVITY_TABS: { value: ActivityCategoryId; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "nature", label: "Nature" },
];

interface SuggestedActivitiesProps {
  /** Activities already added to this trip. */
  addedIds: string[];
  onAdd: (activity: ActivitySuggestion) => void;
}

/**
 * Category-tabbed activity rail. "Save for Later" persists to the
 * mock service; "Add to Trip" is local state until create.
 */
export function SuggestedActivities({ addedIds, onAdd }: SuggestedActivitiesProps) {
  const [category, setCategory] =
    useState<ActivityCategoryId>("popular");
  const activities = useSuggestedActivities(category);
  const savedIds = useSavedActivityIds();
  const toggleSaved = useToggleSavedActivity();

  return (
    <div>
      <Tabs
        value={category}
        onValueChange={(value) => setCategory(value as ActivityCategoryId)}
      >
        <TabsList aria-label="Activity categories">
          {ACTIVITY_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div aria-live="polite" className="mt-4">
        {activities.isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-60 w-56 shrink-0 animate-pulse rounded-xl bg-muted"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : activities.data && activities.data.length > 0 ? (
          <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 pt-0.5 [scrollbar-width:thin]">
            {activities.data.slice(0, 6).map((activity) => {
              const added = addedIds.includes(activity.id);
              const saved = savedIds.data?.includes(activity.id) ?? false;
              return (
                <li key={activity.id} className="w-56 shrink-0 snap-start">
                  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
                    <div className="relative h-24 w-full overflow-hidden">
                      <img
                        src={activity.image}
                        alt={activity.imageAlt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute left-2 top-2 border-transparent bg-background/85 capitalize text-foreground shadow-sm backdrop-blur"
                      >
                        {activity.category}
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {activity.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.city} ·{" "}
                        <Clock
                          className="inline h-3 w-3"
                          aria-hidden="true"
                        />{" "}
                        ~{activity.durationHours}h · ≈ ₹
                        {activity.costInr.toLocaleString()}
                      </p>
                      <p className="line-clamp-2 min-h-8 text-xs leading-snug text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="mt-auto flex items-center gap-2 pt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={added ? "secondary" : "default"}
                          disabled={added}
                          onClick={() => onAdd(activity)}
                          className="h-8 flex-1 px-2 text-xs"
                        >
                          {added ? (
                            <>
                              <BookmarkCheck className="h-3.5 w-3.5" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Add to Trip
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-pressed={saved}
                          aria-label={
                            saved
                              ? `Remove ${activity.name} from saved for later`
                              : `Save ${activity.name} for later`
                          }
                          onClick={() => toggleSaved.mutate(activity.id)}
                          className="h-8 w-8 shrink-0 px-0"
                        >
                          <BookmarkPlus
                            className={cn(
                              "h-4 w-4",
                              saved && "fill-current text-primary",
                            )}
                          />
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-strong-border p-6 text-center text-sm text-muted-foreground">
            No activities in this category right now — check another tab.
          </p>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Saved-for-later items stay in your account even if you leave this form.
      </p>
    </div>
  );
}
