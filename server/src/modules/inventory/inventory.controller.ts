import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { createMovement, listMovements } from "./inventory.service";
import { createRestockOrder, listStockLevels, receivePurchaseOrder } from "./restock.service";
import { evaluateLowStock } from "./low-stock.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";

export const getMovements = asyncHandler(async (_req, res: Response) => {
  const movements = await listMovements();
  res.json({ success: true, data: movements });
});

export const getStockLevels = asyncHandler(async (_req, res: Response) => {
  const stock = await listStockLevels();
  res.json({ success: true, data: stock });
});

export const postMovement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const { performedByUserId: _ignored, ...body } = req.body;

  const movement = await createMovement(body, req.user.id);

  await recordAuditLog({
    actorId: req.user.id,
    action: "create",
    entity: "stock_movement",
    entityId: movement.id,
    metadata: {
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
    },
  });

  await evaluateLowStock().catch(() => undefined);

  res.status(201).json({ success: true, data: movement });
});

export const postRestock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const order = await createRestockOrder(
    { id: req.user.id, role: req.user.role, name: req.user.name },
    req.body,
  );

  await recordAuditLog({
    actorId: req.user.id,
    action: "create",
    entity: "purchase_order",
    entityId: order.id,
    metadata: { orderNumber: order.orderNumber, restock: true },
  });

  res.status(201).json({ success: true, data: order });
});

export const postReceivePurchaseOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const order = await receivePurchaseOrder(String(req.params.id), { id: req.user.id, role: req.user.role, name: req.user.name }, req.body);

  await recordAuditLog({
    actorId: req.user.id,
    action: "receive",
    entity: "purchase_order",
    entityId: order.id,
    metadata: { orderNumber: order.orderNumber, status: order.status },
  });

  await evaluateLowStock().catch(() => undefined);

  res.json({ success: true, data: order });
});
