import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthError } from "@/components/auth/AuthError";
import { FieldError } from "@/components/auth/FormField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { ProfileImageUpload } from "@/components/auth/ProfileImageUpload";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LegalDialog } from "@/components/legal/LegalDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/features/auth/auth.types";
import {
  registerSchema,
  type RegisterValues,
} from "@/features/auth/schemas/register.schema";
import { useAuth } from "@/features/auth/useAuth";

const REDIRECT_DELAY_MS = 900;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [status, setStatus] =
    React.useState<"idle" | "submitting" | "success">("idle");

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      bio: "",
      avatarUrl: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");
  const isBusy = status !== "idle";

  const onSubmit = async (values: RegisterValues) => {
    setSubmitError(null);
    setStatus("submitting");
    try {
      const user = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        city: values.city || undefined,
        country: values.country || undefined,
        bio: values.bio || undefined,
        avatarUrl: values.avatarUrl || undefined,
        password: values.password,
      });
      setStatus("success");
      toast.success(`Account created. Welcome aboard, ${user.name.split(" ")[0]}!`);
      window.setTimeout(
        () => navigate("/dashboard", { replace: true }),
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Controller
        control={control}
        name="avatarUrl"
        render={({ field }) => (
          <ProfileImageUpload value={field.value} onChange={field.onChange} />
        )}
      />

      <fieldset disabled={isBusy} className="space-y-5 min-w-0">
        {/* Personal information */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Ada"
              aria-invalid={errors.firstName ? true : undefined}
              aria-describedby={
                errors.firstName ? "firstName-error" : undefined
              }
              {...register("firstName")}
            />
            <FieldError
              id="firstName-error"
              message={errors.firstName?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Lovelace"
              aria-invalid={errors.lastName ? true : undefined}
              aria-describedby={
                errors.lastName ? "lastName-error" : undefined
              }
              {...register("lastName")}
            />
            <FieldError
              id="lastName-error"
              message={errors.lastName?.message}
            />
          </div>
        </div>

        {/* Contact information */}
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
          <Label htmlFor="phone">
            Phone number{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              className="pl-9"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              {...register("phone")}
            />
          </div>
          <FieldError id="phone-error" message={errors.phone?.message} />
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">
              City{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-travel-blue"
                aria-hidden="true"
              />
              <Input
                id="city"
                type="text"
                autoComplete="address-level2"
                placeholder="Jaipur"
                className="pl-9"
                list="auth-city-suggestions"
                aria-invalid={errors.city ? true : undefined}
                aria-describedby={errors.city ? "city-error" : undefined}
                {...register("city")}
              />
              <datalist id="auth-city-suggestions">
                <option value="Jaipur" />
                <option value="Delhi" />
                <option value="Mumbai" />
                <option value="Bengaluru" />
                <option value="Paris" />
                <option value="Tokyo" />
              </datalist>
            </div>
            <FieldError id="city-error" message={errors.city?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">
              Country{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <Globe
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-travel-blue"
                aria-hidden="true"
              />
              <Input
                id="country"
                type="text"
                autoComplete="country-name"
                placeholder="India"
                className="pl-9"
                list="auth-country-suggestions"
                aria-invalid={errors.country ? true : undefined}
                aria-describedby={errors.country ? "country-error" : undefined}
                {...register("country")}
              />
              <datalist id="auth-country-suggestions">
                <option value="India" />
                <option value="United States" />
                <option value="United Kingdom" />
                <option value="Japan" />
                <option value="France" />
              </datalist>
            </div>
            <FieldError id="country-error" message={errors.country?.message} />
          </div>
        </div>

        {/* Additional information */}
        <div className="space-y-2">
          <Label htmlFor="bio">
            Bio{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="bio"
            rows={3}
            placeholder="A line or two about you and how you love to travel…"
            aria-invalid={errors.bio ? true : undefined}
            aria-describedby={errors.bio ? "bio-error" : "bio-hint"}
            {...register("bio")}
          />
          {errors.bio ? (
            <FieldError id="bio-error" message={errors.bio?.message} />
          ) : (
            <p id="bio-hint" className="text-xs text-muted-foreground">
              Max 280 characters.
            </p>
          )}
        </div>

        {/* Account security */}
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

        {/* Terms & conditions */}
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
              I agree to the{" "}
              <LegalDialog
                type="terms"
                trigger={
                  <button type="button" className="font-medium text-primary underline-offset-4 hover:underline">
                    Terms of Service
                  </button>
                }
              />{" "}
              and{" "}
              <LegalDialog
                type="privacy"
                trigger={
                  <button type="button" className="font-medium text-primary underline-offset-4 hover:underline">
                    Privacy Policy
                  </button>
                }
              />
              .
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
        label="Create Account"
        labels={{ submitting: "Creating account…", success: "Account created!" }}
      />

      <p className="text-center text-xs text-muted-foreground">
        Fields marked optional help personalize your travel profile — you can
        add them anytime later.
      </p>
    </form>
  );
}
