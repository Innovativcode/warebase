import { z } from "zod";

export const projectSchema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(180),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["PLANNED", "ACTIVE", "BLOCKED", "COMPLETED", "ARCHIVED"]).default("PLANNED"),
  startDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  ownerUserId: z.string().cuid().optional().nullable(),
});

