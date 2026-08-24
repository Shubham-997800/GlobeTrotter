import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { Container } from "@/components/landing/Container";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { StepCard } from "@/components/landing/StepCard";
import type {
  SectionHeading as SectionHeadingType,
  Step,
} from "@/lib/types";

interface HowItWorksSectionProps {
  heading: SectionHeadingType;
  steps: Step[];
}

export function HowItWorksSection({
  heading,
  steps,
}: HowItWorksSectionProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-border bg-muted/30 py-20 sm:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading heading={heading} />
        </Reveal>

        <div className="relative mt-14">
          {/* Animated connector line on desktop */}
          <div
            ref={lineRef}
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-border lg:block"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
              initial={{ scaleX: 0 }}
              animate={lineInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          <ol className="grid gap-10 lg:grid-cols-3 lg:gap-16">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.12}>
                <StepCard step={step} className="h-full" />
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="mt-14 flex justify-center" delay={0.2}>
          <p className="text-pretty max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
            Every trip you start here builds on the last — your routes,
            budgets and favorites follow you from plan to passport stamp.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}