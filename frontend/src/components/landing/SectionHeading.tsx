import { Badge } from "@/components/ui/badge";
import type { SectionHeading as SectionHeadingType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SectionHeading({
  heading,
  align = "center",
  className,
}: {
  heading: SectionHeadingType;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Badge variant="soft">{heading.badge}</Badge>
      <h2 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {heading.title}
      </h2>
      {heading.description ? (
        <p
          className={cn(
            "text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg",
            align === "center" && "max-w-2xl",
          )}
        >
          {heading.description}
        </p>
      ) : null}
    </div>
  );
}