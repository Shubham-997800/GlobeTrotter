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
          {/* Connector line on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-border lg:block"
          />

          <ol className="grid gap-10 lg:grid-cols-3 lg:gap-16">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.1}>
                <StepCard step={step} className="h-full" />
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="mt-14 flex justify-center" delay={0.2}>
          <p className="text-pretty max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
            Every step works out of the box. Adjust it to match exactly how
            your team already operates.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}