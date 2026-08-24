import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Luggage,
  Route,
  CalendarDays,
  Wallet,
  Users,
  Settings,
  Search,
  Plus,
  Plane,
  Utensils,
  Ticket,
} from "lucide-react";

import { cn } from "@/lib/utils";

const CURRENCY = "₹";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const sidebarItems: {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
}[] = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: Luggage, label: "My Trips", active: true },
  { icon: Route, label: "Itinerary" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: Wallet, label: "Budget" },
  { icon: Users, label: "Community" },
  { icon: Settings, label: "Settings" },
];

const activities = [
  {
    day: "Day 1",
    time: "09:00",
    label: "Fushimi Inari Shrine",
    type: "activity",
    tone: "bg-activity text-white",
    dot: "bg-activity",
  },
  {
    day: "Day 1",
    time: "12:30",
    label: "Ramen at Ichiran",
    type: "food",
    tone: "bg-food text-white",
    dot: "bg-food",
  },
  {
    day: "Day 2",
    time: "08:00",
    label: "Shinkansen → Osaka",
    type: "transport",
    tone: "bg-transport text-white",
    dot: "bg-transport",
  },
] as const;

const TYPE_ICONS = {
  activity: Ticket,
  food: Utensils,
  transport: Plane,
} as const;

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-clip rounded-2xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/30",
        className,
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
        </div>
        <div className="ml-2 hidden flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          app.globetrotter.io/trips/japan-spring
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border bg-muted/20 p-3 sm:flex">
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium",
                item.active
                  ? "bg-active-nav text-primary"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.label}
            </div>
          ))}
          <div className="mt-auto rounded-lg border border-dashed border-border p-2.5 text-[11px] text-muted-foreground">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <Plus className="h-3 w-3 text-primary" aria-hidden="true" />
              New Trip
            </div>
            <p>Plan your next adventure</p>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Japan Spring Trip</p>
              <p className="text-xs text-muted-foreground">
                Kyoto · Osaka · Tokyo — Apr 12 to Apr 20
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
                Planning
              </span>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add activity
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <motion.div
            className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {[
              { label: "Budget", value: `${CURRENCY}45,000` },
              { label: "Days", value: "9" },
              { label: "Cities", value: "3" },
              { label: "Activities", value: "12" },
            ].map((kpi) => (
              <motion.div
                key={kpi.label}
                variants={fadeUp}
                className="rounded-xl border border-border bg-background p-3"
              >
                <p className="truncate text-[11px] text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight">
                  {kpi.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Activities + budget summary */}
          <div className="grid gap-3 lg:grid-cols-5">
              <div className="rounded-xl border border-border bg-background p-3 lg:col-span-3">
              <p className="mb-3 text-xs font-semibold">Upcoming activities</p>
              <motion.ul
                className="space-y-2.5"
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                {activities.map((row) => {
                  const RowIcon = TYPE_ICONS[row.type];
                  return (
                    <motion.li key={row.label} variants={fadeUp} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          row.tone,
                        )}
                      >
                        <RowIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {row.label}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {row.day} · {row.time}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          row.dot,
                        )}
                      />
                    </motion.li>
                  );
                })}
              </motion.ul>
            </div>

            <div className="rounded-xl border border-border bg-background p-3 lg:col-span-2">
              <p className="mb-3 text-xs font-semibold">Budget summary</p>
              <div className="flex items-end justify-between">
                <p className="text-lg font-bold">{CURRENCY}28,500</p>
                <p className="text-[11px] text-muted-foreground">of {CURRENCY}45,000</p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-warning to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: "63%" }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px]">
                <span className="text-success">Spent</span>
                <span className="text-muted-foreground">{CURRENCY}16,500 remaining</span>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                {[
                  { label: "Flights", value: `${CURRENCY}9,200` },
                  { label: "Stays", value: `${CURRENCY}11,400` },
                  { label: "Food", value: `${CURRENCY}3,900` },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="font-medium">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}