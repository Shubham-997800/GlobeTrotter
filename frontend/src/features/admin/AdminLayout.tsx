import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Map,
  MapPin,
  Ticket,
  BarChart3,
  Shield,
  Activity,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/useAuth";

const ADMIN_NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/trips", label: "Trips", icon: Map },
      { to: "/admin/destinations", label: "Destinations", icon: MapPin },
      { to: "/admin/activities", label: "Activities", icon: Ticket },
    ],
  },
  {
    label: "Analytics",
    items: [
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/activity", label: "Activity Feed", icon: Activity },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/admin/roles", label: "Roles & Permissions", icon: Shield },
    ],
  },
];

function AdminNavLink({
  item,
  collapsed,
  onClick,
}: {
  item: { to: string; label: string; icon: React.ElementType; end?: boolean };
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
          )}
          <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

function AdminNavSection({
  section,
  onClick,
}: {
  section: (typeof ADMIN_NAV_SECTIONS)[number];
  onClick?: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 first:pt-1">
        {section.label}
      </p>
      {section.items.map((item) => (
        <AdminNavLink key={item.to} item={item} onClick={onClick} />
      ))}
    </div>
  );
}

function AdminBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const label = seg.charAt(0).toUpperCase() + seg.slice(1);
    return { label, path };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have administrator privileges.</p>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">Admin Console</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <AdminNavSection key={section.label} section={section} />
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-3 z-50 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold">Admin Console</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-3" aria-label="Admin navigation">
            {ADMIN_NAV_SECTIONS.map((section) => (
              <AdminNavSection key={section.label} section={section} onClick={() => setMobileOpen(false)} />
            ))}
          </nav>
          <div className="border-t border-border p-3">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <div className="lg:hidden w-8" />
          <AdminBreadcrumb />
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
