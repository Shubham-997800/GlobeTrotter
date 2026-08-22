import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PendingDeleteTrips {
  ids: string[];
  names: string[];
}

/**
 * Confirmation for destructive deletes (single + bulk). Focus is trapped
 * by the Radix dialog; the destructive action stays disabled while the
 * mutation is in flight so requests can't be double-fired.
 */
export function DeleteTripsDialog({
  open,
  onOpenChange,
  trips,
  pending = false,
  error = null,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trips: PendingDeleteTrips | null;
  /** Number of deletions that already succeeded during a retry. */
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
}) {
  if (!trips) return null;

  const count = trips.ids.length;
  const single = count === 1;
  const title = single ? "Delete this trip?" : `Delete ${count} trips?`;

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <span
            aria-hidden="true"
            className="mb-1 flex size-11 items-center justify-center rounded-full border border-error-border bg-error-bg"
          >
            <AlertTriangle className="size-5 text-error-text" />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {single ? (
              <>
                You&apos;re about to delete{" "}
                <span className="font-semibold text-foreground">
                  “{trips.names[0]}”
                </span>
                . This will permanently remove the trip and its saved plan.
                This action cannot be undone.
              </>
            ) : (
              <>
                You&apos;re about to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {count} trips
                </span>
                , along with their itineraries and planning data. This action
                cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!single ? (
          <ul
            aria-label="Trips that will be deleted"
            className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-subtle-border bg-muted/50 p-3 text-sm text-secondary-text"
          >
            {trips.names.map((name) => (
              <li key={name} className="truncate">
                • {name}
              </li>
            ))}
          </ul>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-error-border bg-error-bg px-3 py-2 text-sm text-error-text"
          >
            {error}
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={pending}
            aria-live="polite"
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : error ? (
              "Retry delete"
            ) : (
              <>
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
