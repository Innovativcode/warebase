import { z } from "zod";

export const purchaseOrderLineSchema = z.object({
  productId: z.string().cuid(),
  quantityOrdered: z.coerce.number().int().min(1),
  quantityReceived: z.coerce.number().int().min(0).default(0),
  unitCost: z.coerce.number().positive(),
});

export const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(2).max(32),
  supplierId: z.string().cuid().optional().nullable(),
  status: z.enum(["DRAFT", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"]).default("DRAFT"),
  orderedAt: z.coerce.date().optional().nullable(),
  expectedAt: z.coerce.date().optional().nullable(),
  receivedAt: z.coerce.date().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  createdByUserId: z.string().cuid().optional().nullable(),
  lines: z.array(purchaseOrderLineSchema).default([]),
});

