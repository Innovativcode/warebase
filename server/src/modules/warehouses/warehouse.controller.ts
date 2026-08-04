import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { createWarehouse, deleteWarehouse, getWarehouseById, listWarehouses, updateWarehouse } from "./warehouse.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";

export const getWarehouses = asyncHandler(async (_req, res: Response) => {
  const warehouses = await listWarehouses();
  res.json({ success: true, data: warehouses });
});

export const getWarehouse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const warehouse = await getWarehouseById(String(req.params.id));
  res.json({ success: true, data: warehouse });
});

export const postWarehouse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const warehouse = await createWarehouse(req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "create",
    entity: "warehouse",
    entityId: warehouse.id,
    metadata: { code: warehouse.code, name: warehouse.name },
  });
  res.status(201).json({ success: true, data: warehouse });
});

export const patchWarehouse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const warehouse = await updateWarehouse(String(req.params.id), req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "update",
    entity: "warehouse",
    entityId: warehouse.id,
    metadata: { code: warehouse.code, name: warehouse.name },
  });
  res.json({ success: true, data: warehouse });
});

export const removeWarehouse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteWarehouse(String(req.params.id));
  await recordAuditLog({
    actorId: req.user?.id,
    action: "delete",
    entity: "warehouse",
    entityId: String(req.params.id),
  });
  res.status(204).send();
});
