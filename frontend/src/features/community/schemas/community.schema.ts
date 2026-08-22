import { z } from "zod";

import { COMMUNITY_TAGS } from "../community.types";

/** Composer hard limits — surfaced live in the editor UI. */
export const POST_CONTENT_MAX = 2000;
export const POST_MEDIA_MAX = 4;
/** 5 MB per image — matches typical CDN limits and keeps localStorage sane. */
export const POST_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const tagSchema = z
  .string()
  .trim()
  .min(1, "Tags can't be empty")
  .max(24, "Keep tags under 24 characters")
  .regex(/^[\p{L}\p{N}][\p{L}\p{N}\s-]*$/u, "Letters, numbers, spaces and dashes only");

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something before publishing")
    .max(
      POST_CONTENT_MAX,
      `Posts are limited to ${POST_CONTENT_MAX} characters`,
    ),
  media: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().max(120).optional().default(""),
        size: z.number().int().nonnegative().optional(),
      }),
    )
    .max(POST_MEDIA_MAX, `Up to ${POST_MEDIA_MAX} images per post`),
  locationName: z.string().trim().max(80).optional(),
  tags: z.array(tagSchema).max(8, "Up to 8 tags per post"),
  privacy: z.enum(["public", "private"]),
});

export type CreatePostFormValues = z.infer<typeof createPostSchema>;

export const shareTripSchema = z.object({
  tripId: z.string().min(1, "Choose a trip to share"),
  content: z
    .string()
    .trim()
    .min(1, "Add a short note about this trip")
    .max(POST_CONTENT_MAX, `Notes are limited to ${POST_CONTENT_MAX} characters`),
  privacy: z.enum(["public", "private"]),
});

export type ShareTripFormValues = z.infer<typeof shareTripSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a comment first")
    .max(500, "Comments are limited to 500 characters"),
});

export type CommentFormValues = z.infer<typeof commentSchema>;

export const reportReasonSchema = z.enum([
  "spam",
  "inappropriate",
  "harassment",
  "other",
]);

export const reportPostSchema = z.object({
  reason: reportReasonSchema,
  details: z
    .string()
    .trim()
    .max(400, "Details are limited to 400 characters")
    .optional(),
});

export type ReportPostFormValues = z.infer<typeof reportPostSchema>;

/** True when the tag list already includes the given tag (case-insensitive). */
export function hasTag(tags: string[], candidate: string): boolean {
  const needle = candidate.trim().toLowerCase();
  return tags.some((tag) => tag.toLowerCase() === needle);
}

/** Preset tags from the design spec + any custom ones already typed. */
export function mergePresetTags(tags: string[]): string[] {
  return [...new Set([...COMMUNITY_TAGS, ...tags])];
}
