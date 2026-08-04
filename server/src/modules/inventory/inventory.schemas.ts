import { z } from "zod";

export const movementSchema = z.object({
  productId: z.string().cuid(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT", "TRANSFER"]),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().max(255).optional().nullable(),
  reference: z.string().max(128).optional().nullable(),
  sourceWarehouseId: z.string().cuid().optional().nullable(),
  destinationWarehouseId: z.string().cuid().optional().nullable(),
});

export const restockSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1).optional(),
  supplierId: z.string().cuid().optional().nullable(),
  warehouseId: z.string().cuid().optional().nullable(),
});

export const receiveSchema = z.object({
  warehouseId: z.string().cuid().optional().nullable(),
});

