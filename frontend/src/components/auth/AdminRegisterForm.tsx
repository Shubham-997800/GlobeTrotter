import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthError } from "@/components/auth/AuthError";
import { FieldError } from "@/components/auth/FormField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/features/auth/auth.types";
import { useAuth } from "@/features/auth/useAuth";
import { z } from "zod";

const adminRegisterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Must be at least 2 characters.")
      .max(40, "Must be 40 characters or fewer.")
      .regex(/^[\p{L}][\p{L}\s'.-]*$/u, "Letters, spaces, apostrophes and hyphens only."),
    lastName: z
      .string()
      .trim()
      .min(2, "Must be at least 2 characters.")
      .max(40, "Must be 40 characters or fewer.")
      .regex(/^[\p{L}][\p{L}\s'.-]*$/u, "Letters, spaces, apostrophes and hyphens only."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Use 72 characters or fewer.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    adminCode: z
      .string()
      .trim()
      .min(1, "Admin secret code is required."),
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })
  .refine((data) => data.acceptTerms, {
    path: ["acceptTerms"],
    message: "You must accept the Terms of Service to continue.",
  });

type AdminRegisterValues = z.infer<typeof adminRegisterSchema>;

const REDIRECT_DELAY_MS = 900;

export function AdminRegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "confirm_email">("idle");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdminRegisterValues>({
    resolver: zodResolver(adminRegisterSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      adminCode: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");
  const isBusy = status !== "idle";

  const onSubmit = async (values: AdminRegisterValues) => {
    setSubmitError(null);
    setStatus("submitting");
    try {
      const user = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        adminCode: values.adminCode,
      });
      setStatus("success");
      toast.success(`Admin account created. Welcome, ${user.name.split(" ")[0]}!`);
      window.setTimeout(
        () => navigate("/admin", { replace: true }),
        REDIRECT_DELAY_MS,
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "EMAIL_CONFIRMATION_REQUIRED"
      ) {
        setStatus("confirm_email");
        return;
      }
      setStatus("idle");
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please check your connection and try again.",
      );
    }
  };

  if (status === "confirm_email") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Check Your Email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to your email address. Please verify your
          email before signing in.
        </p>
        <Link
          to="/login"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <fieldset disabled={isBusy} className="space-y-5 min-w-0">
        {/* Admin badge */}
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-primary font-medium">
            Admin Registration — You will have full access to the admin console after sign-up.
          </p>
        </div>

        {/* Admin secret code (prominent) */}
        <div className="space-y-2">
          <Label htmlFor="adminCode">Admin Secret Code</Label>
          <div className="relative">
            <Shield
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary"
              aria-hidden="true"
            />
            <Input
              id="adminCode"
              type="password"
              placeholder="Enter admin secret code"
              autoComplete="off"
              className="pl-9"
              aria-invalid={errors.adminCode ? true : undefined}
              aria-describedby={errors.adminCode ? "adminCode-error" : undefined}
              {...register("adminCode")}
            />
          </div>
          <FieldError id="adminCode-error" message={errors.adminCode?.message} />
        </div>

        {/* Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Ada"
              aria-invalid={errors.firstName ? true : undefined}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              {...register("firstName")}
            />
            <FieldError id="firstName-error" message={errors.firstName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Lovelace"
              aria-invalid={errors.lastName ? true : undefined}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              {...register("lastName")}
            />
            <FieldError id="lastName-error" message={errors.lastName?.message} />
          </div>
        </div>

        {/* Email */}
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
              placeholder="admin@company.com"
              className="pl-9"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
          </div>
          <FieldError id="email-error" message={errors.email?.message} />
        </div>

        {/* Password */}
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

        {/* Confirm password */}
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

        {/* Terms */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Checkbox
              id="acceptTerms"
              className="mt-0.5"
              checked={watch("acceptTerms")}
              onCheckedChange={(checked) =>
                setValue("acceptTerms", checked === true, {
                  shouldValidate: true,
                })
              }
              aria-invalid={errors.acceptTerms ? true : undefined}
              aria-describedby={
                errors.acceptTerms ? "acceptTerms-error" : undefined
              }
            />
            <Label
              htmlFor="acceptTerms"
              className="cursor-pointer font-normal leading-relaxed text-secondary-text"
            >
              I agree to the Terms of Service and Privacy Policy.
            </Label>
          </div>
          <FieldError
            id="acceptTerms-error"
            message={errors.acceptTerms?.message}
          />
        </div>
      </fieldset>

      <AuthError message={submitError} />

      <SubmitButton
        status={status}
        label="Create Admin Account"
        labels={{ submitting: "Creating admin account…", success: "Admin account created!" }}
      />

      <p className="text-center text-xs text-muted-foreground">
        Admin accounts have full access to the management console, analytics,
        and user administration.
      </p>
    </form>
  );
}
