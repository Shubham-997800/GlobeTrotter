import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/landing/Container";
import { BenefitItem } from "@/components/landing/BenefitItem";
import { Reveal } from "@/components/landing/Reveal";
import type { BenefitSectionContent } from "@/lib/types";

interface BenefitsSectionProps {
  benefits: BenefitSectionContent;
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  return (
    <section id="benefits" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: heading + benefit points */}
          <div>
            <Reveal>
              <Badge variant="soft">{benefits.badge}</Badge>
              <h2 className="text-balance mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {benefits.title}
              </h2>
              <p className="text-pretty mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {benefits.description}
              </p>
            </Reveal>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {benefits.items.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.06}>
                  <BenefitItem benefit={item} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: stats / achievement panel */}
          <Reveal delay={0.15} className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/[0.08] blur-3xl"
              />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="text-sm font-semibold text-foreground">
                  Real outcomes teams report
                </p>
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8">
                {benefits.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="order-last text-sm text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd className="text-3xl font-bold tracking-tight text-foreground">
                      <span className="text-primary">{stat.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 border-t border-border pt-6">
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  Measured across travelers who planned their trips on a single
                  platform instead of scattered apps and spreadsheets.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}