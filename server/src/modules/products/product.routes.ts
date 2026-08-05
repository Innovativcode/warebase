import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import {
  blockProductById,
  flagProductById,
  getProduct,
  getProductBarcode,
  getProducts,
  patchProduct,
  postProduct,
  removeProduct,
  unblockProductById,
} from "./product.controller";

export const productRouter = Router();

productRouter.use(requireAuth);
productRouter.get("/", requirePermission("read"), getProducts);
productRouter.get("/barcode/:barcode", requirePermission("read"), getProductBarcode);
productRouter.get("/:id", requirePermission("read"), getProduct);
productRouter.post("/", requirePermission("write"), postProduct);
productRouter.post("/:id/flag", requirePermission("write"), flagProductById);
productRouter.post("/:id/block", requirePermission("delete"), blockProductById);
productRouter.post("/:id/unblock", requirePermission("delete"), unblockProductById);
productRouter.patch("/:id", requirePermission("write"), patchProduct);
productRouter.delete("/:id", requirePermission("delete"), removeProduct);
