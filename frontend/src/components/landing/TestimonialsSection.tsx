import { Star } from "lucide-react";

import { Container } from "@/components/landing/Container";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const heading = {
  badge: "What Travelers Say",
  title: (
    <>
      Loved by <span className="text-primary">10,000+</span> travelers
    </>
  ),
  description:
    "Real stories from real people who planned their dream trips with GlobeTrotter.",
};

function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        className,
      )}
    >
      {/* Stars */}
      <div className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-warning text-warning"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="mt-4 flex-1">
        <p className="text-sm leading-relaxed text-foreground">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>

      {/* Author */}
      <div className="mt-5 flex items-center gap-3">
        <img
          src={testimonial.avatar}
          alt=""
          aria-hidden="true"
          className="h-10 w-10 rounded-full object-cover"
          loading="lazy"
        />
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </article>
  );
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-20 sm:py-28" aria-label="Testimonials">
      <Container>
        <Reveal>
          <SectionHeading heading={heading} />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <TestimonialCard testimonial={t} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
