import { cn } from "@/lib/utils";

const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"] as const;

const SEGMENT_COLORS = [
  "bg-destructive",
  "bg-warning",
  "bg-primary",
  "bg-primary",
] as const;

/** Scores a password 0–4 using the project's auth rules. */
export function scorePassword(password: string): number {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 12) score += 1;
  return Math.min(score, 4);
}

interface PasswordStrengthProps {
  password: string;
  id?: string;
}

/**
 * Live strength meter shown while typing a new password. Color-only
 * feedback is avoided — each level also has a text label.
 */
export function PasswordStrength({ password, id }: PasswordStrengthProps) {
  const strength = scorePassword(password);
  if (password.length === 0) return null;

  return (
    <div id={id} className="flex items-center gap-2">
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1 flex-1 rounded-full bg-muted transition-colors duration-300",
              strength > segment && SEGMENT_COLORS[strength - 1],
            )}
          />
        ))}
      </div>
      <span className="min-w-10 text-right text-xs text-muted-foreground">
        {STRENGTH_LABELS[strength - 1] ?? "Weak"}
      </span>
    </div>
  );
}
