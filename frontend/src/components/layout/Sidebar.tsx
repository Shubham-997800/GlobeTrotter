import { Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  Compass,
  Globe,
  LayoutDashboard,
  PlusCircle,
  Shield,
  UserRound,
  UsersRound,
  Map,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";

export interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemDef[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "My Trips", icon: Map },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/community", label: "Community", icon: UsersRound },
  { to: "/calendar", label: "Travel Calendar", icon: CalendarDays },
  { to: "/profile", label: "Profile", icon: UserRound },
];

interface SidebarNavProps {
  /** Closes the mobile drawer after a navigation click. */
  onNavigate?: () => void;
  className?: string;
}

/** Shared nav list used by both the desktop rail and the drawer. */
export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <nav
      aria-label="Primary"
      className={cn("flex flex-1 flex-col gap-1", className)}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-hover hover:text-foreground",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
      {isAdmin ? (
        <Link
          to="/admin"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            location.pathname.startsWith("/admin")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-hover hover:text-foreground",
          )}
        >
          <Shield className="h-[18px] w-[18px]" />
          Admin Console
        </Link>
      ) : null}
    </nav>
  );
}

export function SidebarCreateTripButton({
  onNavigate,
  className,
}: SidebarNavProps) {
  return (
    <Button asChild className={cn("w-full", className)}>
      <Link to="/trips/create" onClick={onNavigate}>
        <PlusCircle />
        Create New Trip
      </Link>
    </Button>
  );
}

export function SidebarBrand() {
  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-2 rounded-md px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Globe className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold tracking-tight">
        GlobeTrotter
      </span>
    </Link>
  );
}
