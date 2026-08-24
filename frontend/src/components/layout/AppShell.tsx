import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import {
  DesktopSidebar,
} from "@/components/layout/Sidebar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useAuth } from "@/features/auth/useAuth";

export interface Crumb {
  label: string;
  /** Omit for the current (non-link) crumb. */
  to?: string;
}

interface AppShellProps {
  crumbs: Crumb[];
  /** Omit when the page renders its own heading (e.g. dashboard welcome). */
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = "globetrotter.ui.sidebar-collapsed";

function readCollapsedPreference(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Shared signed-in layout: sticky top bar (menu, breadcrumbs, global search,
 * actions), collapsible desktop sidebar rail, mobile drawer and the user
 * menu. Feature pages only pass content — they never rebuild chrome.
 */
export function AppShell({
  crumbs,
  title,
  description,
  actions,
  children,
}: AppShellProps) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    readCollapsedPreference,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        sidebarCollapsed ? "1" : "0",
      );
    } catch {
      // Preference is best-effort; the shell still works without storage.
    }
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-dvh bg-background">
      {/* Skip navigation — keyboard users land here */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Navbar
        crumbs={crumbs}
        drawerOpen={drawerOpen}
        onDrawerOpenChange={setDrawerOpen}
      />

      <OfflineBanner />

      <div className="flex">
        {/* ── Desktop sidebar ───────────────────────────────────── */}
        <DesktopSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* ── Page content ──────────────────────────────────────── */}
        <main id="main-content" className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
            {title || actions ? (
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  {title ? (
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {title}
                    </h1>
                  ) : null}
                  {description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </p>
                  ) : null}
                </div>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
              </div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
