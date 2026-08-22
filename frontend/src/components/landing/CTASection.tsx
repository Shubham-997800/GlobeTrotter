import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import { Reveal } from "@/components/landing/Reveal";
import type { FinalCTA } from "@/lib/types";

interface CTASectionProps {
  cta: FinalCTA;
}

export function CTASection({ cta }: CTASectionProps) {
  return (
    <section id="cta" className="py-20 sm:py-28" aria-label="Get started">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm sm:px-16 sm:py-20">
            {/* Subtle top green accent line */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 -z-0 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.10] blur-3xl"
            />

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

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to={cta.primaryCTA.href}>
                    {cta.primaryCTA.label}
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                {cta.secondaryCTA ? (
                  <Button size="lg" variant="secondary" asChild>
                    <Link to={cta.secondaryCTA.href}>
                      {cta.secondaryCTA.label}
                    </Link>
                  </Button>
                ) : null}
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Free 14-day trial · No credit card required · Cancel anytime
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}