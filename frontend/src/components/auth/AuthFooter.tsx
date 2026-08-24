import { Link } from "react-router-dom";

import { LegalDialog } from "@/components/legal/LegalDialog";
import { landingConfig } from "@/config/landing.config";

type AuthFooterVariant = "login" | "signup";

/** Keyed by the page this footer is rendered on; shows the opposite action. */
const SWITCH_COPY: Record<
  AuthFooterVariant,
  { text: string; cta: string; to: string }
> = {
  login: {
    text: "Don't have an account?",
    cta: "Create Account",
    to: "/register",
  },
  signup: {
    text: "Already have an account?",
    cta: "Sign In",
    to: "/login",
  },
};

interface AuthFooterProps {
  /** Current auth page ("login" | "signup"). */
  variant: AuthFooterVariant;
}

export function AuthFooter({ variant }: AuthFooterProps) {
  const switchCopy = SWITCH_COPY[variant];

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        {switchCopy.text}{" "}
        <Link
          to={switchCopy.to}
          className="rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          {switchCopy.cta}
        </Link>
      </p>
      <p className="text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <LegalDialog
          type="terms"
          trigger={
            <button className="rounded-sm font-medium text-secondary-text underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none">
              Terms of Service
            </button>
          }
        />{" "}
        and{" "}
        <LegalDialog
          type="privacy"
          trigger={
            <button className="rounded-sm font-medium text-secondary-text underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none">
              Privacy Policy
            </button>
          }
        />
        . © {new Date().getFullYear()} {landingConfig.appName}.
      </p>
    </div>
  );
}
