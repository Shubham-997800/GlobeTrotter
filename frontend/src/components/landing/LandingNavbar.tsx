"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, LogIn, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavLink } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  appName: string;
  navLinks: NavLink[];
  className?: string;
}

export function LandingNavbar({
  appName,
  navLinks,
  className,
}: LandingNavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
        className,
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            aria-label={`${appName} home`}
            className="shrink-0"
          >
            <Logo name={appName} />
          </Link>

          {/* Center nav (desktop) */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 md:flex"
          >
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-secondary-text transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link to="/login">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Login
              </Link>
            </Button>

            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/get-started">Get Started</Link>
            </Button>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <SheetHeader className="border-b border-border px-6 py-4 text-left">
                  <SheetTitle>
                    <Logo name={appName} />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 p-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      className="rounded-lg px-3 py-3 text-base font-medium text-secondary-text transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="mt-auto space-y-2 border-t border-border p-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/get-started">
                      Get Started
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <div className="pt-2 flex justify-center">
                    <ThemeToggle className="sm:hidden" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
}