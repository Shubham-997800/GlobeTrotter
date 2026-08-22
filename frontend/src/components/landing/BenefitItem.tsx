import type { Benefit } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BenefitItemProps {
  benefit: Benefit;
  className?: string;
}

export function BenefitItem({ benefit, className }: BenefitItemProps) {
  const Icon = benefit.icon;

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-primary-light text-primary dark:bg-primary/15">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {benefit.title}
        </h3>
        <p className="text-pretty mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {benefit.description}
        </p>
      </div>
    </div>
  );
}