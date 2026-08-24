import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthError } from "@/components/auth/AuthError";
import { FieldError } from "@/components/auth/FormField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/features/auth/auth.types";
import { readIntendedPath } from "@/features/auth/intended-path";
import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/schemas/login.schema";
import { useAuth } from "@/features/auth/useAuth";

const REDIRECT_DELAY_MS = 700;

const DEMO_CREDENTIALS = {
  identifier: "demo@globetrotter.app",
  password: "Demo@1234",
} as const;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intendedPath = readIntendedPath(location.state);

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [status, setStatus] =
    React.useState<"idle" | "submitting" | "success">("idle");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { identifier: "", password: "", remember: true },
  });

  const remember = watch("remember");

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null);
    setStatus("submitting");
    try {
      const user = await login({
        identifier: values.identifier,
        password: values.password,
        remember: values.remember,
      });
      setStatus("success");
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      window.setTimeout(
        () => navigate(intendedPath, { replace: true }),
        REDIRECT_DELAY_MS,
      );
    } catch (error) {
      setStatus("idle");
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please check your connection and try again.",
      );
    }
  };

  /** One-click entry for judges/demo reviewers — skips typing entirely. */
  const onDemoLogin = async () => {
    setSubmitError(null);
    setStatus("submitting");
    try {
      const user = await login({ ...DEMO_CREDENTIALS, remember: true });
      setStatus("success");
      toast.success(`Signed in as ${user.name}`, {
        description: "You're exploring the GlobeTrotter demo workspace.",
      });
      window.setTimeout(
        () => navigate(intendedPath, { replace: true }),
        REDIRECT_DELAY_MS,
      );
    } catch (error) {
      setStatus("idle");
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Demo sign-in failed. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Social login */}
      <SocialLoginButtons disabled={status !== "idle"} />

      <div className="flex items-center gap-3" aria-hidden="true">
        <Separator className="flex-1" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          or sign in with email
        </span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="identifier">Email or username</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="you@company.com"
            className="pl-9"
            disabled={status !== "idle"}
            aria-invalid={errors.identifier ? true : undefined}
            aria-describedby={
              errors.identifier ? "identifier-error" : undefined
            }
            {...register("identifier")}
          />
        </div>
        <FieldError
          id="identifier-error"
          message={errors.identifier?.message}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            to="/forgot-password"
            className="rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={status !== "idle"}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={remember}
          disabled={status !== "idle"}
          onCheckedChange={(checked) => setValue("remember", checked === true)}
        />
        <Label
          htmlFor="remember"
          className="cursor-pointer font-normal text-muted-foreground"
        >
          Remember me
        </Label>
      </div>

      <AuthError message={submitError} />

      <SubmitButton
        status={status}
        label="Sign In"
        labels={{ submitting: "Signing in…", success: "Signed in!" }}
      />

      <div className="flex items-center gap-3" aria-hidden="true">
        <Separator className="flex-1" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
        disabled={status !== "idle"}
        onClick={() => void onDemoLogin()}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Explore with Demo Account
      </Button>

      <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
        Demo —{" "}
        <span className="font-medium text-secondary-text">
          {DEMO_CREDENTIALS.identifier}
        </span>{" "}
        ·{" "}
        <span className="font-medium text-secondary-text">{DEMO_CREDENTIALS.password}</span>
      </p>
    </form>
  );
}
