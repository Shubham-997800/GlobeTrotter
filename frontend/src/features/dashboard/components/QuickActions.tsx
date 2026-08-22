import { Link } from "react-router-dom";
import {
  ArrowRight,
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
        "group flex h-full flex-col rounded-2xl border p-4 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        emphasized
          ? "border-primary bg-primary text-white shadow-md hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
          : "border-subtle-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
      )}
    >
      <span
        className={cn(
          "mb-3 flex size-10 items-center justify-center rounded-xl",
          emphasized ? "bg-white/15" : "bg-primary-light dark:bg-primary/15",
        )}
      >
        <Icon
          className={cn("size-5", emphasized ? "text-white" : "text-primary")}
          aria-hidden="true"
        />
      </span>
      <span className="text-sm font-semibold">{action.title}</span>
      <span
        className={cn(
          "mt-1 text-xs leading-relaxed",
          emphasized ? "text-white/85" : "text-muted-foreground",
        )}
      >
        {action.description}
      </span>
      <ArrowRight
        aria-hidden="true"
        className={cn(
          "mt-auto size-4 self-end pt-3 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100",
          emphasized ? "text-white" : "text-primary",
        )}
      />
    </Link>
  );
}

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <div className="mb-4">
        <h2
          id="quick-actions-heading"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          Quick Actions
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Jump straight into planning
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {quickActions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
}
