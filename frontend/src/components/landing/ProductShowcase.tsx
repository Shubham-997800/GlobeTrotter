import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/landing/Container";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Reveal } from "@/components/landing/Reveal";
import type { ShowcaseContent } from "@/lib/types";

const MAX_TILT_PX = 8;

/**
 * Desktop-only pointer parallax: the preview drifts a few px toward the
 * cursor. Spring-damped and disabled for reduced-motion users.
 */
function ParallaxPreview() {
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 18 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 18 });
  const translateX = useTransform(springX, [-1, 1], [-MAX_TILT_PX, MAX_TILT_PX]);
  const translateY = useTransform(springY, [-1, 1], [-MAX_TILT_PX, MAX_TILT_PX]);

  if (reduceMotion) {
    return (
      <div className="transition-transform duration-300 hover:-translate-y-1">
        <DashboardPreview />
      </div>
    );
  }

  return (
    <div
      ref={frameRef}
      onPointerMove={(event) => {
        // Fine pointers only — touch scrolling shouldn't trigger drift.
        if (event.pointerType !== "mouse") return;
        const bounds = frameRef.current?.getBoundingClientRect();
        if (!bounds) return;
        pointerX.set(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        );
        pointerY.set(
          ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
        );
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <motion.div style={{ x: translateX, y: translateY }}>
        <DashboardPreview />
      </motion.div>
    </div>
  );
}

export function ProductShowcase({ showcase }: { showcase: ShowcaseContent }) {
  return (
    <section id="showcase" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <div>
            <Reveal>
              <Badge variant="soft">{showcase.badge}</Badge>
              <h2 className="font-display text-balance mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {showcase.title}
              </h2>
              <p className="text-pretty mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {showcase.description}
              </p>
            </Reveal>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {showcase.benefits.map((benefit, index) => (
                <Reveal key={benefit} delay={index * 0.06}>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {benefit}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: product preview */}
          <Reveal className="lg:justify-self-end" delay={0.15}>
            <div className="group relative w-full max-w-2xl">
              <div
                aria-hidden="true"
                className="absolute -inset-x-6 -top-8 -bottom-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/[0.08] via-travel-blue/[0.06] to-transparent blur-2xl"
              />
              <ParallaxPreview />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}