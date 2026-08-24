import { Link, useNavigate } from "react-router-dom";
import { Globe, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";

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
import { SidebarBrand, SidebarNav } from "@/components/layout/Sidebar";
import { NotificationMenu } from "@/features/dashboard/components/NotificationMenu";
import { GlobalSearch } from "@/features/dashboard/components/GlobalSearch";
import { useAuth } from "@/features/auth/useAuth";

interface NavbarProps {
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}

export function Navbar({ drawerOpen, onDrawerOpenChange }: NavbarProps) {
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
    <header className="z-40 shrink-0 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      {/*
        3-zone flex layout:
        Zone 1 — shrink-0: hamburger + brand (never shrinks)
        Zone 2 — min-w-0 flex-1: search bar (takes all remaining space)
        Zone 3 — shrink-0: actions (never shrinks)

        shift-proof: every zone is isolated. Dropdown portals render outside
        this tree, so flex never recalculates.
      */}
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4 pt-[env(safe-area-inset-top)] sm:gap-3 sm:px-6">

        {/* ── Zone 1: Hamburger + Brand ─────────────────── */}
        <Sheet open={drawerOpen} onOpenChange={onDrawerOpenChange}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 lg:hidden"
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
              className="flex h-[calc(100%-4.5rem)] flex-col overflow-y-auto p-3"
            >
              <SidebarNav onNavigate={closeDrawer} />
            </nav>
            <div className="border-t border-subtle-border p-3">
              <Button asChild className="w-full gap-2" size="sm">
                <Link to="/trips/create" onClick={closeDrawer}>
                  Create New Trip
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Link
          to="/dashboard"
          aria-label="GlobeTrotter dashboard"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-travel-blue text-primary-foreground shadow-sm">
            <Globe className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-heading text-base font-semibold tracking-tight text-foreground">
            GlobeTrotter
          </span>
        </Link>

        {/* ── Zone 2: Search — takes remaining space ────── */}
        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <GlobalSearch />
        </div>

        {/* ── Zone 3: Actions — never shrinks ───────────── */}
        <div className="flex shrink-0 items-center gap-0.5">
          {/* Mobile search trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                aria-label="Search destinations, trips and activities"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-6">
              <div className="mt-4">
                <GlobalSearch />
              </div>
            </DialogContent>
          </Dialog>

          <NotificationMenu />
          <ThemeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 px-2"
                aria-label="Open account menu"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {initials}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-medium lg:inline">
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
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
