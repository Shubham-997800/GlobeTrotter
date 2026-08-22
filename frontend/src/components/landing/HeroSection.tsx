import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import type { HeroContent } from "@/lib/types";

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

export function HeroSection({ hero }: { hero: HeroContent }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28"
      aria-label="Introduction"
    >
      {/* Subtle decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-8 -z-10 h-[24rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl"
      />

      <Container>
        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
          variants={container}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-secondary-text shadow-xs">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              {hero.badge}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-balance mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            variants={item}
            className="text-pretty mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            {hero.description}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" asChild>
              <Link to={hero.primaryCTA.href}>
                {hero.primaryCTA.label}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to={hero.secondaryCTA.href}>{hero.secondaryCTA.label}</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-x-8 -top-6 -bottom-6 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/[0.08] to-transparent blur-2xl"
          />
          <DashboardPreview className="w-full" />
        </motion.div>
      </Container>
    </section>
  );
}