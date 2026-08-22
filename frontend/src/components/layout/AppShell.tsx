import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, LogOut, Menu, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import {
  SidebarBrand,
  SidebarCreateTripButton,
  SidebarNav,
} from "@/components/layout/Sidebar";
import { NotificationMenu } from "@/features/dashboard/components/NotificationMenu";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** Omit for the current (non-link) crumb. */
  to?: string;
}

interface AppShellProps {
  crumbs: Crumb[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared signed-in layout: sticky top bar (menu, breadcrumbs, actions),
 * desktop sidebar rail, mobile drawer and the user menu. Feature pages
 * only pass content — they never rebuild chrome.
 */
export function AppShell({
  crumbs,
  title,
  description,
  actions,
  children,
}: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);
  const initials = (user?.name ?? user?.email ?? "U")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-background">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-subtle-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
          {/* Mobile nav */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-subtle-border px-4 py-3.5 text-left">
                <SheetTitle asChild>
                  <div>
                    <SidebarBrand />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="flex h-[calc(100%-4rem)] flex-col gap-3 p-3">
                <SidebarNav onNavigate={closeDrawer} />
                <SidebarCreateTripButton onNavigate={closeDrawer} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1 text-sm">
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    />
                  ) : null}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="truncate rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="truncate font-medium text-foreground">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <NotificationMenu items={[]} />
            <ThemeToggle />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn("gap-2 pl-1.5 pr-2 sm:pl-2")}
                  aria-label="Open account menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {initials}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                    {user?.name ?? "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block truncate text-sm font-semibold">
                    {user?.name ?? "Traveler"}
                  </span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/profile")}>
                  <UserRound className="mr-2 h-4 w-4" />
                  Profile settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => {
                    logout();
                    navigate("/", { replace: true });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Desktop sidebar ───────────────────────────────────── */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 flex-col gap-4 border-r border-subtle-border bg-card p-4 lg:flex">
          <SidebarBrand />
          <Separator />
          <SidebarNav />
          <div className="mt-auto">
            <SidebarCreateTripButton />
          </div>
        </aside>

        {/* ── Page content ──────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
