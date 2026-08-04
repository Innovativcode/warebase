import { z } from "zod";

export const warehouseSchema = z.object({
  code: z.string().min(2).max(24),
  name: z.string().min(2).max(180),
  location: z.string().max(255).optional().nullable(),
  isPrimary: z.coerce.boolean().default(false),
});

