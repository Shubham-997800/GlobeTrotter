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
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:py-16">
          {/* Left: brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label={`${appName} home`}
              className="inline-flex"
            >
              <Logo name={appName} tagline={tagline} />
            </Link>
            <p className="text-pretty mt-4 text-sm leading-relaxed text-muted-foreground">
              {footer.description}
            </p>
          </div>

          {/* Middle: quick links */}
          <nav aria-labelledby="footer-quick-links">
            <h3
              id="footer-quick-links"
              className="text-sm font-semibold text-foreground"
            >
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footer.quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: contact / socials */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Connect
            </h3>
            <ul className="mt-4 flex items-center gap-2">
              {footer.socials.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    aria-label={social.name}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-strong-border hover:bg-hover hover:text-primary"
                  >
                    <social.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              support@globetrotter.io
            </p>
            <p className="text-sm text-muted-foreground">hello@globetrotter.io</p>
          </div>
        </div>

        <Separator />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="order-2 text-sm text-muted-foreground sm:order-1">
            © {year} {appName}. All rights reserved.
          </p>
          <div className="order-1 flex items-center gap-5 sm:order-2">
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}