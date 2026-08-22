import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/FormField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/features/auth/auth.types";
import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/schemas/login.schema";
import { useAuth } from "@/features/auth/useAuth";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intendedPath =
    (location.state as { from?: string } | null)?.from ?? "/app";

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { identifier: "", password: "", remember: true },
  });

  const remember = watch("remember");

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null);
    try {
      const user = await login({
        identifier: values.identifier,
        password: values.password,
        remember: values.remember,
      });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(intendedPath, { replace: true });
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
            to="/login"
            onClick={(event) => event.preventDefault()}
            aria-disabled="true"
            title="Password reset coming soon"
            className="rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
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
          onCheckedChange={(checked) => setValue("remember", checked === true)}
        />
        <Label
          htmlFor="remember"
          className="cursor-pointer font-normal text-muted-foreground"
        >
          Remember me
        </Label>
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
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
        Demo account —{" "}
        <span className="font-medium text-secondary-text">
          demo@globetrotter.app
        </span>{" "}
        ·{" "}
        <span className="font-medium text-secondary-text">Demo@1234</span>
      </p>
    </form>
  );
}
