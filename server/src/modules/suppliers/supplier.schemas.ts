import { z } from "zod";

export const supplierSchema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(180),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
});

