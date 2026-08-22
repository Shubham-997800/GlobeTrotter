import { z } from "zod";

import { budgetTiers, currencies, interestCatalog } from "../trips.data";
import { parseDateOnly } from "../trips.utils";
import type { BudgetTier, InterestId } from "../trips.types";

const currencyCodes = currencies.map((currency) => currency.code);
const tierIds = budgetTiers.map((tier) => tier.id) as [
  BudgetTier,
  ...BudgetTier[],
];
const interestIds = interestCatalog.map(
  (interest) => interest.id,
) as [InterestId, ...InterestId[]];

export const TRIP_NAME_MAX = 100;
export const TRIP_DESCRIPTION_MAX = 500;

/**
 * Shared trip-draft validation. `mode: "draft"` only requires a name so
 * work-in-progress trips can be saved; `mode: "create"` enforces every
 * field the itinerary builder depends on.
 */
export function createTripSchema(mode: "draft" | "create") {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Give your trip a name.")
        .max(
          TRIP_NAME_MAX,
          `Keep the name under ${TRIP_NAME_MAX} characters.`,
        ),
      description: z
        .string()
        .trim()
        .max(
          TRIP_DESCRIPTION_MAX,
          `Description must be ${TRIP_DESCRIPTION_MAX} characters or fewer.`,
        ),
      coverImage: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      destinationId: z.string(),
      interests: z.array(z.enum(interestIds)),
      budgetTier: z.enum(tierIds),
      currency: z
        .string()
        .refine((code) => currencyCodes.includes(code), {
          message: "Choose a supported currency.",
        }),
      budgetAmount: z
        .string()
        .trim()
        .refine((value) => value === "" || /^\d{1,12}(\.\d{1,2})?$/.test(value), {
          message:
            "Enter a valid amount (max 2 decimals).",
        })
        .refine((value) => value === "" || Number(value) >= 100, {
          message: "Budget must be at least 100.",
        })
        .refine((value) => value === "" || Number(value) <= 100_000_000, {
          message: "That amount looks too large — double-check it.",
        }),
    })
    .superRefine((data, ctx) => {
      const start = data.startDate ? parseDateOnly(data.startDate) : null;
      const end = data.endDate ? parseDateOnly(data.endDate) : null;

      if (start && end && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date can't be before the start date.",
        });
      }

      if (mode !== "create") return;

      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "Pick a start date.",
        });
      }
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "Pick an end date.",
        });
      }
      if (!data.destinationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["destinationId"],
          message: "Choose a destination to continue.",
        });
      }
      if (data.budgetAmount === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["budgetAmount"],
          message: "Enter your total budget.",
        });
      }
    });
}

export type TripFormValues = z.infer<ReturnType<typeof createTripSchema>>;

/** Default form state shared by the page and the draft restore logic. */
export function emptyTripDraft(): TripFormValues {
  return {
    name: "",
    description: "",
    coverImage: "",
    startDate: "",
    endDate: "",
    destinationId: "",
    interests: [],
    budgetTier: "moderate",
    currency: "INR",
    budgetAmount: "",
  };
}
