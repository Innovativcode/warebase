import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getPurchaseOrders, patchPurchaseOrder, postPurchaseOrder, removePurchaseOrder, getPurchaseOrder } from "./purchase-order.controller";

export const purchaseOrderRouter = Router();

purchaseOrderRouter.use(requireAuth);
purchaseOrderRouter.get("/", requirePermission("read"), getPurchaseOrders);
purchaseOrderRouter.get("/:id", requirePermission("read"), getPurchaseOrder);
purchaseOrderRouter.post("/", requirePermission("write"), postPurchaseOrder);
purchaseOrderRouter.patch("/:id", requirePermission("write"), patchPurchaseOrder);
purchaseOrderRouter.delete("/:id", requirePermission("delete"), removePurchaseOrder);
