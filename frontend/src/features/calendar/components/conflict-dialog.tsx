import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { formatTimeLabel } from "../calendar.utils";
import type { ScheduleConflict } from "../calendar.types";

/**
 * Shown when saving an event would overlap something already planned —
 * the traveler can go back to the form or keep the slot anyway.
 */
export function ConflictDialog({
  open,
  conflicts,
  duplicateTitle,
  onEditSchedule,
  onKeepAnyway,
}: {
  open: boolean;
  conflicts: ScheduleConflict[];
  duplicateTitle?: boolean;
  onEditSchedule: () => void;
  onKeepAnyway: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onEditSchedule())}>
      <DialogContent className="sm:max-w-md sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-warning" aria-hidden="true" />
            Schedule conflict
          </DialogTitle>
          <DialogDescription>
            This time overlaps with{" "}
            {conflicts.length > 0 ? `${conflicts.length} existing entr${conflicts.length === 1 ? "y" : "ies"}` : "an identical entry"}
            .
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2" aria-label="Conflicting entries">
          {duplicateTitle ? (
            <li className="rounded-xl border border-warning-border bg-warning-bg p-3 text-sm">
              <p className="font-medium text-warning-text">
                An event with the same title already starts at this exact time.
              </p>
              <p className="mt-0.5 text-xs text-warning-text/80">Possible duplicate.</p>
            </li>
          ) : null}
          {conflicts.map((conflict) => (
            <li
              key={conflict.eventId}
              className="rounded-xl border border-warning-border bg-warning-bg p-3"
            >
              <p className="text-sm font-medium text-warning-text">{conflict.title}</p>
              <p className="text-xs text-warning-text/80">
                {formatTimeLabel(conflict.startTime)} – {formatTimeLabel(conflict.endTime)}
              </p>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={onEditSchedule}>
            Edit schedule
          </Button>
          <Button onClick={onKeepAnyway}>Keep anyway</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
