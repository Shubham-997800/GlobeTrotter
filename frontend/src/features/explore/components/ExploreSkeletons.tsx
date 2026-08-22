/**
 * Hero skeleton for Explore page
 */
export function HeroSkeleton() {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-muted" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted/10" />
      <div className="relative z-10 p-6 md:p-10 lg:p-14">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-6 w-32 animate-pulse rounded-full bg-muted-foreground/20" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted-foreground/20" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted-foreground/20" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-muted-foreground/20" />
            ))}
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-5 w-5 animate-pulse rounded bg-muted-foreground/20" />
                <div className="space-y-1">
                  <div className="h-6 w-16 animate-pulse rounded bg-muted-foreground/20" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted-foreground/20" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-12 w-48 animate-pulse rounded-xl bg-muted-foreground/20" />
        </div>
      </div>
    </section>
  );
}

/**
 * Trending destinations skeleton
 */
export function TrendingDestinationsSkeleton({ count = 4 }: { count?: number } = {}) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <DestinationCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/**
 * Destination grid skeleton
 */
export function DestinationGridSkeleton({ count = 8 }: { count?: number } = {}) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <DestinationCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/**
 * Individual destination card skeleton
 */
export function DestinationCardSkeleton() {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-subtle-border bg-card shadow-sm animate-pulse">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-muted-foreground/10" />
      </div>
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-16 rounded-full bg-muted" />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-subtle-border pt-3">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="h-10 w-full rounded bg-muted" />
      </div>
    </article>
  );
}

/**
 * Category tabs skeleton
 */
export function CategorySkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 animate-pulse rounded-full px-4 py-1.5 bg-muted"
          style={{ width: `${80 + Math.random() * 40}px` }}
        />
      ))}
    </div>
  );
}

/**
 * Filter bar skeleton
 */
export function FilterSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse flex-1 min-w-[140px] max-w-[200px] h-10 rounded-lg bg-muted"
        />
      ))}
    </div>
  );
}

/**
 * Search results skeleton
 */
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <DestinationCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Destination detail page skeleton
 */
export function DestinationDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-6" aria-hidden="true">
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

      <div className="space-y-6">
        <div className="flex gap-2 border-b border-subtle-border pb-1 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 rounded-t-lg bg-muted-foreground/10" />
          ))}
        </div>

        <div className="space-y-8 animate-pulse">
          <section className="space-y-3">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </section>

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

          <section className="space-y-3">
            <div className="h-6 w-36 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-24 animate-pulse rounded-full border border-subtle-border bg-card" />
              ))}
            </div>
          </section>

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