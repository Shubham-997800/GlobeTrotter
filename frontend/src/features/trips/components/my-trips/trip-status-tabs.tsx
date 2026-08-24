import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { MyTripsStatusFilter } from "../../trips.types";

export interface StatusTabInfo {
  value: MyTripsStatusFilter;
  label: string;
  count: number;
}

/**
 * Status tabs double as the primary status filter — the selected tab IS
 * the `status` URL param, so tabs and the filter system can never drift
 * apart. Counts arrive precomputed from shared logic.
 */
export function TripStatusTabs({
  value,
  onValueChange,
  tabs,
}: {
  value: MyTripsStatusFilter;
  onValueChange: (next: MyTripsStatusFilter) => void;
  tabs: StatusTabInfo[];
}) {
  return (
    <div className="relative min-w-0 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Tabs value={value} onValueChange={(v) => onValueChange(v as MyTripsStatusFilter)}>
        <TabsList className="w-max max-w-none">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-none px-3 sm:px-3.5"
              title={tab.label}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              <span
                className={cn(
                  "ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-px text-[11px] font-semibold leading-4",
                  "bg-muted text-muted-foreground",
                  "data-[active=true]:bg-primary/15 data-[active=true]:text-primary",
                )}
                data-active={tab.value === value}
              >
                {tab.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
    </div>
  );
}
