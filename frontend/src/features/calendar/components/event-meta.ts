import {
  BedDouble,
  Plane,
  Sparkles,
  Target,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import type { CalendarEventType } from "../calendar.types";

/**
 * Visual identity per event type, mapped to the theme's travel-entity
 * tokens (TRIP green-blue family, ACTIVITY violet, FOOD orange,
 * TRANSPORT sky, STAY indigo).
 */
export interface EventTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Chip surface classes. */
  chipClass: string;
  /** Small solid dot for dense grids. */
  dotClass: string;
}

export const EVENT_TYPE_META: Record<CalendarEventType, EventTypeMeta> = {
  trip: {
    label: "Trip",
    icon: Plane,
    chipClass:
      "border-travel-blue-light bg-travel-blue-subtle text-travel-blue hover:bg-travel-blue-light",
    dotClass: "bg-travel-blue",
  },
  activity: {
    label: "Activity",
    icon: Target,
    chipClass: "border-activity/30 bg-activity/10 text-activity hover:bg-activity/20",
    dotClass: "bg-activity",
  },
  food: {
    label: "Food",
    icon: UtensilsCrossed,
    chipClass: "border-food/30 bg-food/10 text-food hover:bg-food/20",
    dotClass: "bg-food",
  },
  transport: {
    label: "Transport",
    icon: Plane,
    chipClass: "border-transport/30 bg-transport/10 text-transport hover:bg-transport/20",
    dotClass: "bg-transport",
  },
  accommodation: {
    label: "Stay",
    icon: BedDouble,
    chipClass: "border-stay/30 bg-stay/10 text-stay hover:bg-stay/20",
    dotClass: "bg-stay",
  },
  custom: {
    label: "Custom",
    icon: Sparkles,
    chipClass:
      "border-border bg-accent text-accent-foreground hover:bg-hover",
    dotClass: "bg-primary",
  },
};
