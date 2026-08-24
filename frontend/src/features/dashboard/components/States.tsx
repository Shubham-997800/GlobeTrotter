import { AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/* ── EmptyState ──────────────────────────────────────────────── */

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; to: string };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-subtle-border px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-light dark:bg-primary/15">
        <Icon className="size-6 text-primary" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? (
        <Button asChild size="sm" className="mt-5">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}

/* ── ErrorState ──────────────────────────────────────────────── */

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this section. Check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-error-border bg-error-bg px-6 py-12 text-center"
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-error-border/40">
        <AlertTriangle className="size-6 text-error-text" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-error-text">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-error-text/80">{description}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try Again
        </Button>
      ) : null}
    </div>
  );
}

/* ── DashboardSkeleton ───────────────────────────────────────── */

function Bar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`}
    />
  );
}

/** Layout-matched placeholder shown while the dashboard snapshot loads. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-hidden="true">
      {/* Welcome */}
      <div className="space-y-3">
        <Bar className="h-4 w-40" />
        <Bar className="h-8 w-80 max-w-full" />
        <Bar className="h-4 w-64 max-w-full" />
        <div className="flex gap-3 pt-1">
          <Bar className="h-9 w-32 rounded-lg" />
          <Bar className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      {/* Featured banner */}
      <Bar className="h-72 rounded-2xl sm:h-80 lg:h-96" />

      {/* Regional selections */}
      <section className="space-y-3">
        <Bar className="h-6 w-56" />
        <div className="flex gap-2 overflow-hidden">
          {["w-16", "w-20", "w-24", "w-20", "w-24", "w-16"].map((w, i) => (
            <Bar key={i} className={`h-8 shrink-0 ${w}`} />
          ))}
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Bar key={i} className="h-48 w-64 shrink-0 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Popular destinations */}
      <section className="space-y-3">
        <Bar className="h-6 w-64" />
        <div className="flex gap-2">
          {["w-20", "w-20", "w-24", "w-16", "w-24"].map((w, i) => (
            <Bar key={i} className={`h-8 ${w}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Bar key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Your trips */}
      <section className="space-y-3">
        <Bar className="h-6 w-40" />
        <Bar className="h-64 rounded-2xl" />
        <Bar className="h-20 rounded-xl" />
        <Bar className="h-20 rounded-xl" />
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <Bar className="h-6 w-48" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Bar key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Insights */}
      <section className="space-y-3">
        <Bar className="h-6 w-44" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Bar key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Activity */}
      <section className="space-y-3">
        <Bar className="h-6 w-44" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Bar className="size-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Bar className="h-3.5 w-1/3" />
                <Bar className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
