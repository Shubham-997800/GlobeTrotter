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
      end={item.to === "/dashboard"}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "group/item relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
          "transition-colors duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-sidebar-active text-sidebar-active-text"
            : "text-sidebar-text hover:bg-sidebar-hover hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator — left accent bar */}
          {isActive ? (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-active-icon"
            />
          ) : null}
          <item.icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
              isActive ? "text-sidebar-active-icon" : "text-sidebar-text group-hover/item:text-foreground",
            )}
          />
          {!collapsed ? <span className="truncate">{item.label}</span> : null}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
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
    <nav aria-label="Primary" className="flex min-h-0 flex-1 flex-col gap-0.5">
      {MAIN_NAV.map((item) => (
        <NavLinkRow
          key={item.to}
          item={item}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}

      {/* Divider + Account section */}
      {!collapsed ? (
        <div className="mt-auto pt-3">
          <div aria-hidden="true" className="mx-3 mb-2 border-t border-sidebar-border" />
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-text/60">
            Account
          </p>
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
        </div>
      ) : (
        <>
          <div aria-hidden="true" className="mx-2 my-2 border-t border-sidebar-border" />
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
        </>
      )}
    </nav>
  );
}

/** Brand logo — only used inside mobile drawer sheet. */
export function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/dashboard"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
    <TooltipProvider delayDuration={200}>
      <aside
        data-collapsed={collapsed}
        className={cn(
          "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out lg:flex",
          collapsed ? "w-[68px] px-2 py-3" : "w-64 px-3 py-3",
        )}
      >
        {/* Collapse / Expand toggle */}
        <div className={cn("mb-1", collapsed ? "flex justify-center" : "flex justify-end")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Nav content */}
        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarNav collapsed={collapsed} />
        </div>

        {/* Create trip CTA */}
        <div className={cn("pt-2", collapsed && "self-center")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  aria-label="Create new trip"
                  asChild
                  className="h-9 w-9"
                >
                  <Link to="/trips/create">
                    <PlusCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Create New Trip</TooltipContent>
            </Tooltip>
          ) : (
            <Button asChild className="w-full gap-2" size="sm">
              <Link to="/trips/create">
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Create New Trip
              </Link>
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
