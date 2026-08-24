import { Link } from "react-router-dom";
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  Compass,
  Copy,
  Eye,
  ListChecks,
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
import { TripImage } from "./trip-image";

export interface TripCardActions {
  onDuplicate: (trip: TripCardModel) => void;
  onShare: (trip: TripCardModel) => void;
  onDeleteRequest: (trip: TripCardModel) => void;
  onArchiveToggle: (trip: TripCardModel) => void;
  onContinuePlanning?: (trip: TripCardModel) => void;
  onToggleSelect?: (tripId: string, checked: boolean) => void;
}

interface TripCardProps extends TripCardActions {
  trip: TripCardModel;
  selected?: boolean;
  selectionActive?: boolean;
}

/**
 * Travel-oriented trip card. Clean hierarchy:
 * image → status badge → name → destination → dates → quick stats → actions.
 */
export function TripCard({
  trip,
  selected = false,
  selectionActive = false,
  onToggleSelect,
  onDuplicate,
  onShare,
  onDeleteRequest,
  onArchiveToggle,
  onContinuePlanning,
}: TripCardProps) {
  const isDraft = trip.status === "draft";
  const isArchived = Boolean(trip.record.archivedAt);
  const detailsTo = `/trips/${trip.record.id}/itinerary`;
  const editTo = `/trips/${trip.record.id}/edit`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-strong-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/25",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        selected ? "border-primary ring-2 ring-primary/40" : "border-border",
      )}
      aria-label={`${trip.name}, ${trip.city}`}
    >
      {/* ── Cover Image ── */}
      <div className="relative">
        <Link
          to={detailsTo}
          aria-label={`View ${trip.name}`}
          className="block focus-visible:outline-none"
        >
          <TripImage
            src={trip.image}
            alt={trip.imageAlt}
            eager={false}
            className="aspect-[16/10]"
            imgClassName="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        </Link>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent"
        />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onToggleSelect?.(trip.record.id, checked === true)}
            aria-label={`Select ${trip.name}`}
            className={cn(
              "size-4.5 border-white/70 bg-black/30 backdrop-blur-sm transition-opacity",
              "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:opacity-100",
              selectionActive || selected
                ? "opacity-100"
                : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 max-lg:pointer-events-none max-lg:hidden",
            )}
          />
          <TripStatusBadge
            status={isArchived ? "archived" : trip.status}
            withIcon
            className="shadow-sm"
          />
        </div>

        {trip.duration ? (
          <span className="absolute bottom-2 left-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {trip.duration.nights}N / {trip.duration.days}D
          </span>
        ) : null}
      </div>

      {/* ── Body ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
            <Link
              to={detailsTo}
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {trip.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
            <span className="truncate">
              {trip.city || "Destination not set"}
              {trip.country ? `, ${trip.country}` : ""}
            </span>
          </p>
        </div>

        <p className="flex items-center gap-1.5 text-xs font-medium text-secondary-text">
          <CalendarDays className="size-3.5 shrink-0 text-travel-blue" aria-hidden="true" />
          {trip.dateRange || "Dates not set"}
        </p>

        {/* Quick Stats Row */}
        <ul className="flex flex-wrap gap-1.5" aria-label="Trip stats">
          <li className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-secondary-text">
            <ListChecks className="size-3" aria-hidden="true" />
            {trip.activitiesCount} {trip.activitiesCount === 1 ? "activity" : "activities"}
          </li>
          <li className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-secondary-text">
            <CalendarDays className="size-3" aria-hidden="true" />
            {trip.daysPlanned > 0 ? `${trip.daysPlanned} days` : "No dates"}
          </li>
          {trip.budgetTotalLabel ? (
            <li className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-secondary-text">
              {trip.budgetTotalLabel}
            </li>
          ) : null}
        </ul>

        {/* ── Actions ── */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          {isDraft ? (
            <Button asChild size="sm" className="min-w-0 flex-1">
              <Link to={editTo}>
                <PencilLine className="size-4" aria-hidden="true" />
                Continue Editing
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="secondary" className="min-w-0 flex-1">
              <Link to={detailsTo}>
                <Eye className="size-4" aria-hidden="true" />
                View Trip
              </Link>
            </Button>
          )}

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
                    <Eye aria-hidden="true" />
                    View Trip
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {!isDraft ? (
                <DropdownMenuItem onSelect={() => onContinuePlanning?.(trip)}>
                  <Compass aria-hidden="true" />
                  Continue Planning
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
                title={
                  !isArchived && trip.status === "ongoing"
                    ? "Ongoing trips can't be archived"
                    : undefined
                }
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
      </div>
    </article>
  );
}
