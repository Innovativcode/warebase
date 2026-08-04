import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { createPurchaseOrder, deletePurchaseOrder, getPurchaseOrderById, listPurchaseOrders, updatePurchaseOrder } from "./purchase-order.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";

export const getPurchaseOrders = asyncHandler(async (_req, res: Response) => {
  const purchaseOrders = await listPurchaseOrders();
  res.json({ success: true, data: purchaseOrders });
});

export const getPurchaseOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const purchaseOrder = await getPurchaseOrderById(String(req.params.id));
  res.json({ success: true, data: purchaseOrder });
});

export const postPurchaseOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const purchaseOrder = await createPurchaseOrder({ id: req.user.id, role: req.user.role, name: req.user.name }, req.body);

  await recordAuditLog({
    actorId: req.user.id,
    action: "create",
    entity: "purchase_order",
    entityId: purchaseOrder.id,
    metadata: { orderNumber: purchaseOrder.orderNumber, status: purchaseOrder.status },
  });
  res.status(201).json({ success: true, data: purchaseOrder });
});

export const patchPurchaseOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const purchaseOrder = await updatePurchaseOrder(String(req.params.id), { id: req.user.id, role: req.user.role, name: req.user.name }, req.body);

  await recordAuditLog({
    actorId: req.user.id,
    action: "update",
    entity: "purchase_order",
    entityId: purchaseOrder.id,
    metadata: { orderNumber: purchaseOrder.orderNumber, status: purchaseOrder.status },
  });
  res.json({ success: true, data: purchaseOrder });
});

export const removePurchaseOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deletePurchaseOrder(String(req.params.id));
  await recordAuditLog({
    actorId: req.user?.id,
    action: "delete",
    entity: "purchase_order",
    entityId: String(req.params.id),
  });
  res.status(204).send();
});
