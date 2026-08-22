import * as React from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Waves,
  Mountain,
  Building2,
  Compass,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { DestinationCard } from "@/components/landing/DestinationCard";
import { Reveal } from "@/components/landing/Reveal";
import type { DiscoverContent } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, typeof Star> = {
  all: Star,
  beaches: Waves,
  mountains: Mountain,
  cities: Building2,
  adventure: Compass,
};

export function ExploreDestinations({ discover }: { discover: DiscoverContent }) {
  const [active, setActive] = React.useState("all");

  const categories = discover.categories;
  const destinations =
    active === "all"
      ? discover.destinations
      : discover.destinations.filter((d) => d.category === active);

  return (
    <section id="explore" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading heading={discover.heading} align="left" />
          <Reveal className="shrink-0">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/get-started">
                {discover.ctaLabel}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
        </div>

        {/* Category tabs */}
        <Reveal className="mt-10">
          <div
            role="tablist"
            aria-label="Destination categories"
            className="flex max-w-full gap-2 overflow-x-auto pb-1"
          >
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? Star;
              const isActive = active === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActive(cat.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-secondary-text hover:bg-hover hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest, index) => (
            <Reveal key={dest.id} delay={index * 0.06}>
              <DestinationCard destination={dest} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}