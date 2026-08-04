import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "VIEWER"]).default("STAFF"),
  isActive: z.coerce.boolean().optional().default(true),
});

export const userPatchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "VIEWER"]).optional(),
  isActive: z.coerce.boolean().optional(),
});
