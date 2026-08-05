import { z } from "zod";

const IMAGE_PATTERN = /^data:image\/(jpeg|png|webp|gif);base64,/;

const avatarUrlField = z
  .string()
  .regex(IMAGE_PATTERN, "Profile image must be a JPEG, PNG, WebP, or GIF data URL")
  .max(1_000_000, "Profile image is too large")
  .optional()
  .nullable();

export const userCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "VIEWER"]).default("STAFF"),
  isActive: z.coerce.boolean().optional().default(true),
  avatarUrl: avatarUrlField,
});

export const userPatchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "VIEWER"]).optional(),
  isActive: z.coerce.boolean().optional(),
  avatarUrl: avatarUrlField,
});
