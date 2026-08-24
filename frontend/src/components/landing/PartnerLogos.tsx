import { Reveal } from "@/components/landing/Reveal";

const PARTNERS = [
  {
    name: "Travel + Leisure",
    svg: (
      <svg viewBox="0 0 140 20" className="h-5 w-auto fill-current" aria-hidden="true">
        <text x="0" y="15" className="text-[13px] font-bold" fill="currentColor">Travel + Leisure</text>
      </svg>
    ),
  },
  {
    name: "Condé Nast",
    svg: (
      <svg viewBox="0 0 100 20" className="h-5 w-auto fill-current" aria-hidden="true">
        <text x="0" y="15" className="text-[13px] font-semibold" fill="currentColor">Condé Nast</text>
      </svg>
    ),
  },
  {
    name: "Lonely Planet",
    svg: (
      <svg viewBox="0 0 120 20" className="h-5 w-auto fill-current" aria-hidden="true">
        <text x="0" y="15" className="text-[13px] font-bold" fill="currentColor">Lonely Planet</text>
      </svg>
    ),
  },
  {
    name: "TripAdvisor",
    svg: (
      <svg viewBox="0 0 110 20" className="h-5 w-auto fill-current" aria-hidden="true">
        <text x="0" y="15" className="text-[13px] font-bold" fill="currentColor">TripAdvisor</text>
      </svg>
    ),
  },
  {
    name: "Booking.com",
    svg: (
      <svg viewBox="0 0 120 20" className="h-5 w-auto fill-current" aria-hidden="true">
        <text x="0" y="15" className="text-[13px] font-bold" fill="currentColor">Booking.com</text>
      </svg>
    ),
  },
];

export function PartnerLogos() {
  return (
    <section className="border-y border-border bg-muted/30 py-10" aria-label="Trusted by leading travel brands">
      <Reveal>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by travelers worldwide
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PARTNERS.map((partner) => (
              <span
                key={partner.name}
                className="text-muted-foreground/50 transition-colors hover:text-muted-foreground/80"
                aria-label={partner.name}
              >
                {partner.svg}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
