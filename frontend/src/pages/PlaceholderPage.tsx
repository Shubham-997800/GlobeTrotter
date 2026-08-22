import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import { Logo } from "@/components/landing/Logo";
import { landingConfig } from "@/config/landing.config";

interface PlaceholderPageProps {
  path: "login" | "get-started";
}

export function PlaceholderPage({ path }: PlaceholderPageProps) {
  const { appName } = landingConfig;
  const heading =
    path === "login"
      ? "Authentication coming soon"
      : "Getting started coming soon";

  const description =
    path === "login"
      ? "Sign-in flows are intentionally left as a placeholder so you can wire them up however you like."
      : "Account creation and onboarding are intentionally left as a placeholder for you to build on.";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <Container className="flex h-16 items-center">
          <Link to="/" aria-label={`${appName} home`}>
            <Logo name={appName} />
          </Link>
        </Container>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light text-primary dark:bg-primary/15">
            <span aria-hidden="true" className="text-2xl">
              ✦
            </span>
          </div>
          <h1 className="text-balance mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
            {heading}
          </h1>
          <p className="text-pretty mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
          <Button className="mt-8" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}