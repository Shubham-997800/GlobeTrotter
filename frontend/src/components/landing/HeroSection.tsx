import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import type { HeroContent, TrustStat } from "@/lib/types";

const HERO_IMG =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1600";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

interface HeroSectionProps {
  hero: HeroContent;
  trustStats: TrustStat[];
}

export function HeroSection({ hero, trustStats }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24"
      aria-label="Introduction"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20px 30px, var(--color-border) 50%, transparent 0)",
          backgroundSize: "40px 40px",
          opacity: 0.35,
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-travel-blue/[0.10] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-24 -z-10 h-80 w-80 rounded-full bg-primary/[0.10] blur-3xl"
      />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* ── Copy ─────────────────────────────────────────── */}
          <motion.div
            variants={container}
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "visible"}
            className="max-w-xl"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-secondary-text shadow-xs">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                {hero.badge}
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="font-display text-balance mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]"
            >
              {hero.title}
            </motion.h1>

            <motion.p
              variants={item}
              className="text-pretty mt-5 text-lg leading-relaxed text-muted-foreground"
            >
              {hero.description}
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button size="lg" asChild>
                <Link to={hero.primaryCTA.href}>
                  {hero.primaryCTA.label}
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to={hero.secondaryCTA.href}>
                  <Compass
                    className="mr-1 h-4 w-4 text-travel-blue"
                    aria-hidden="true"
                  />
                  {hero.secondaryCTA.label}
                </Link>
              </Button>
            </motion.div>

            {/* Trust / social proof */}
            <motion.div
              variants={item}
              className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              {trustStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <stat.icon
                    className="h-5 w-5 text-travel-blue"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-lg font-bold leading-none text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Visual / product composition ─────────────────── */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }
            }
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            <div className="relative">
              {/* Main destination visual */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-xl shadow-black/5">
                <img
                  src={HERO_IMG}
                  alt="Misty mountain valley bathed in golden sunlight"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20"
                />

                {/* Location badge */}
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                  animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={
                    reduceMotion ? undefined : { delay: 0.45, duration: 0.4 }
                  }
                  className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md"
                >
                  <MapPin
                    className="h-3.5 w-3.5 text-travel-blue"
                    aria-hidden="true"
                  />
                  Kyoto, Japan
                </motion.div>

                {/* Mini itinerary UI (bottom) */}
                <div className="absolute inset-x-3 bottom-3">
                  <div className="rounded-2xl border border-white/15 bg-white/85 p-3.5 shadow-lg backdrop-blur-md dark:bg-[#101914]/85">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin
                          className="h-4 w-4 shrink-0 text-travel-blue"
                          aria-hidden="true"
                        />
                        <p className="truncate text-sm font-semibold text-foreground">
                          Kyoto → Osaka → Tokyo
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Planning
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span aria-hidden="true">📅</span>
                      Apr 12 – Apr 20 · 4 cities · 12 activities
                    </p>
                  </div>
                </div>
              </div>
          {/* Floating budget card */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: 1, y: [0, -6, 0] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: { delay: 0.55, duration: 0.5 },
                        y: { delay: 1.2, duration: 3, repeat: Infinity, ease: "easeInOut" },
                      }
                }
                className="absolute -bottom-6 -right-2 hidden w-52 rounded-2xl border border-border bg-card p-4 shadow-lg shadow-black/10 sm:block"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Trip Budget
                  </p>
                  <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                    63%
                  </span>
                </div>
                <p className="mt-1.5 text-lg font-bold text-foreground">
                  ₹45,000
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    total
                  </span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-warning to-primary"
                    style={{ width: "63%" }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  ₹28,500 spent · on track
                </p>
              </motion.div>

              {/* Floating trip card */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: 1, y: [0, -5, 0] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: { delay: 0.65, duration: 0.5 },
                        y: { delay: 1.5, duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                      }
                }
                className="absolute -left-5 -top-7 hidden w-44 rounded-2xl border border-border bg-card p-3.5 shadow-lg shadow-black/10 sm:block"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-travel-blue/15 text-travel-blue">
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Group Trip
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      4 travelers
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex -space-x-2">
                  {["MC", "AM", "SR"].map((initials) => (
                    <span
                      key={initials}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-semibold text-secondary-text"
                    >
                      {initials}
                    </span>
                  ))}
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-[9px] font-semibold text-primary-foreground">
                    +1
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}