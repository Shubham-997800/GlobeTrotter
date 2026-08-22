import { Check, CloudUpload, Loader2 } from "lucide-react";

import type { DraftState } from "../useDraftAutosave";
import { cn } from "@/lib/utils";

interface DraftStatusProps {
  state: DraftState;
  savedAt: Date | null;
  className?: string;
}

const LABELS: Record<DraftState, string> = {
  idle: "Draft",
  dirty: "Unsaved changes",
  saving: "Saving draft…",
  saved: "Draft saved",
};

/** Live-region pill telling the user where their autosave stands. */
export function DraftStatus({ state, savedAt, className }: DraftStatusProps) {
  const Icon =
    state === "saving"
      ? Loader2
      : state === "saved"
        ? Check
        : state === "dirty"
          ? CloudUpload
          : null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        state === "dirty"
          ? "border-warning-border bg-warning-bg text-warning-text"
          : "border-subtle-border bg-muted text-muted-foreground",
        className,
      )}
      title={
        savedAt && state !== "dirty" && state !== "saving"
          ? `Last saved ${savedAt.toLocaleTimeString()}`
          : undefined
      }
    >
      {Icon ? (
        <Icon
          aria-hidden="true"
          className={cn("h-3.5 w-3.5", state === "saving" && "animate-spin")}
        />
      ) : null}
      {LABELS[state]}
    </p>
  );
}
