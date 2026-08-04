import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { createSupplier, deleteSupplier, getSupplierById, listSuppliers, updateSupplier } from "./supplier.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";

export const getSuppliers = asyncHandler(async (_req, res: Response) => {
  const suppliers = await listSuppliers();
  res.json({ success: true, data: suppliers });
});

export const getSupplier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const supplier = await getSupplierById(String(req.params.id));
  res.json({ success: true, data: supplier });
});

export const postSupplier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const supplier = await createSupplier(req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "create",
    entity: "supplier",
    entityId: supplier.id,
    metadata: { code: supplier.code, name: supplier.name },
  });
  res.status(201).json({ success: true, data: supplier });
});

export const patchSupplier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const supplier = await updateSupplier(String(req.params.id), req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "update",
    entity: "supplier",
    entityId: supplier.id,
    metadata: { code: supplier.code, name: supplier.name },
  });
  res.json({ success: true, data: supplier });
});

export const removeSupplier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteSupplier(String(req.params.id));
  await recordAuditLog({
    actorId: req.user?.id,
    action: "delete",
    entity: "supplier",
    entityId: String(req.params.id),
  });
  res.status(204).send();
});
