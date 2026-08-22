import { AlertCircle } from "lucide-react";

interface AuthErrorProps {
  message?: string | null;
  id?: string;
}

/**
 * Form-level error banner for authentication failures (invalid
 * credentials, server errors, …). Field-level issues use FieldError.
 */
export function AuthError({ message, id }: AuthErrorProps) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <p className="text-xs font-medium leading-relaxed text-destructive">
        {message}
      </p>
    </div>
  );
}
