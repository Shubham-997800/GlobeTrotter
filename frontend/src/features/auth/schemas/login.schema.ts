import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;
