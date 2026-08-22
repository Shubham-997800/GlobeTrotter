import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Clock3,
  Coins,
  Copy,
  GripVertical,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActivityOverlap } from "@/features/trips/itinerary.utils";
import {
  activityDurationLabel,
} from "@/features/trips/itinerary.utils";
import type { ItineraryActivity } from "@/features/trips/itinerary.types";
import { categoryAccentClass } from "@/features/trips/itinerary.data";
import { formatMoney } from "@/features/trips/trips.utils";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: ItineraryActivity;
  currency: string;
  overlaps: ActivityOverlap[];
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveToDay: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * One sortable timeline entry. The grip is the only drag handle; every
 * action (including reorder) also exists as a keyboard-reachable menu
 * item, so drag-and-drop is never the only path.
 */
export function ActivityCard({
  activity,
  currency,
  overlaps,
  isFirst,
  isLast,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveToDay,
  onMoveUp,
  onMoveDown,
}: ActivityCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const duration = activityDurationLabel(activity.startTime, activity.endTime);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "relative rounded-xl transition-shadow",
        isDragging && "z-20 opacity-80 shadow-lg ring-2 ring-ring",
      )}
    >
      <article className="group flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-strong-border sm:p-4">
        {/* Drag handle */}
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${activity.name}. Use the actions menu to move it with the keyboard instead.`}
          className="mt-0.5 flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground opacity-60 transition-opacity hover:bg-hover hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Time rail */}
        <div className="flex w-12 shrink-0 flex-col items-start pt-0.5 sm:w-16">
          <time className="text-xs font-semibold tabular-nums text-foreground">
            {activity.startTime}
          </time>
          <span aria-hidden="true" className="my-1 ml-[3px] w-px flex-1 border-l border-dashed border-border" />
          <time className="text-[11px] tabular-nums text-muted-foreground">
            {activity.endTime}
          </time>
        </div>

        {/* Thumbnail */}
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-28">
          {activity.image ? (
            <img
              src={activity.image}
              alt={activity.imageAlt ?? ""}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/50">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold text-foreground sm:text-base">
                {activity.name}
              </h4>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <Badge
                  variant="outline"
                  className={cn("px-1.5 py-0 text-[10px]", categoryAccentClass(activity.category))}
                >
                  <span className="capitalize">{activity.category}</span>
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  {activity.startTime}–{activity.endTime}
                  {duration ? ` · ${duration}` : ""}
                </span>
              </p>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="-mr-1 -mt-1 h-7 w-7 shrink-0"
                  aria-label={`Actions for ${activity.name}`}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit activity
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onMoveToDay}>
                  <ArrowDown className="mr-2 h-4 w-4 rotate-90" />
                  Move to another day…
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Reorder without dragging</DropdownMenuLabel>
                <DropdownMenuItem onSelect={onMoveUp} disabled={isFirst}>
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Move up
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onMoveDown} disabled={isLast}>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Move down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 text-travel-blue" aria-hidden="true" />
            <span className="truncate">{activity.location || "No location set"}</span>
          </p>

          {activity.description ? (
            <p className="mt-1 line-clamp-2 hidden text-xs leading-relaxed text-secondary-text sm:block">
              {activity.description}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-budget">
              <Coins className="h-3 w-3" aria-hidden="true" />
              ≈{" "}
              {activity.estimatedCostInr > 0
                ? formatMoney(activity.estimatedCostInr, currency)
                : "Free"}
              <span className="sr-only"> estimated cost</span>
            </span>
          </div>

          {/* Overlap warning */}
          {overlaps.length > 0 ? (
            <ul aria-label="Time overlap warnings" className="mt-2 space-y-1">
              {overlaps.map((overlap) => (
                <li
                  key={`${overlap.activityId}-${overlap.otherId}-${overlap.startTime}`}
                  role="status"
                  className="flex items-start gap-1.5 rounded-lg border border-warning-border bg-warning-bg px-2 py-1 text-[11px] font-medium text-warning-text"
                >
                  <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  Overlaps with “{overlap.otherName}” from {overlap.startTime}
                  –{overlap.endTime}.
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove “{activity.name}”?</DialogTitle>
            <DialogDescription>
              This deletes the activity from this day&apos;s timeline. It
              won&apos;t affect other days or your saved catalog items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep activity
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90 dark:text-[#450a0a]"
              onClick={() => {
                setDeleteOpen(false);
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
