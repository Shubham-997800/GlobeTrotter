/* oxlint-disable react(incompatible-library) -- react-hook-form's API intentionally returns fresh function identities per render. */
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";

import { AuthError } from "@/components/auth/AuthError";
import { FieldError } from "@/components/auth/FormField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/features/auth/auth.types";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schemas/reset-password.schema";
import { useAuth } from "@/features/auth/useAuth";

/**
 * Second half of the password recovery flow. The reset token arrives via
 * the `?token=` query parameter and is only ever sent back to the API —
 * it is never logged or rendered beyond that.
 */
export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [status, setStatus] =
    React.useState<"idle" | "submitting" | "success">("idle");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");

  if (!token) {
    return <InvalidTokenNotice />;
  }

  const onSubmit = async (values: ResetPasswordValues) => {
    setSubmitError(null);
    setStatus("submitting");
    try {
      await resetPassword({ token, password: values.password });
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

  if (status === "success") {
    return (
      <div className="space-y-5" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary dark:bg-primary/15">
            <CircleCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">
            Password updated
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your password has been changed. Sign in with your new password to
            continue your journey.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          autoFocus
          disabled={status === "submitting"}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            errors.password
              ? "new-password-error"
              : password.length > 0
                ? "password-strength"
                : "password-hint"
          }
          {...register("password")}
        />
        {password.length > 0 && !errors.password ? (
          <PasswordStrength password={password} id="password-strength" />
        ) : null}
        {!errors.password && password.length === 0 ? (
          <p id="password-hint" className="text-xs text-muted-foreground">
            Use 8+ characters with at least one letter and one number.
          </p>
        ) : null}
        <FieldError
          id="new-password-error"
          message={errors.password?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          disabled={status === "submitting"}
          aria-invalid={errors.confirmPassword ? true : undefined}
          aria-describedby={
            errors.confirmPassword ? "confirm-password-error" : undefined
          }
          {...register("confirmPassword")}
        />
        <FieldError
          id="confirm-password-error"
          message={errors.confirmPassword?.message}
        />
      </div>

      <AuthError message={submitError} />

      <SubmitButton
        status={status}
        label="Reset Password"
        labels={{ submitting: "Updating…", success: "Updated!" }}
      />

      <p className="text-center text-sm text-muted-foreground">
        Link expired?{" "}
        <Link
          to="/forgot-password"
          className="rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          Request a new one
        </Link>
      </p>
    </form>
  );
}

function InvalidTokenNotice() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-bg text-warning">
          <KeyRound className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">
          This reset link isn&apos;t valid
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The link is missing, invalid, or it has expired. Request a fresh one
          and it will arrive within moments.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link to="/forgot-password">Request a new link</Link>
      </Button>
    </div>
  );
}
