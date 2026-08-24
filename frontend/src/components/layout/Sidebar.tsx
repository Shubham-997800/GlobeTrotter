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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/useAuth";
import { landingConfig } from "@/config/landing.config";
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
  /** Collapsed rail shows icons with tooltips instead of labels. */
  collapsed?: boolean;
  /** Closes the mobile drawer after a navigation click. */
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

/** Full nav list (primary + account + admin) shared by rail and drawer. */
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

export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      to="/dashboard"
      aria-label={`${landingConfig.appName} dashboard`}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        collapsed && "justify-center",
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Globe className="h-5 w-5" aria-hidden="true" />
      </span>
      {!collapsed ? (
        <span className="truncate text-base font-semibold tracking-tight">
          {landingConfig.appName}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Desktop rail. Handles its own expand/collapse affordance; the collapsed
 * state lives in AppShell so it survives navigation.
 */
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
        <div
          className={cn(
            "mb-2 flex items-center",
            collapsed ? "justify-center" : "justify-between px-1",
          )}
        >
          <SidebarBrand collapsed={collapsed} />
          {!collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              aria-expanded={!collapsed}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <PanelLeftClose className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        <Separator />

        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            aria-expanded={!collapsed}
            className="mt-2 self-center text-muted-foreground hover:text-foreground"
          >
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          </Button>
        ) : null}

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
