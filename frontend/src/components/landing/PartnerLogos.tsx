import { Reveal } from "@/components/landing/Reveal";

const PARTNERS = [
  "Travel + Leisure",
  "Condé Nast",
  "Lonely Planet",
  "TripAdvisor",
  "Booking.com",
];

export function PartnerLogos() {
  return (
    <section className="border-y border-border bg-muted/30 py-10" aria-label="Trusted by leading travel brands">
      <Reveal>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by travelers featured in
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PARTNERS.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-muted-foreground/60 transition-colors hover:text-foreground/40"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
