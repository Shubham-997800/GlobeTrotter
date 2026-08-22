import { Link } from "react-router-dom";
import { ArrowRight, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";

function greetingForHour(hour: number): string {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeSection() {
  const { user } = useAuth();
  const firstName = user?.name.split(/\s+/)[0] ?? "there";

  return (
    <section aria-labelledby="dashboard-welcome-heading" className="relative">
      {/* Subtle decorative gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-0 hidden h-40 w-72 rounded-full bg-primary/10 blur-3xl lg:block"
      />
      <p className="text-sm font-medium text-secondary-text" role="doc-subtitle">
        {greetingForHour(new Date().getHours())}, {firstName} 👋
      </p>
      <h1
        id="dashboard-welcome-heading"
        className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
      >
        Where do you want to go next?
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
        Your trips, discoveries and travel plans — all in one place.
      </p>
      <Button asChild size="sm" className="mt-5">
        <Link to="/trips/create">
          <PlusCircle className="size-4" aria-hidden="true" />
          Plan a New Trip
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}
