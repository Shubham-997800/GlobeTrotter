import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/landing/Container";
import { Logo } from "@/components/landing/Logo";
import { LegalDialog } from "@/components/legal/LegalDialog";
import { Separator } from "@/components/ui/separator";
import type { FooterContent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LandingFooterProps {
  appName: string;
  tagline?: string;
  footer: FooterContent;
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

export function LandingFooter({
  appName,
  tagline,
  footer,
}: LandingFooterProps) {
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleFooterLinkClick = (href: string) => {
    if (href === "__privacy__" || href === "__terms__") return;
    if (href.startsWith("/")) {
      navigate(href);
    } else if (href.startsWith("#")) {
      const sectionId = href.slice(1);
      if (location.pathname === "/") {
        scrollToSection(sectionId);
      } else {
        navigate(`/${href}`);
      }
    } else {
      navigate(href);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-card">
      <Container>
        {/* Newsletter banner */}
        <div className="flex flex-col items-center gap-4 border-b border-border py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Stay in the loop
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Get travel tips, new features and destination guides — no spam.
            </p>
          </div>
          {subscribed ? (
            <p className="text-sm font-medium text-success">
              Thanks for subscribing!
            </p>
          ) : (
            <form
              onSubmit={(e) => handleNewsletterSubmit(e)}
              className="flex w-full max-w-sm gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm">
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                Subscribe
              </Button>
            </form>
          )}
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="max-w-sm">
            <Link to="/" aria-label={`${appName} home`} className="inline-flex">
              <Logo name={appName} tagline={tagline} />
            </Link>
            <p className="text-pretty mt-4 text-sm leading-relaxed text-muted-foreground">
              {footer.description}
            </p>
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
                    {link.href === "__privacy__" ? (
                      <LegalDialog
                        type="privacy"
                        trigger={
                          <button className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary text-left w-full">
                            {link.label}
                          </button>
                        }
                      />
                    ) : link.href === "__terms__" ? (
                      <LegalDialog
                        type="terms"
                        trigger={
                          <button className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary text-left w-full">
                            {link.label}
                          </button>
                        }
                      />
                    ) : (
                      <button
                        onClick={() => handleFooterLinkClick(link.href)}
                        className={cn(
                          "text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary",
                          "text-left w-full",
                        )}
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
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
