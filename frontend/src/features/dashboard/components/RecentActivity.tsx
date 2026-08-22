import { Link } from "react-router-dom";
import {
  Luggage,
  Route,
  Ticket,
  UsersRound,
  Wallet,
} from "lucide-react";

import { recentActivity } from "@/features/dashboard/dashboard.data";
import type { ActivityEvent } from "@/features/dashboard/dashboard.types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<
  ActivityEvent["type"],
  { icon: typeof Luggage; classes: string }
> = {
  "trip-created": { icon: Luggage, classes: "bg-primary-light text-primary dark:bg-primary/15" },
  "activity-added": { icon: Ticket, classes: "bg-activity/15 text-activity dark:bg-activity/20" },
  "itinerary-updated": { icon: Route, classes: "bg-travel-blue/15 text-travel-blue dark:bg-travel-blue/20" },
  "budget-updated": { icon: Wallet, classes: "bg-budget/15 text-budget dark:bg-budget/20" },
  "community-post": { icon: UsersRound, classes: "bg-stay/15 text-stay dark:bg-stay/20" },
};

export function RecentActivity() {
  return (
    <section aria-labelledby="recent-activity-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2
            id="recent-activity-heading"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            Recent Activity
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            What you&apos;ve been up to
          </p>
        </div>
        <Link
          to="/trips"
          className="shrink-0 rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View All
        </Link>
      </div>

      <ol className="relative space-y-1 border-l border-subtle-border pl-6">
        {recentActivity.map((event) => {
          const style = TYPE_STYLES[event.type];
          const Icon = style.icon;
          return (
            <li key={event.id} className="relative py-2">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -left-[38px] top-3 flex size-7 items-center justify-center rounded-full ring-4 ring-background",
                  style.classes,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <h3 className="text-sm font-semibold text-foreground">
                  {event.title}
                </h3>
                <time className="text-xs text-secondary-text">
                  {event.timestamp}
                </time>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {event.description}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
