import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { landingConfig } from "@/config/landing.config";

interface AppSectionPlaceholderProps {
  title: string;
  description: string;
}

/**
 * Temporary stand-in for upcoming app modules (/trips, /explore, …).
 * Route protection is already enforced by the surrounding ProtectedRoute.
 */
export function AppSectionPlaceholder({
  title,
  description,
}: AppSectionPlaceholderProps) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-main">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/app" aria-label={`${landingConfig.appName} dashboard`}>
            <Logo name={landingConfig.appName} />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-20 sm:px-8">
        <Card className="w-full text-center shadow-sm shadow-black/5 dark:shadow-black/20">
          <CardContent className="space-y-3 p-8">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link to="/app">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
