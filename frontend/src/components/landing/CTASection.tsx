import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import { Reveal } from "@/components/landing/Reveal";
import type { FinalCTA } from "@/lib/types";

interface CTASectionProps {
  cta: FinalCTA;
}

function AnimatedRoute() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 200 60"
      className="pointer-events-none absolute inset-x-0 top-8 mx-auto h-16 w-64 text-primary/20 sm:w-80"
      fill="none"
    >
      <motion.path
        d="M10 46 C 60 10, 130 55, 190 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 6"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
      <motion.circle
        cx="10"
        cy="46"
        r="4"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
      />
      <motion.circle
        cx="190"
        cy="18"
        r="4"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: 1.4, duration: 0.4, type: "spring" }}
      />
    </svg>
  );
}

export function CTASection({ cta }: CTASectionProps) {
  return (
    <section id="cta" className="py-20 sm:py-28" aria-label="Get started">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm sm:px-16 sm:py-20">
            {/* Decorative background: subtle map grid + travel route */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(1px 1px at 20px 30px, var(--color-border) 50%, transparent 0)",
                backgroundSize: "36px 36px",
                opacity: 0.4,
                maskImage:
                  "radial-gradient(ellipse 60% 55% at 50% 40%, black 30%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 60% 55% at 50% 40%, black 30%, transparent 75%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 -z-0 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.10] blur-3xl"
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute right-10 bottom-10 -z-0 h-48 w-48 rounded-full bg-travel-blue/[0.08] blur-3xl"
              animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Dashed route line with pins */}
            <AnimatedRoute />

            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
              <span className="inline-flex items-center rounded-full bg-primary-light px-3.5 py-1.5 text-sm font-medium text-primary dark:bg-primary/15">
                {cta.badge}
              </span>

              <h2 className="text-balance mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {cta.title}
              </h2>

              <p className="text-pretty mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {cta.description}
              </p>

              <p className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" asChild>
                  <Link to={cta.primaryCTA.href}>
                    {cta.primaryCTA.label}
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </p>

              <p className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-travel-blue" aria-hidden="true" />
                {cta.footnote ?? "Free to get started"}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}