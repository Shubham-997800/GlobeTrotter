import { Link } from "react-router-dom";
import {
  CalendarDays,
  Compass,
  PlusCircle,
  Ticket,
} from "lucide-react";

import { quickActions } from "@/features/dashboard/dashboard.data";
import type { QuickActionDef } from "@/features/dashboard/dashboard.types";
import { cn } from "@/lib/utils";

const ACTION_ICONS: Record<string, typeof Compass> = {
  "qa-create": PlusCircle,
  "qa-explore": Compass,
  "qa-activities": Ticket,
  "qa-calendar": CalendarDays,
};

function QuickActionCard({ action }: { action: QuickActionDef }) {
  const Icon = ACTION_ICONS[action.id] ?? Compass;
  const emphasized = Boolean(action.emphasized);

  return (
    <Link
      to={action.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 sm:p-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        emphasized
          ? "border-primary-active bg-primary-active text-white shadow-md"
          : "border-subtle-border bg-card hover:border-primary/30 hover:shadow-sm",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          emphasized ? "bg-white/15" : "bg-primary-light dark:bg-primary/15",
        )}
      >
        <Icon
          className={cn("size-4.5", emphasized ? "text-white" : "text-primary")}
          aria-hidden="true"
        />
      </span>
      <div className="min-w-0 flex-1">
        <span className={cn("text-sm font-semibold", emphasized ? "" : "text-foreground")}>
          {action.title}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-xs leading-relaxed",
            emphasized ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {action.description}
        </span>
      </div>
    </Link>
  );
}

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <div className="mb-3">
        <h2
          id="quick-actions-heading"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          Quick Actions
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {quickActions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
}
