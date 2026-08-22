import { Link } from "react-router-dom";

import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/useAuth";
import { landingConfig } from "@/config/landing.config";

export function AppDashboardPage() {
  const { user, logout } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-main">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/app" aria-label={`${landingConfig.appName} home`}>
            <Logo name={landingConfig.appName} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-20 sm:px-8">
        <Card className="w-full max-w-xl shadow-sm shadow-black/5 dark:shadow-black/20">
          <CardHeader>
            <CardTitle className="text-xl">You&apos;re in, {firstName}!</CardTitle>
            <CardDescription>
              This is the protected application area of GlobeTrotter. Build
              your trip modules here — the auth foundation is already wired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                Session restored on refresh via{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  authService.getSession()
                </code>
              </li>
              <li>
                Swap the mock layer in{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  features/auth/auth.service.ts
                </code>{" "}
                with real API calls
              </li>
              <li>
                Wrap any route with{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  ProtectedRoute
                </code>{" "}
                to guard it
              </li>
            </ul>
            <Button asChild variant="secondary" size="sm">
              <Link to="/">Back to landing page</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
