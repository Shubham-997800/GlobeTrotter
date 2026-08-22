import { Link } from "react-router-dom";
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  Compass,
  Copy,
  MapPin,
  MoreVertical,
  PencilLine,
  Share2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TripCardModel } from "../../my-trips.logic";
import { TripStatusBadge } from "./trip-status-badge";

export interface TripRowActions {
  onDuplicate: (trip: TripCardModel) => void;
  onShare: (trip: TripCardModel) => void;
  onDeleteRequest: (trip: TripCardModel) => void;
  onArchiveToggle: (trip: TripCardModel) => void;
}

interface TripListRowProps extends TripRowActions {
  trip: TripCardModel;
  selected?: boolean;
  selectionActive?: boolean;
  onToggleSelect?: (tripId: string, checked: boolean) => void;
}

/**
 * Compact management row for list view. Stays usable on small screens
 * by collapsing to the essentials (checkbox, thumb, name, dates, menu).
 */
export function TripListRow({
  trip,
  selected = false,
  selectionActive = false,
  onToggleSelect,
  onDuplicate,
  onShare,
  onDeleteRequest,
  onArchiveToggle,
}: TripListRowProps) {
  const isDraft = trip.status === "draft";
  const isArchived = Boolean(trip.record.archivedAt);
  const detailsTo = `/trips/${trip.record.id}/itinerary`;
  const editTo = `/trips/${trip.record.id}/edit`;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-strong-border hover:bg-row-hover sm:gap-4",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border",
      )}
      aria-label={`${trip.name}, ${trip.city}`}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) =>
          onToggleSelect?.(trip.record.id, checked === true)
        }
        aria-label={`Select ${trip.name}`}
        className={cn(
          "shrink-0 transition-opacity",
          selectionActive || selected
            ? "opacity-100"
            : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 max-lg:pointer-events-none max-lg:hidden",
        )}
      />

      <Link
        to={detailsTo}
        aria-hidden="true"
        tabIndex={-1}
        className="shrink-0 overflow-hidden rounded-lg"
      >
        <img
          src={trip.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-14 w-20 object-cover transition-transform duration-300 group-hover:scale-[1.05] sm:h-16 sm:w-24"
        />
      </Link>

      {/* Name + destination */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">
          <Link
            to={detailsTo}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {trip.name}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0 text-travel-blue" aria-hidden="true" />
          <span className="truncate">
            {trip.city || "Destination not set"}
            {trip.country ? `, ${trip.country}` : ""}
          </span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground lg:hidden">
          <CalendarDays className="size-3 shrink-0" aria-hidden="true" />
          {trip.dateRange || "Dates not set"}
        </p>
      </div>

      {/* Dates — desktop only */}
      <p className="hidden min-w-40 items-center gap-1.5 text-xs font-medium text-secondary-text lg:flex">
        <CalendarDays className="size-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
        {trip.dateRange || "Dates not set"}
      </p>

      <TripStatusBadge
        status={isArchived ? "archived" : trip.status}
        className="hidden shrink-0 sm:inline-flex"
      />

      {/* Progress + budget — wide screens */}
      <div className="hidden w-28 xl:block" aria-label={`Planning progress ${trip.percent}%`}>
        <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
          <span>Plan</span>
          <span>{trip.percent}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.max(trip.percent, 2)}%` }}
          />
        </div>
      </div>
      <p className="hidden w-24 shrink-0 truncate text-right text-xs font-semibold text-foreground md:block">
        {trip.budgetTotalLabel || "—"}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`More actions for ${trip.name}`}
            aria-haspopup="menu"
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!isDraft ? (
            <DropdownMenuItem asChild>
              <Link to={detailsTo}>
                <Compass aria-hidden="true" />
                View / Itinerary
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link to={editTo}>
              <PencilLine aria-hidden="true" />
              Edit Trip
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDuplicate(trip)}>
            <Copy aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onShare(trip)}>
            <Share2 aria-hidden="true" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onArchiveToggle(trip)}
            disabled={!isArchived && trip.status === "ongoing"}
          >
            {isArchived ? (
              <>
                <ArchiveRestore aria-hidden="true" />
                Unarchive
              </>
            ) : (
              <>
                <Archive aria-hidden="true" />
                Archive
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={() => onDeleteRequest(trip)}
          >
            <Trash2 aria-hidden="true" />
            Delete Trip
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
