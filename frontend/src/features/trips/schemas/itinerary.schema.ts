import { z } from "zod";

import { parseTime as parseTimeSafe } from "../itinerary.utils";
import type { ActivityFilterId } from "../itinerary.types";

/* ── Custom / edit activity form ─────────────────────────────── */

export const ACTIVITY_NAME_MAX = 80;
export const ACTIVITY_DESCRIPTION_MAX = 400;

const timeField = z
  .string()
  .min(1, "Pick a start time.")
  .refine((value) => parseTimeSafe(value) !== null, {
    message: "Use a valid HH:MM time.",
  });

/**
 * `tripDates` are the authoritative YYYY-MM-DD strings the activity's
 * day must belong to — validated in superRefine.
 */
export function activityFormSchema(tripDates: string[]) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Give the activity a name.")
        .max(
          ACTIVITY_NAME_MAX,
          `Keep the name under ${ACTIVITY_NAME_MAX} characters.`,
        ),
      description: z
        .string()
        .trim()
        .max(
          ACTIVITY_DESCRIPTION_MAX,
          `Description must be ${ACTIVITY_DESCRIPTION_MAX} characters or fewer.`,
        ),
      location: z.string().trim().max(120, "Location is too long."),
      dayId: z
        .string()
        .min(1, "Choose a day within the trip dates."),
      startTime: timeField,
      endTime: z
        .string()
        .min(1, "Pick an end time.")
        .refine((value) => parseTimeSafe(value) !== null, {
          message: "Use a valid HH:MM time.",
        }),
      estimatedCost: z
        .string()
        .trim()
        .refine((value) => value === "" || /^\d{1,10}(\.\d{1,2})?$/.test(value), {
          message: "Enter a valid amount (max 2 decimals).",
        })
        .refine((value) => value === "" || Number(value) >= 0, {
          message: "Cost can't be negative.",
        }),
    })
    .superRefine((data, ctx) => {
      if (!tripDates.some((date) => dateToDayId(date) === data.dayId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dayId"],
          message: "The date must fall inside the trip dates.",
        });
      }
      const start = parseTimeSafe(data.startTime);
      const end = parseTimeSafe(data.endTime);
      if (start !== null && end !== null && end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: "End time must be after the start time.",
        });
      }
    });
}

export type ActivityFormValues = z.infer<ReturnType<typeof activityFormSchema>>;

/** Day ids mirror their date (`day_YYYY-MM-DD`). */
export function dateToDayId(date: string): string {
  return `day_${date}`;
}

/** Default (empty) values for the custom-activity form. */
export function emptyActivityForm(dayId = ""): ActivityFormValues {
  return {
    name: "",
    description: "",
    location: "",
    dayId,
    startTime: "09:00",
    endTime: "11:00",
    estimatedCost: "",
  };
}

/* ── City stop form ──────────────────────────────────────────── */

export function stopFormSchema(tripDates: string[]) {
  return z
    .object({
      destinationId: z.string().min(1, "Search and pick a city."),
      arrivalDate: z
        .string()
        .min(1, "Pick an arrival date.")
        .refine((value) => tripDates.includes(value), {
          message: "Arrival must fall within the trip dates.",
        }),
      departureDate: z
        .string()
        .min(1, "Pick a departure date.")
        .refine((value) => tripDates.includes(value), {
          message: "Departure must fall within the trip dates.",
        }),
    })
    .superRefine((data, ctx) => {
      if (
        data.arrivalDate &&
        data.departureDate &&
        data.departureDate < data.arrivalDate
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["departureDate"],
          message: "Departure can't be before arrival.",
        });
      }
    });
}

export type StopFormValues = z.infer<ReturnType<typeof stopFormSchema>>;

/* ── Trip quick-edit form ────────────────────────────────────── */

export interface EditTripFormValues {
  name: string;
  description: string;
  coverImage: string;
}

export const editTripSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give your trip a name.")
    .max(100, "Keep the name under 100 characters."),
  description: z.string().trim().max(500, "Description is too long."),
  coverImage: z.string(),
});

/** Guard so UI filter state can only hold known category ids. */
export function isActivityFilter(value: string): value is ActivityFilterId {
  return [
    "all",
    "attractions",
    "food",
    "adventure",
    "nature",
    "culture",
    "shopping",
    "nightlife",
  ].includes(value);
}
