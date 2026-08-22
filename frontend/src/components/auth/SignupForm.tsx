import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/FormField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/features/auth/auth.types";
import {
  signupSchema,
  type SignupValues,
} from "@/features/auth/schemas/signup.schema";
import { useAuth } from "@/features/auth/useAuth";

const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"] as const;

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || /[A-Z]/.test(password)) score += 1;
  return Math.min(score, 4) - (score === 0 ? 1 : 0);
}

export function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = watch("password");
  const strength = passwordStrength(password);
  const strengthLabel =
    password.length > 0 && strength > 0
      ? STRENGTH_LABELS[strength - 1]
      : null;

  const onSubmit = async (values: SignupValues) => {
    setSubmitError(null);
    try {
      const user = await signup({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success(`Account created. Welcome aboard, ${user.name.split(" ")[0]}!`);
      navigate("/app", { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            className="pl-9"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
        </div>
        <FieldError id="name-error" message={errors.name?.message} />
      </div>

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
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </div>
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">Password</Label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            errors.password
              ? "new-password-error"
              : password.length > 0
                ? "password-strength"
                : undefined
          }
          {...register("password")}
        />
        {password.length > 0 && !errors.password ? (
          <div id="password-strength" className="flex items-center gap-2">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {[0, 1, 2].map((segment) => (
                <span
                  key={segment}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    strength > segment
                      ? strength >= 3
                        ? "bg-primary"
                        : strength === 2
                          ? "bg-warning"
                          : "bg-destructive"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {strengthLabel}
            </span>
          </div>
        ) : null}
        <FieldError
          id="new-password-error"
          message={errors.password?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
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

      {submitError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
        >
          {submitError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
