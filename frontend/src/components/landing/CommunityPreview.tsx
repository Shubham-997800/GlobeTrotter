import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { TravelStoryCard } from "@/components/landing/TravelStoryCard";
import { Reveal } from "@/components/landing/Reveal";
import type { CommunityContent } from "@/lib/types";

export function CommunityPreview({
  community,
}: {
  community: CommunityContent;
}) {
  return (
    <section
      id="community"
      className="scroll-mt-24 border-y border-border bg-muted/30 py-20 sm:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading heading={community.heading} />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {community.stories.map((story, index) => (
            <Reveal key={story.id} delay={index * 0.08}>
              <TravelStoryCard story={story} className="h-full" />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center" delay={0.1}>
          <Button size="lg" asChild>
            <Link to="/register">
              <Users className="mr-1 h-4 w-4" aria-hidden="true" />
              {community.ctaLabel}
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}