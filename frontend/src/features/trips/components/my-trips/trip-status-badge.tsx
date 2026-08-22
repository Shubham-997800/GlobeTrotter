import { AlertTriangle, BadgeCheck, Archive, Compass, PlaneTakeoff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MyTripStatus } from "../../trips.types";

export type TripBadgeStatus = MyTripStatus | "archived";

/**
 * Semantic status colors from the theme tokens — no arbitrary hex.
 * Upcoming → travel blue · Ongoing → success green ·
 * Completed → neutral · Draft → warning amber · Archived → muted.
 */
const STATUS_META: Record<
  TripBadgeStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "border-info-border bg-info-bg text-info-text",
  },
  ongoing: {
    label: "Ongoing",
    className: "border-success-border bg-success-bg text-success-text",
  },
  completed: {
    label: "Completed",
    className: "border-border bg-muted text-muted-foreground",
  },
  draft: {
    label: "Draft",
    className: "border-warning-border bg-warning-bg text-warning-text",
  },
  archived: {
    label: "Archived",
    className:
      "border-border bg-background/90 text-muted-foreground backdrop-blur-sm",
  },
};

const STATUS_ICONS: Record<TripBadgeStatus, typeof Compass> = {
  upcoming: PlaneTakeoff,
  ongoing: Compass,
  completed: BadgeCheck,
  draft: AlertTriangle,
  archived: Archive,
};

export function TripStatusBadge({
  status,
  withIcon = false,
  className,
}: {
  status: TripBadgeStatus;
  withIcon?: boolean;
  className?: string;
}) {
  const meta = STATUS_META[status];
  const Icon = STATUS_ICONS[status];
  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      {withIcon ? <Icon className="size-3" aria-hidden="true" /> : null}
      {meta.label}
    </Badge>
  );
}
