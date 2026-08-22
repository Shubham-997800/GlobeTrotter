import type { ReactNode } from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitStatus = "idle" | "submitting" | "success";

interface SubmitButtonProps {
  /** Current async phase; drives the loading / success presentation. */
  status: SubmitStatus;
  label: string;
  labels?: Partial<Record<Exclude<SubmitStatus, "idle">, string>>;
  className?: string;
  children?: ReactNode;
}

/**
 * Auth submit button covering every state from the module spec:
 * default (idle) → submitting (spinner + disabled) → success (check,
 * briefly shown before redirect). Disabled while busy so duplicate
 * submissions are impossible.
 */
export function SubmitButton({
  status,
  label,
  labels = {},
  className,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      className={cn("w-full", className)}
      disabled={status !== "idle"}
      aria-busy={status === "submitting"}
    >
      {status === "submitting" ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {labels.submitting ?? "Please wait…"}
        </>
      ) : status === "success" ? (
        <>
          <Check aria-hidden="true" />
          {labels.success ?? "Success!"}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
