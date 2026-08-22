import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DraftState } from "../useDraftAutosave";
import { cn } from "@/lib/utils";

interface TripActionBarProps {
  onCancel: () => void;
  onSaveDraft: () => void;
  savingDraft: boolean;
  creating: boolean;
  draftState: DraftState;
  /** "edit" swaps the create-only actions for update semantics. */
  mode?: "create" | "edit";
}

/**
 * Sticky bottom bar (mobile) / inline footer (desktop) with the three
 * primary actions. Create is always enabled — validation errors are
 * reported on submit so users aren't left guessing which section failed.
 */
export function TripActionBar({
  onCancel,
  onSaveDraft,
  savingDraft,
  creating,
  draftState,
  mode = "create",
}: TripActionBarProps) {
  const busy = savingDraft || creating;
  const isEdit = mode === "edit";

  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 -mx-4 mt-8 border-t border-subtle-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6",
        "supports-[backdrop-filter]:bg-background/80",
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          {!isEdit ? (
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={busy}
            >
              {savingDraft ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Save as Draft
            </Button>
          ) : null}
          <Button type="submit" disabled={busy}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Trip"
            )}
          </Button>
        </div>
      </div>
      {/* Screen-reader-friendly status echo of the autosave pill. */}
      <p className="sr-only" role="status" aria-live="polite">
        {draftState === "dirty"
          ? "You have unsaved changes"
          : draftState === "saving"
            ? "Saving draft"
            : draftState === "saved"
              ? "All changes saved"
              : ""}
      </p>
    </div>
  );
}
