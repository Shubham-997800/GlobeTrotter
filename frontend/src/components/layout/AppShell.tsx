import { useEffect, useState } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { DesktopSidebar } from "@/components/layout/Sidebar";
import { OfflineBanner } from "@/components/OfflineBanner";

interface AppShellProps {
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

export function AppShell({
  title,
  description,
  actions,
  children,
}: AppShellProps) {
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
      // Best-effort persistence
    }
  }, [sidebarCollapsed]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Skip navigation — keyboard users land here */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar — NEVER scrolls */}
      <DesktopSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Right column: navbar + scrollable content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          drawerOpen={drawerOpen}
          onDrawerOpenChange={setDrawerOpen}
        />
        <OfflineBanner />

        {/* ONLY this area scrolls */}
        <main
          id="main-content"
          className="min-w-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
                {actions ? (
                  <div className="flex items-center gap-2">{actions}</div>
                ) : null}
              </div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
