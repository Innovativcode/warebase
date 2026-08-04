import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getWarehouse, getWarehouses, patchWarehouse, postWarehouse, removeWarehouse } from "./warehouse.controller";

export const warehouseRouter = Router();

warehouseRouter.use(requireAuth);
warehouseRouter.get("/", requirePermission("read"), getWarehouses);
warehouseRouter.get("/:id", requirePermission("read"), getWarehouse);
warehouseRouter.post("/", requirePermission("write"), postWarehouse);
warehouseRouter.patch("/:id", requirePermission("write"), patchWarehouse);
warehouseRouter.delete("/:id", requirePermission("delete"), removeWarehouse);
