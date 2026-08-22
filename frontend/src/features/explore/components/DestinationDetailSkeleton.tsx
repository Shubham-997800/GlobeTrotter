import { cn } from "@/lib/utils";

/**
 * Destination detail page skeleton for loading state
 */
export function DestinationDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-6" aria-hidden="true">
      {/* Hero skeleton */}
      <section className="relative rounded-3xl overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted/10" />
        <div className="relative z-10 p-6 md:p-10 lg:p-14 h-[500px]">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-6 w-48 animate-pulse rounded-full bg-muted-foreground/20" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-muted-foreground/20" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-muted-foreground/20" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-24 animate-pulse rounded-full bg-muted-foreground/20" />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-pulse rounded bg-muted-foreground/20" />
                  <div className="space-y-1">
                    <div className="h-5 w-20 animate-pulse rounded bg-muted-foreground/20" />
                    <div className="h-3 w-28 animate-pulse rounded bg-muted-foreground/20" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="h-12 w-48 animate-pulse rounded-xl bg-muted-foreground/20" />
              <div className="h-12 w-48 animate-pulse rounded-xl border border-subtle-border bg-transparent" />
              <div className="h-12 w-12 animate-pulse rounded-xl border border-subtle-border bg-transparent" />
              <div className="h-12 w-12 animate-pulse rounded-xl border border-subtle-border bg-transparent" />
              <div className="h-12 w-12 animate-pulse rounded-xl border border-subtle-border bg-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Tab skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-subtle-border pb-1 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 rounded-t-lg bg-muted-foreground/10" />
          ))}
        </div>

        {/* Tab content skeleton */}
        <div className="space-y-8 animate-pulse">
          {/* About section */}
          <section className="space-y-3">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </section>

          {/* Quick info cards */}
          <section className="space-y-3">
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-subtle-border bg-card p-4 space-y-2">
                  <div className="h-5 w-12 rounded bg-muted" />
                  <div className="h-8 w-24 rounded bg-muted" />
                  <div className="h-4 w-16 rounded bg-muted" />
                </div>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="space-y-3">
            <div className="h-6 w-36 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-24 animate-pulse rounded-full border border-subtle-border bg-card" />
              ))}
            </div>
          </section>

          {/* Nearby destinations */}
          <section className="space-y-3">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative flex flex-col overflow-hidden rounded-2xl border border-subtle-border bg-card">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-24 rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2].map((j) => (
                        <div key={j} className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                      ))}
                    </div>
                    <div className="h-10 w-full animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Other tabs skeleton */}
          <section className="space-y-3">
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group relative flex flex-col overflow-hidden rounded-2xl border border-subtle-border bg-card">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-24 rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="h-4 w-20 rounded bg-muted" />
                      <div className="h-4 w-20 rounded bg-muted" />
                    </div>
                    <div className="h-10 w-full animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border border-subtle-border bg-card p-4 space-y-2 animate-pulse">
                  <div className="h-5 w-20 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}