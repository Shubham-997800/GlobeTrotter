import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Small right-aligned slot (e.g. "Step 1 of 5"). */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Consistent numbered-section wrapper for the create-trip form. */
export function SectionCard({
  icon,
  title,
  description,
  aside,
  children,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn("border-border/60", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          {icon ? (
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:h-[18px] [&_svg]:w-[18px]"
            >
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {aside}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
