import { z } from "zod";
import { isValidKey, minutesFromTime } from "../calendar.utils";

/**
 * Zod contracts for standalone calendar events. Trip spans and
 * itinerary activities are derived records — they never pass through
 * these forms.
 */

export const EVENT_TITLE_MAX = 80;
export const EVENT_LOCATION_MAX = 120;
export const EVENT_DESCRIPTION_MAX = 500;

/** Types offered by the create/edit form (food comes from itineraries only). */
export const CREATABLE_EVENT_TYPES = [
  "activity",
  "transport",
  "accommodation",
  "custom",
] as const;

const dateKeySchema = z
  .string()
  .min(1, "Pick a date.")
  .refine((value) => isValidKey(value), "Enter a valid date.");

const timeSchema = z
  .string()
  .min(1, "Pick a time.")
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a 24-hour HH:mm value.");

export const customEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give the event a title.")
      .max(
        EVENT_TITLE_MAX,
        `Keep the title under ${EVENT_TITLE_MAX} characters.`,
      ),
    type: z.enum(CREATABLE_EVENT_TYPES),
    date: dateKeySchema,
    startTime: timeSchema,
    endTime: timeSchema,
    location: z
      .string()
      .trim()
      .max(
        EVENT_LOCATION_MAX,
        `Keep the location under ${EVENT_LOCATION_MAX} characters.`,
      )
      .optional(),
    description: z
      .string()
      .trim()
      .max(
        EVENT_DESCRIPTION_MAX,
        `Keep the notes under ${EVENT_DESCRIPTION_MAX} characters.`,
      )
      .optional(),
    tripId: z.string().optional(),
  })
  .refine(
    (data) => minutesFromTime(data.endTime) > minutesFromTime(data.startTime),
    { message: "End time must be after the start time.", path: ["endTime"] },
  );

export type CustomEventFormValues = z.infer<typeof customEventSchema>;