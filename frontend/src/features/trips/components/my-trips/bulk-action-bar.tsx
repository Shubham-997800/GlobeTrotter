import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Download,
  FileJson,
  FileSpreadsheet,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportFormat } from "./export-trips";
import type { TripCardModel } from "../../my-trips.logic";

/**
 * Contextual action bar — only rendered while trips are selected.
 * Fixed above the mobile FAB and safe-area so nothing is covered.
 */
export function BulkActionBar({
  selectedTrips,
  onClearSelection,
  onSelectAllVisible,
  onDeleteRequest,
  onArchive,
  onExport,
  archiveBusy = false,
  allVisibleSelected = false,
}: {
  selectedTrips: TripCardModel[];
  onClearSelection: () => void;
  onSelectAllVisible: () => void;
  onDeleteRequest: () => void;
  onArchive: (archived: boolean) => void;
  onExport: (format: ExportFormat) => void;
  archiveBusy?: boolean;
  allVisibleSelected?: boolean;
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const count = selectedTrips.length;
  const anyArchived = selectedTrips.some((trip) => trip.record.archivedAt);
  // In the archived view the bulk action restores; otherwise it archives.
  const restoreMode = anyArchived;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-border bg-elevated/95 p-2.5 shadow-xl shadow-black/10 backdrop-blur supports-[backdrop-filter]:bg-elevated/85 sm:bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:inset-x-auto sm:left-1/2 sm:w-max sm:max-w-[calc(100vw-1.5rem)] sm:-translate-x-1/2 sm:flex-nowrap"
    >
      <div className="flex min-w-0 items-center gap-1.5 pl-1.5 pr-1">
        <span className="whitespace-nowrap text-sm font-semibold text-foreground">
          {count} {count === 1 ? "trip" : "trips"} selected
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <span aria-hidden="true" className="hidden h-6 w-px bg-border sm:block" />

      <div className="ml-auto flex flex-wrap items-center gap-1.5 sm:ml-0">
        {!allVisibleSelected ? (
          <Button variant="ghost" size="sm" onClick={onSelectAllVisible}>
            Select all shown
          </Button>
        ) : null}

        {/* Export — real files built from the actual selected records */}
        <DropdownMenu open={exportOpen} onOpenChange={setExportOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm">
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={() => onExport("csv")}>
              <FileSpreadsheet aria-hidden="true" />
              CSV file
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onExport("json")}>
              <FileJson aria-hidden="true" />
              JSON file
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="secondary"
          size="sm"
          disabled={archiveBusy}
          onClick={() => onArchive(!restoreMode)}
        >
          {restoreMode ? (
            <>
              <ArchiveRestore className="size-4" aria-hidden="true" />
              Unarchive
            </>
          ) : (
            <>
              <Archive className="size-4" aria-hidden="true" />
              Archive
            </>
          )}
        </Button>

        <Button
          size="sm"
          className="bg-destructive text-white hover:bg-destructive/90"
          onClick={onDeleteRequest}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </div>
  );
}
