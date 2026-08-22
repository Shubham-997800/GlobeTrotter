import { Globe } from "lucide-react";

import { cn } from "@/lib/utils";

interface LogoProps {
  name: string;
  tagline?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({
  name,
  tagline,
  className,
  iconClassName,
  textClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-travel-blue text-primary-foreground shadow-sm",
          iconClassName,
        )}
      >
        <Globe className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span
          className={cn("text-base font-semibold tracking-tight", textClassName)}
        >
          {name}
        </span>
        {tagline ? (
          <span className="text-[11px] font-normal text-muted-foreground">
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}