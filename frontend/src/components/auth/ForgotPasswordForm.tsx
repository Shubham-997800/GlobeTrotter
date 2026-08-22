import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { AuthError } from "@/components/auth/AuthError";
import { FieldError } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/features/auth/auth.types";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/schemas/forgot-password.schema";
import { useAuth } from "@/features/auth/useAuth";

const RESEND_COOLDOWN_SECONDS = 30;

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  /** Mock-mode only: the reset token is surfaced instead of being emailed. */
  const [mockToken, setMockToken] = React.useState<string | null>(null);
  const [status, setStatus] =
    React.useState<"idle" | "submitting" | "success">("idle");
  const [cooldown, setCooldown] = React.useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((seconds) => Math.max(seconds - 1, 0)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendResetLink = async () => {
    const parsed = forgotPasswordSchema.safeParse({ email: getValues("email") });
    if (!parsed.success) {
      setStatus("idle");
      return;
    }
    setSubmitError(null);
    setStatus("submitting");
    try {
      const { token } = await requestPasswordReset(parsed.data);
      setSentTo(parsed.data.email.trim());
      setMockToken(token);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please check your connection and try again.",
      );
    }
  };

  if (sentTo) {
    return (
      <div className="space-y-5" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary dark:bg-primary/15">
            <CircleCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">
            Check your inbox
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{sentTo}</span>, a
            password reset link is on its way. The link expires in 15 minutes.
          </p>
        </div>

        {/* Mock-mode only: no email provider exists yet, surface the token link. */}
        {mockToken ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
            Demo mode —{" "}
            <Link
              to={`/reset-password?token=${mockToken}`}
              className="rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              open your reset link
            </Link>
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setCooldown(0);
              void sendResetLink();
            }}
            disabled={cooldown > 0 || status === "submitting"}
          >
            {cooldown > 0
              ? `Resend link available in ${cooldown}s`
              : "Resend link"}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(sendResetLink)}
      noValidate
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="pl-9"
            autoFocus
            disabled={status === "submitting"}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
            {...register("email")}
          />
        </div>
        <FieldError id="forgot-email-error" message={errors.email?.message} />
      </div>

      <AuthError message={submitError} />

      <SubmitButton
        status={status}
        label="Send Reset Link"
        labels={{ submitting: "Sending…" }}
      />

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          to="/login"
          className="rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
