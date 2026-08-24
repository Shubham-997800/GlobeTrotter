import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Bookmark,
  CalendarDays,
  Compass,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Route,
  Settings,
  Shield,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";

export interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN_NAV: NavItemDef[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "My Trips", icon: Map },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/community", label: "Community", icon: UsersRound },
  { to: "/calendar", label: "Travel Calendar", icon: CalendarDays },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const ACCOUNT_NAV: NavItemDef[] = [
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help & Support", icon: HelpCircle },
];

interface SidebarChromeProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

function NavLinkRow({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItemDef;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "active:scale-[0.98]",
          collapsed && "justify-center px-0",
          isActive
            ? "border-l-2 border-primary bg-sidebar-active text-sidebar-active-text font-semibold"
            : "border-l-2 border-transparent text-sidebar-text hover:bg-sidebar-hover hover:text-foreground",
        )
      }
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: SidebarChromeProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <nav aria-label="Primary" className="flex min-h-0 flex-1 flex-col gap-1">
      {MAIN_NAV.map((item) => (
        <NavLinkRow
          key={item.to}
          item={item}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}

      {!collapsed ? (
        <>
          <div
            aria-hidden="true"
            className="mx-1 my-2 border-t border-sidebar-border"
          />
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-text">
            Account
          </p>
        </>
      ) : (
        <div
          aria-hidden="true"
          className="mx-2 my-2 border-t border-sidebar-border"
        />
      )}

      {ACCOUNT_NAV.map((item) => (
        <NavLinkRow
          key={item.to}
          item={item}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}

      {isAdmin ? (
        <NavLinkRow
          item={{ to: "/admin", label: "Admin Console", icon: Shield }}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ) : null}
    </nav>
  );
}

/** Brand logo — only used inside mobile drawer sheet. */
export function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/dashboard"
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Globe className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <span className="text-base font-bold tracking-tight text-foreground">
        GlobeTrotter
      </span>
    </Link>
  );
}

/** Desktop sidebar rail. */
export function DesktopSidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <aside
        data-collapsed={collapsed}
        className={cn(
          "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3 transition-[width] duration-200 ease-in-out lg:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        {/* Collapse / Expand toggle */}
        <div className={cn("mb-2", collapsed ? "flex justify-center" : "flex justify-end px-1")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        <div className="h-px bg-sidebar-border" />

        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          <SidebarNav collapsed={collapsed} />
        </div>

        <div className={cn("pt-3", collapsed && "self-center")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" aria-label="Create new trip" asChild>
                  <Link to="/trips/create">
                    <PlusCircle className="size-5" aria-hidden="true" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Create New Trip</TooltipContent>
            </Tooltip>
          ) : (
            <Button asChild className="w-full">
              <Link to="/trips/create">
                <PlusCircle />
                Create New Trip
              </Link>
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
