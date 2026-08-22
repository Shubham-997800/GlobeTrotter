import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  BarChart3,
  Settings,
  Search,
  Plus,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
} from "lucide-react";

import { cn } from "@/lib/utils";

const sidebarItems: {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
}[] = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: FolderKanban, label: "Projects" },
  { icon: ClipboardList, label: "Tasks" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

const kpis = [
  { label: "Active projects", value: "24", change: "+12%", up: true },
  { label: "Tasks completed", value: "1,284", change: "+8%", up: true },
  { label: "Team utilization", value: "86%", change: "-2%", up: false },
  { label: "On-time rate", value: "94%", change: "+5%", up: true },
] as const;

const bars = [42, 58, 50, 72, 64, 84, 76, 92, 70, 88];
const avg = 58;

const activityRows = [
  {
    team: "Product",
    initials: "MC",
    name: "Maya Chen",
    status: "In review",
    time: "2h ago",
    tone: "info",
  },
  {
    team: "Design",
    initials: "LO",
    name: "Liam Ortiz",
    status: "Done",
    time: "4h ago",
    tone: "success",
  },
  {
    team: "Engineering",
    initials: "SK",
    name: "Sana Kapoor",
    status: "On track",
    time: "Today",
    tone: "warning",
  },
] as const;

type Tone = "info" | "success" | "warning";

const toneStyles: Record<Tone, string> = {
  info: "bg-info/15 text-info",
  success: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
};

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/30",
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
          <Search className="h-3.5 w-3.5" />
          app.globetrotter.io/dashboard
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border bg-muted/20 p-3 sm:flex">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-hover hover:text-foreground",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
          <div className="mt-auto rounded-lg border border-dashed border-border p-2.5 text-[11px] text-muted-foreground">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <Plus className="h-3 w-3 text-primary" />
              New
            </div>
            <p>Create a project to get started</p>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Good morning, Alex</p>
              <p className="text-xs text-muted-foreground">
                Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-hover"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">This week</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                New task
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-border bg-background p-3"
              >
                <p className="truncate text-[11px] text-muted-foreground">
                  {kpi.label}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-lg font-semibold tracking-tight">
                    {kpi.value}
                  </p>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-[11px] font-medium",
                      kpi.up ? "text-primary" : "text-warning",
                    )}
                  >
                    {kpi.up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {kpi.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Activity */}
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-xl border border-border bg-background p-3 lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold">Delivery velocity</p>
                <span className="text-[11px] text-muted-foreground">
                  Last 8 weeks
                </span>
              </div>
              <div className="flex h-28 items-end gap-2">
                {bars.map((value, i) => (
                  <div
                    key={i}
                    className="group relative flex-1 rounded-sm bg-muted"
                  >
                    <div
                      className={cn(
                        "absolute inset-x-0 bottom-0 rounded-sm transition-colors group-hover:bg-primary/70",
                        value >= avg ? "bg-primary/80" : "bg-primary/25",
                      )}
                      style={{ height: `${Math.max(value, 12)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-3 lg:col-span-2">
              <p className="mb-3 text-xs font-semibold">Recent activity</p>
              <ul className="space-y-2.5">
                {activityRows.map((row) => (
                  <li key={row.name} className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-secondary-text">
                      {row.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{row.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {row.team}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          toneStyles[row.tone as Tone],
                        )}
                      >
                        {row.status}
                      </span>
                      <span className="hidden text-[11px] text-muted-foreground sm:inline">
                        {row.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Inline divider accent */}
          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Circle className="h-2 w-2 fill-primary text-primary" />
            <span>All systems operational · 3 active autopilot flows</span>
          </div>
        </div>
      </div>
    </div>
  );
}