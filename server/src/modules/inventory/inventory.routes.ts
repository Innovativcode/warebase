import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getMovements, getStockLevels, postMovement, postReceivePurchaseOrder, postRestock } from "./inventory.controller";

export const inventoryRouter = Router();

inventoryRouter.use(requireAuth);
inventoryRouter.get("/movements", requirePermission("read"), getMovements);
inventoryRouter.get("/stock", requirePermission("read"), getStockLevels);
inventoryRouter.post("/movements", requirePermission("write"), postMovement);
inventoryRouter.post("/restock", requirePermission("write"), postRestock);
inventoryRouter.post("/purchase-orders/:id/receive", requirePermission("write"), postReceivePurchaseOrder);
