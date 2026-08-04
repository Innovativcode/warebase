import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { createProduct, deleteProduct, getProductByBarcode, getProductById, listProducts, updateProduct } from "./product.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";

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
