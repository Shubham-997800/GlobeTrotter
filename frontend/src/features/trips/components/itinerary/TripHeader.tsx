import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Copy,
  MapPin,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { CoverImageUpload } from "@/features/trips/components/CoverImageUpload";
import type { EditableTripPatch } from "@/features/trips/useItinerary";
import { destinations } from "@/features/trips/trips.data";
import type { TripRecord } from "@/features/trips/trips.types";
import {
  formatDateRange,
  formatMoney,
  tripDuration,
} from "@/features/trips/trips.utils";
import {
  TRIP_STATUS_STYLES,
  tripDisplayStatus,
} from "@/features/trips/itinerary.utils";

interface TripHeaderProps {
  trip: TripRecord;
  isDeleting: boolean;
  isSavingEdit: boolean;
  onDelete: () => void;
  onEditSave: (patch: EditableTripPatch) => void;
}

/** Cover image, trip facts, live status badge and the quick actions. */
export function TripHeader({
  trip,
  isDeleting,
  isSavingEdit,
  onDelete,
  onEditSave,
}: TripHeaderProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const destination = destinations.find((d) => d.id === trip.destinationId);
  const duration = tripDuration(trip.startDate, trip.endDate);
  const status = tripDisplayStatus(trip);

  /* ── Quick actions ─────────────────────────────────────── */
  const shareTrip = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Share link copied", {
        description: "Anyone with this link can preview this itinerary.",
      });
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar.");
    }
  };

  return (
    <section aria-label="Trip overview" className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link to="/trips">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to My Trips
        </Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row">
          {/* Cover */}
          <div className="relative h-40 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-56 md:w-64">
            {trip.coverImage || destination ? (
              <img
                src={trip.coverImage || destination?.image}
                alt={
                  trip.coverImage
                    ? `${trip.name} cover`
                    : destination?.imageAlt ?? ""
                }
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Facts */}
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {trip.name}
                </h1>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-travel-blue" aria-hidden="true" />
                    {destination ? `${destination.city}, ${destination.country}` : "Destination removed"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-travel-blue" aria-hidden="true" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </span>
                  {duration ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5 text-travel-blue" aria-hidden="true" />
                      {duration.days} days · {duration.nights} nights ·{" "}
                      {formatMoney(trip.budgetAmount, trip.currency)} budget
                    </span>
                  ) : null}
                </p>
              </div>

              <Badge
                variant="outline"
                className={`shrink-0 ${TRIP_STATUS_STYLES[status]}`}
              >
                {status}
              </Badge>
            </div>

            {trip.description ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-secondary-text">
                {trip.description}
              </p>
            ) : null}

            {/* Quick actions */}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit Trip
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void shareTrip()}>
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                Share Trip
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="More trip actions"
                    className="px-2"
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void shareTrip()}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onSelect={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Trip…
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit trip dialog ────────────────────────────────── */}
      <TripEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        trip={trip}
        saving={isSavingEdit}
        onSave={(patch) => {
          onEditSave(patch);
          setEditOpen(false);
        }}
      />

      {/* ── Delete confirmation ─────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{trip.name}”?</DialogTitle>
            <DialogDescription>
              This permanently removes the trip and its whole day-wise
              itinerary — activities, notes and city stops included. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Keep trip
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90 dark:text-[#450a0a]"
              disabled={isDeleting}
              onClick={() => {
                onDelete();
                setDeleteOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ── Compact edit form (name / description / cover) ─────────── */

function TripEditDialog({
  open,
  onOpenChange,
  trip,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: TripRecord;
  saving: boolean;
  onSave: (patch: EditableTripPatch) => void;
}) {
  const [name, setName] = useState(trip.name);
  const [description, setDescription] = useState(trip.description ?? "");
  const [coverImage, setCoverImage] = useState(trip.coverImage ?? "");
  const [nameError, setNameError] = useState<string | null>(null);

  // Reset local state each time the dialog opens so stale edits never leak.
  useEffect(() => {
    if (open) {
      setName(trip.name);
      setDescription(trip.description ?? "");
      setCoverImage(trip.coverImage ?? "");
      setNameError(null);
    }
  }, [open, trip]);

  const submit = () => {
    if (!name.trim()) {
      setNameError("Give your trip a name.");
      return;
    }
    onSave({ name, description, coverImage });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit trip details</DialogTitle>
          <DialogDescription>
            Update the basics — dates and destination stay fixed here to keep
            every scheduled day valid.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-trip-name">Trip name</Label>
            <Input
              id="edit-trip-name"
              value={name}
              maxLength={100}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "edit-trip-name-error" : undefined}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
            />
            {nameError ? (
              <p id="edit-trip-name-error" role="alert" className="text-sm text-destructive">
                {nameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-trip-description">Description</Label>
            <Textarea
              id="edit-trip-description"
              rows={3}
              maxLength={500}
              value={description}
              placeholder="What makes this trip special?"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cover photo</Label>
            <CoverImageUpload value={coverImage} onChange={setCoverImage} disabled={saving} />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
