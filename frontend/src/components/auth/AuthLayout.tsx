import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
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
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const appName = landingConfig.appName;
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-main lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
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
        <div className="absolute top-5 right-5">
          <ThemeToggle />
        </div>

        <div className={cn("w-full max-w-[26rem]", "lg:max-w-[26.5rem]")}>
          <div className="mb-8 flex justify-center lg:hidden">
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
