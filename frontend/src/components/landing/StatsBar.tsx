import { Luggage, MapPin, Sparkles, Users } from "lucide-react";

import { Container } from "@/components/landing/Container";
import { Reveal } from "@/components/landing/Reveal";
import { useCountUp } from "@/hooks/useCountUp";

const STATS = [
  { icon: Luggage, value: 200, suffix: "+", label: "Trips Planned" },
  { icon: MapPin, value: 50, suffix: "+", label: "Destinations" },
  { icon: Sparkles, value: 500, suffix: "+", label: "Activities" },
  { icon: Users, value: 500, suffix: "+", label: "Happy Travelers" },
];

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

function StatItem({ stat }: { stat: (typeof STATS)[number] }) {
  const { value, ref } = useCountUp(stat.value);
  const Icon = stat.icon;
  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1 px-4 py-7 text-center"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {formatNumber(value)}
        {stat.suffix}
      </p>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </div>
  );
}

export function StatsBar() {
  return (
    <section
      aria-label="GlobeTrotter by the numbers"
      className="relative pb-16 sm:pb-20"
    >
      <Container>
        <Reveal>
          <div className="grid grid-cols-2 divide-border overflow-clip rounded-2xl border border-border bg-card shadow-sm md:grid-cols-4 md:divide-x">
            {STATS.map((stat) => (
              <StatItem key={stat.label} stat={stat} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
