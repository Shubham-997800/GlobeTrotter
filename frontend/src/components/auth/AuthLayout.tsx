import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { landingConfig } from "@/config/landing.config";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  {
    title: "One calm itinerary",
    description: "Flights, stays, and activities in a single view.",
  },
  {
    title: "Plan in minutes",
    description:
      "Smart templates turn trip ideas into ready-to-go journeys.",
  },
  {
    title: "Private & secure",
    description: "Your data stays yours — encrypted at rest and in transit.",
  },
];

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Widen the form column for content-heavy pages like registration. */
  wide?: boolean;
}

export function AuthLayout({ children, wide = false }: AuthLayoutProps) {
  const appName = landingConfig.appName;
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-main lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        {/* Subtle brand gradients — theme tokens only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-travel-blue/5 blur-3xl"
        />
        <Logo name={appName} />

        <div className="relative max-w-md space-y-8">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
            Every journey, planned to perfection.
          </h2>
          <ul className="space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col items-center justify-center px-5 py-10 sm:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl lg:hidden"
        />

        <div className="absolute inset-x-5 top-5 flex items-center justify-between sm:inset-x-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div
          className={cn(
            "w-full max-w-[26rem]",
            wide && "max-w-[30rem]",
            "lg:max-w-[26.5rem]",
            wide && "lg:max-w-[31rem]",
          )}
        >
          <div className="mt-10 mb-8 flex justify-center lg:mt-0">
            <Link to="/" aria-label={`${appName} home`}>
              <Logo name={appName} />
            </Link>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
