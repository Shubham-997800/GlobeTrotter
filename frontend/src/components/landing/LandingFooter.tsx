import { Link } from "react-router-dom";

import { Container } from "@/components/landing/Container";
import { Logo } from "@/components/landing/Logo";
import { Separator } from "@/components/ui/separator";
import type { FooterContent } from "@/lib/types";

interface LandingFooterProps {
  appName: string;
  tagline?: string;
  footer: FooterContent;
}

export function LandingFooter({
  appName,
  tagline,
  footer,
}: LandingFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="max-w-sm">
            <Link to="/" aria-label={`${appName} home`} className="inline-flex">
              <Logo name={appName} tagline={tagline} />
            </Link>
            <p className="text-pretty mt-4 text-sm leading-relaxed text-muted-foreground">
              {footer.description}
            </p>

            <div className="mt-5 flex items-center gap-2">
              {footer.socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-strong-border hover:bg-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    <span className="sr-only">{social.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {footer.columns.map((col) => (
            <nav key={col.id} aria-labelledby={`footer-col-${col.id}`}>
              <h3
                id={`footer-col-${col.id}`}
                className="text-sm font-semibold text-foreground"
              >
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-center text-sm text-muted-foreground">
          <p>
            © {year} {appName}. All rights reserved.
          </p>
          <span className="flex items-center gap-1">
            <span aria-hidden="true">🌍</span>
            <span>{footer.madeWithTagline ?? "Made for Travelers"}</span>
          </span>
        </div>
      </Container>
    </footer>
  );
}