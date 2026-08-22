import type { Feature } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  feature: Feature;
  className?: string;
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-strong-border hover:shadow-md",
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
        {feature.title}
      </h3>
      <p className="text-pretty mt-2 text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </article>
  );
}