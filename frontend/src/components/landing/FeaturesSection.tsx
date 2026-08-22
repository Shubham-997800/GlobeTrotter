import { Container } from "@/components/landing/Container";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import type { Feature, SectionHeading as SectionHeadingType } from "@/lib/types";

interface FeaturesSectionProps {
  heading: SectionHeadingType;
  features: Feature[];
}

export function FeaturesSection({ heading, features }: FeaturesSectionProps) {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading heading={heading} />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.06}>
              <FeatureCard feature={feature} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}