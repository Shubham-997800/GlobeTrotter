import type { ComponentType } from "react";
import { Star, Utensils, Ticket, BedDouble, MapPin } from "lucide-react";

import type { Feature } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  feature: Feature;
  className?: string;
}

const ACCENT_TEXT: Record<string, string> = {
  primary: "text-primary",
  city: "text-travel-blue",
  activity: "text-activity",
  budget: "text-budget",
  stay: "text-stay",
  food: "text-food",
};

function PlanningVisual() {
  const cities = [
    { id: "kyoto", label: "Kyoto" },
    { id: "osaka", label: "Osaka" },
    { id: "tokyo", label: "Tokyo" },
  ];
  return (
    <div className="flex h-full items-center gap-2 p-3">
      {cities.map((city, i) => (
        <div key={city.id} className="flex flex-1 items-center gap-1.5">
          <div className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold",
                i === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-travel-blue/15 text-travel-blue",
              )}
            >
              {i + 1}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground">
              {city.label}
            </span>
          </div>
          {i < 2 ? (
            <span
              aria-hidden="true"
              className="h-px flex-1 border-t-2 border-dashed border-travel-blue/40"
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ItineraryVisual() {
  const days = [
    { d: "Day 1", label: "Arrive · Kyoto" },
    { d: "Day 2", label: "Fushimi Inari" },
    { d: "Day 3", label: "Osaka · Dotonbori" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-3">
      {days.map((row) => (
        <div key={row.d} className="flex items-center gap-2.5">
          <span className="w-13 shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-center text-[9px] font-semibold text-primary">
            {row.d}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium text-secondary-text">
            {row.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function DiscoverVisual() {
  const pins = [{ label: "Kyoto" }, { label: "Bali" }, { label: "Paris" }];
  return (
    <div className="relative h-full overflow-hidden p-3">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 15px 18px, var(--color-strong-border) 50%, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative flex h-full flex-col justify-center gap-1.5">
        {pins.map((pin, i) => (
          <div key={pin.label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                i === 0 ? "bg-travel-blue text-travel-blue-foreground" : "bg-muted text-secondary-text",
              )}
            >
              <MapPin className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="text-[10px] font-medium text-secondary-text">
              {pin.label}
            </span>
            {i === 0 ? (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[9px] font-semibold text-warning">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                4.9
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
function ActivityVisual() {
  const items = [
    { icon: Ticket, label: "City tour", tone: "bg-travel-blue/10 text-travel-blue" },
    { icon: Utensils, label: "Ramen night", tone: "bg-food/10 text-food" },
    { icon: BedDouble, label: "Ryokan stay", tone: "bg-stay/10 text-stay" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 p-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md",
              it.tone,
            )}
          >
            <it.icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-[10px] font-medium text-secondary-text">
            {it.label}
          </span>
          <span className="ml-auto text-[9px] text-muted-foreground">+Add</span>
        </div>
      ))}
    </div>
  );
}

function BudgetVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Estimated</p>
          <p className="text-sm font-bold text-foreground">₹45,000</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Spent</p>
          <p className="text-sm font-bold text-foreground">₹28,500</p>
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">63% of budget used</span>
          <span className="font-semibold text-warning">On track</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-warning to-primary"
            style={{ width: "63%" }}
          />
        </div>
      </div>
    </div>
  );
}

function CalendarVisual() {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <div className="flex h-full flex-col justify-center p-3">
      <div className="mb-1 grid grid-cols-7">
        {labels.map((l) => (
          <span
            key={l}
            className="text-center text-[9px] font-semibold text-muted-foreground"
          >
            {l}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((d) => {
          const busy = d === 5 || d === 12;
          const today = d === 14;
          return (
            <span
              key={d}
              className={cn(
                "flex h-5 w-full items-center justify-center rounded text-[10px]",
                today
                  ? "bg-primary text-primary-foreground"
                  : busy
                    ? "bg-travel-blue text-travel-blue-foreground"
                    : "text-secondary-text",
              )}
            >
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const VISUALS: Record<string, ComponentType> = {
  planning: PlanningVisual,
  itinerary: ItineraryVisual,
  discover: DiscoverVisual,
  activity: ActivityVisual,
  budget: BudgetVisual,
  calendar: CalendarVisual,
};

export function FeatureCard({ feature, className }: FeatureCardProps) {
  const Icon = feature.icon;
  const Visual = VISUALS[feature.visual ?? "planning"];
  const accent = feature.accent ?? "primary";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-strong-border hover:shadow-md",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-accent text-primary transition-all duration-300 group-hover:border-transparent group-hover:bg-primary group-hover:text-primary-foreground",
          ACCENT_TEXT[accent] ?? "text-primary",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
        {feature.title}
      </h3>
      <p className="text-pretty mt-2 text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>

      <div className="mt-5 h-28 rounded-xl border border-border bg-muted/40 transition-colors duration-300 group-hover:bg-accent/50">
        <Visual />
      </div>
    </article>
  );
}