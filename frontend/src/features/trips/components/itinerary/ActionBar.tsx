import { CalendarCheck2, Eye, Loader2, Rocket, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SaveState, ValidationIssue } from "@/features/trips/itinerary.types";
import { cn } from "@/lib/utils";

interface ActionBarProps {
  saveState: SaveState;
  lastSavedAt: number | null;
  issues: ValidationIssue[];
  canComplete: boolean;
  isCompleting: boolean;
  onSave: () => void;
  onPreview: () => void;
  onComplete: () => void;
}

export function ActionBar({
  saveState,
  lastSavedAt,
  issues,
  canComplete,
  isCompleting,
  onSave,
  onPreview,
  onComplete,
}: ActionBarProps) {
  const blockingIssues = issues.filter((issue) => issue.severity === "error");

  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 -mx-4 mt-6 border-t border-border bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:-mx-6 sm:px-6",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <SaveStatePill saveState={saveState} lastSavedAt={lastSavedAt} />

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onSave}
            disabled={saveState === "saved"}
          >
            {saveState === "saving" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Save now
          </Button>
          <Button
            size="sm"
            disabled={!canComplete || isCompleting || blockingIssues.length > 0}
            title={
              blockingIssues.length > 0
                ? "Resolve validation errors first"
                : undefined
            }
            onClick={onComplete}
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Rocket className="h-4 w-4" aria-hidden="true" />
            )}
            Complete itinerary
          </Button>
        </div>
      </div>

      {issues.length > 0 ? (
        <p
          role="status"
          className="mx-auto mt-2 max-w-7xl text-xs text-muted-foreground"
        >
          <span className="font-medium text-warning-text">
            {blockingIssues.length > 0
              ? `${blockingIssues.length} issue${blockingIssues.length === 1 ? "" : "s"} to fix before completing`
              : `${issues.length} suggestion${issues.length === 1 ? "" : "s"} available`}
          </span>{" "}
          — see the highlighted day tabs.
        </p>
      ) : null}
    </div>
  );
}

function SaveStatePill({
  saveState,
  lastSavedAt,
}: Pick<ActionBarProps, "saveState" | "lastSavedAt">) {
  let label = "All changes saved";
  let tone =
    "border-success-border bg-success-bg text-success-text dark:bg-emerald-500/15 dark:text-emerald-300";

  if (saveState === "dirty") {
    label = "Unsaved changes";
    tone =
      "border-warning-border bg-warning-bg text-warning-text dark:bg-amber-500/15 dark:text-amber-300";
  } else if (saveState === "saving") {
    label = "Saving…";
    tone = "border-info-border bg-info-bg text-info-text dark:bg-sky-500/15 dark:text-sky-300";
  }

  return (
    <div className="flex min-w-0 flex-col">
      <Badge variant="outline" className={cn("w-fit gap-1.5", tone)}>
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            saveState === "saving" && "animate-pulse bg-current",
            saveState !== "saving" && "bg-current",
          )}
        />
        {label}
      </Badge>
      {lastSavedAt && saveState !== "saving" ? (
        <time dateTime={new Date(lastSavedAt).toISOString()} className="mt-0.5 pl-1 text-[11px] text-muted-foreground">
          Last saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </time>
      ) : null}
    </div>
  );
}