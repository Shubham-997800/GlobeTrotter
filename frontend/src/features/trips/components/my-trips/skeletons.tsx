import { cn } from "@/lib/utils";

function Bar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-muted", className)}
    />
  );
}

export function TripStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 sm:p-5"
        >
          <Bar className="size-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bar className="h-5 w-12" />
            <Bar className="h-3 w-20 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TripHighlightSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <Bar className="h-[19rem] rounded-3xl sm:h-[21rem] lg:h-[23rem]" />
    </div>
  );
}

/** Layout-matched placeholder for one grid card. */
export function TripCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <Bar className="aspect-[16/9] rounded-none" />
      <div className="space-y-3 p-5">
        <Bar className="h-5 w-3/4" />
        <Bar className="h-3.5 w-1/2" />
        <Bar className="h-3 w-full" />
        <div className="flex gap-2 pt-1">
          <Bar className="h-6 w-16 rounded-full" />
          <Bar className="h-6 w-14 rounded-full" />
        </div>
        <Bar className="h-2 w-full rounded-full" />
        <div className="flex items-center justify-between pt-1">
          <Bar className="h-4 w-20" />
          <Bar className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TripGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TripRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
    >
      <Bar className="size-5 shrink-0 rounded-md" />
      <Bar className="h-16 w-24 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Bar className="h-4 w-40 max-w-full" />
        <Bar className="h-3 w-24 max-w-full" />
      </div>
      <Bar className="hidden h-4 w-32 md:block" />
      <Bar className="hidden h-4 w-16 lg:block" />
    </div>
  );
}

export function TripListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <TripRowSkeleton key={i} />
      ))}
    </div>
  );
}
