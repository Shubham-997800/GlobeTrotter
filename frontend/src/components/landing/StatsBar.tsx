import { Luggage, MapPin, Sparkles, Users } from "lucide-react";

import { Container } from "@/components/landing/Container";
import { Reveal } from "@/components/landing/Reveal";

const STATS = [
  { icon: Luggage, value: "2.5K+", label: "Trips Planned" },
  { icon: MapPin, value: "120+", label: "Destinations" },
  { icon: Sparkles, value: "15K+", label: "Activities" },
  { icon: Users, value: "10K+", label: "Happy Travelers" },
];

export function StatsBar() {
  return (
    <section
      aria-label="GlobeTrotter by the numbers"
      className="relative pb-16 sm:pb-20"
    >
      <Container>
        <Reveal>
          <div className="grid grid-cols-2 divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-4 md:divide-x">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1 px-4 py-7 text-center"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}