import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Globe, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { SidebarNav } from "@/components/layout/Sidebar";
import { NotificationMenu } from "@/features/dashboard/components/NotificationMenu";
import { GlobalSearch } from "@/features/dashboard/components/GlobalSearch";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import type { Crumb } from "@/components/layout/AppShell";

interface NavbarProps {
  crumbs: Crumb[];
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}

export function Navbar({ crumbs, drawerOpen, onDrawerOpenChange }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name ?? user?.email ?? "U")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const closeDrawer = () => onDrawerOpenChange(false);

  return (
    <header className="sticky top-0 z-40 border-b border-subtle-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-2 px-4 pt-[env(safe-area-inset-top)] sm:px-6">
        {/* Mobile nav */}
        <Sheet open={drawerOpen} onOpenChange={onDrawerOpenChange}>
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
            <div className="border-b border-subtle-border px-4 py-3.5">
              <SidebarBrand onNavigate={closeDrawer} />
            </div>
            <nav
              aria-label="Primary"
              className="flex h-[calc(100%-4rem)] flex-col p-3"
            >
              <SidebarNav onNavigate={closeDrawer} />
              <Button asChild className="mt-3 w-full">
                <Link to="/trips/create" onClick={closeDrawer}>
                  Create New Trip
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Mobile search */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Search destinations, trips and activities"
            >
              <Search className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg p-6">
            <div className="mt-4">
              <GlobalSearch />
            </div>
          </DialogContent>
        </Dialog>

        {/* Brand */}
        <Link
          to="/dashboard"
          aria-label="GlobeTrotter dashboard"
          className="flex items-center gap-2 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Globe className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            GlobeTrotter
          </span>
        </Link>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="min-w-0 shrink-0">
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

        {/* Global search — center on md+ */}
        <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
          <GlobalSearch />
        </div>

        <div className={cn("ml-auto flex items-center gap-1", "md:ml-0")}>
          <NotificationMenu />
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
                <kbd className="ml-auto text-[10px] text-muted-foreground">⌘K P</kbd>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Preferences
                <kbd className="ml-auto text-[10px] text-muted-foreground">⌘K ,</kbd>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
                <kbd className="ml-auto text-[10px] text-muted-foreground">⌘⇧Q</kbd>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
