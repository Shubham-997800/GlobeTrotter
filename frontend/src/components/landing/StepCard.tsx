import type { Step } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StepCardProps {
  step: Step;
  className?: string;
}

export function StepCard({ step, className }: StepCardProps) {
  const Icon = step.icon;

  return (
    <li
      className={cn(
        "relative flex flex-col items-center text-center",
        className,
      )}
    >
      {/* Step number node */}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card text-lg font-semibold text-foreground shadow-sm">
        {step.number}
      </div>

      <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
        {step.title}
      </h3>
      <p className="text-pretty mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>
    </li>
  );
}