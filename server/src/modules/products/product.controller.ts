import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import {
  blockProduct,
  createProduct,
  deleteProduct,
  flagProduct,
  getProductByBarcode,
  getProductById,
  listProducts,
  unblockProduct,
  updateProduct,
} from "./product.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";
import { recordActivity, resolveActor } from "@/modules/activities/activity.service";

const SCAN_DEBOUNCE_WINDOW_MS = 10_000;
const lastScanByUser: Map<string, { productId: string; at: number }> = new Map();

export const getProducts = asyncHandler(async (_req, res: Response) => {
  const products = await listProducts();
  res.json({ success: true, data: products });
});

export const getProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await getProductById(String(req.params.id));
  res.json({ success: true, data: product });
});

export const getProductBarcode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await getProductByBarcode(String(req.params.barcode));
  const actor = await resolveActor(req.user?.id);

  const key = req.user?.id ?? "anonymous";
  const previous = lastScanByUser.get(key);
  const now = Date.now();
  const isDuplicate =
    previous && previous.productId === product.id && now - previous.at < SCAN_DEBOUNCE_WINDOW_MS;

  if (!isDuplicate) {
    lastScanByUser.set(key, { productId: product.id, at: now });
    await recordActivity({
      type: "SCAN",
      message: `${actor.actorName ?? "Someone"} scanned ${product.name}`,
      actorId: req.user?.id,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "product",
      targetId: product.id,
      businessId: product.businessId ?? actor.businessId,
      metadata: { sku: product.sku, barcode: product.barcode },
    });
  }

  res.json({ success: true, data: product });
});

export const postProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await createProduct(req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "create",
    entity: "product",
    entityId: product.id,
    metadata: { sku: product.sku, name: product.name },
  });
  res.status(201).json({ success: true, data: product });
});

export const patchProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await updateProduct(String(req.params.id), req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "update",
    entity: "product",
    entityId: product.id,
    metadata: { sku: product.sku, name: product.name },
  });
  res.json({ success: true, data: product });
});

export const removeProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteProduct(String(req.params.id));
  await recordAuditLog({
    actorId: req.user?.id,
    action: "delete",
    entity: "product",
    entityId: String(req.params.id),
  });
  res.status(204).send();
});

export const flagProductById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const product = await flagProduct(id, req.body?.reason ?? null);
  const actor = await resolveActor(req.user?.id);

  await recordAuditLog({
    actorId: req.user?.id,
    action: "flag",
    entity: "product",
    entityId: id,
    metadata: { reason: req.body?.reason ?? null },
  });

  await recordActivity({
    type: "FLAG",
    message: `${actor.actorName ?? "Someone"} flagged ${product.name}`,
    actorId: req.user?.id,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "product",
    targetId: id,
    businessId: product.businessId ?? actor.businessId,
    metadata: { reason: req.body?.reason ?? null },
  });

  res.json({ success: true, data: product });
});

export const blockProductById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const product = await blockProduct(id);
  const actor = await resolveActor(req.user?.id);

  await recordAuditLog({
    actorId: req.user?.id,
    action: "block",
    entity: "product",
    entityId: id,
    metadata: { name: product.name },
  });

  await recordActivity({
    type: "BLOCK",
    message: `${actor.actorName ?? "Someone"} blocked ${product.name}`,
    actorId: req.user?.id,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "product",
    targetId: id,
    businessId: product.businessId ?? actor.businessId,
  });

  res.json({ success: true, data: product });
});

export const unblockProductById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const product = await unblockProduct(id);
  const actor = await resolveActor(req.user?.id);

  await recordAuditLog({
    actorId: req.user?.id,
    action: "unblock",
    entity: "product",
    entityId: id,
    metadata: { name: product.name },
  });

  await recordActivity({
    type: "UNBLOCK",
    message: `${actor.actorName ?? "Someone"} unblocked ${product.name}`,
    actorId: req.user?.id,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "product",
    targetId: id,
    businessId: product.businessId ?? actor.businessId,
  });

  res.json({ success: true, data: product });
});
