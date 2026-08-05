import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const IMAGE_PATTERN = /^data:image\/(jpeg|png|webp|gif);base64,/;

export const updateMeSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  avatarUrl: z
    .string()
    .regex(IMAGE_PATTERN, "Profile image must be a JPEG, PNG, WebP, or GIF data URL")
    .max(1_000_000, "Profile image is too large")
    .optional()
    .nullable(),
});

