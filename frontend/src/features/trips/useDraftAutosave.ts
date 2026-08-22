import { useEffect, useRef, useState } from "react";

import { tripsService } from "./trips.service";
import type { TripFormValues } from "./schemas/create-trip.schema";

export type DraftState = "idle" | "dirty" | "saving" | "saved";

const AUTOSAVE_DEBOUNCE_MS = 800;

interface UseDraftAutosaveOptions {
  values: TripFormValues;
  /** Bumped whenever the user edits the form. */
  dirtyToken: number;
}

interface DraftAutosaveResult {
  draftState: DraftState;
  savedAt: Date | null;
  /** Draft restored from localStorage on first render, if any. */
  restored: TripFormValues | null;
  markSavedNow: () => void;
  clearLocalDraft: () => void;
}

/**
 * Local (localStorage) draft autosave with debounce + restore-on-mount.
 * Deliberately client-only — the explicit "Save as Draft" button is the
 * one that hits the service and creates a real record.
 */
export function useDraftAutosave({
  values,
  dirtyToken,
}: UseDraftAutosaveOptions): DraftAutosaveResult {
  // Read once during initial render so the page can hydrate the form
  // before the first paint of controlled inputs.
  const [restored] = useState<TripFormValues | null>(() =>
    tripsService.readActiveDraft(),
  );
  const [state, setState] = useState<DraftState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const skipFirstRun = useRef(true);
  // Latest form snapshot for the debounced write — keeps the effect
  // depending only on `dirtyToken` (one save tick per edit batch).
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    if (skipFirstRun.current) {
      skipFirstRun.current = false;
      return;
    }
    if (dirtyToken === 0) return;

    // Immediate feedback before the debounce window elapses is intentional.
    // oxlint-disable-next-line react(set-state-in-effect)
    setState("dirty");
    const timer = setTimeout(() => {
      setState("saving");
      try {
        tripsService.writeActiveDraft(valuesRef.current);
        setSavedAt(new Date());
        setState("saved");
      } catch {
        setState("dirty");
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [dirtyToken]);

  return {
    draftState: state,
    savedAt,
    restored,
    markSavedNow() {
      setSavedAt(new Date());
      setState("saved");
    },
    clearLocalDraft() {
      tripsService.clearActiveDraft();
    },
  };
}
