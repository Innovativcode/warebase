import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(2).max(64),
  barcode: z.string().min(2).max(64).optional().nullable(),
  name: z.string().min(2).max(180),
  description: z.string().max(5000).optional().nullable(),
  unit: z.string().min(1).max(32),
  reorderPoint: z.coerce.number().int().min(0).default(0),
  reorderQty: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().cuid().optional().nullable(),
  supplierId: z.string().cuid().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
});
