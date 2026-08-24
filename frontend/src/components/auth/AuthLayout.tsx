import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Quote, Star } from "lucide-react";
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

const BRAND_TESTIMONIAL = {
  quote:
    "A travel planner that keeps your itinerary, budget and group in sync — all in one place.",
  name: "Built for Travelers",
  trips: "GlobeTrotter Team",
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
};

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
      {/* Mobile brand banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-background to-travel-blue/[0.06] px-6 py-8 lg:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/[0.08] blur-3xl"
        />
        <div className="relative text-center">
          <Logo name={appName} className="justify-center" />
          <p className="mt-3 font-heading text-lg font-bold text-foreground">
            Every journey, planned to perfection.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Itinerary Builder
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Budget Tracker
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Group Sync
            </span>
          </div>
        </div>
      </div>

      {/* Brand panel — desktop only */}
      <aside
        className="relative hidden min-h-dvh overflow-hidden border-r border-border bg-cover bg-center bg-no-repeat lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1531932594968-e5e5e9dee95a?w=800&q=80&auto=format&fit=crop)",
          backgroundColor: "#101914",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />
        {/* Gradient accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />

        <Logo name={appName} className="relative z-10" textClassName="text-white" />

        <div className="relative z-10 max-w-md space-y-8">
          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-balance text-3xl font-bold tracking-tight text-white xl:text-4xl"
          >
            Every journey, planned to perfection.
          </motion.h2>
          <motion.ul
            className="space-y-5"
            variants={reduceMotion ? undefined : container}
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "visible"}
          >
            {HIGHLIGHTS.map((h) => (
              <motion.li
                key={h.title}
                variants={item}
                className="flex gap-3"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {h.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/70">
                    {h.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          {/* Testimonial snippet */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-warning text-warning"
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Quote className="h-4 w-4 shrink-0 text-primary/60" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-white/80">
                {BRAND_TESTIMONIAL.quote}
              </p>
            </div>
            <p className="mt-3 text-xs text-white/60">
              — {BRAND_TESTIMONIAL.name}, {BRAND_TESTIMONIAL.trips}
            </p>
          </motion.div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
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
