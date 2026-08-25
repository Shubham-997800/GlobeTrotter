import { z } from "zod";

const nameField = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters.")
  .max(40, "Must be 40 characters or fewer.")
  .regex(/^[\p{L}][\p{L}\s'.-]*$/u, "Letters, spaces, apostrophes and hyphens only.");

export const registerSchema = z
  .object({
    firstName: nameField,
    lastName: nameField,
    email: z.string().trim().email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[0-9\s()-]{7,15}$/,
        "Use 7–15 digits; spaces, dashes and parentheses are allowed.",
      )
      .optional()
      .or(z.literal("")),
    city: z.string().trim().max(60, "Keep the city under 60 characters.").optional().or(z.literal("")),
    country: z
      .string()
      .trim()
      .max(60, "Keep the country under 60 characters.")
      .optional()
      .or(z.literal("")),
    bio: z.string().trim().max(280, "Bio must be 280 characters or fewer.").optional().or(z.literal("")),
    avatarUrl: z.string().optional(),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Use 72 characters or fewer.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    adminCode: z.string().trim().optional().or(z.literal("")),
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

export type RegisterValues = z.infer<typeof registerSchema>;
