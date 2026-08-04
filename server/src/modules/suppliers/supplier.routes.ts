import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getSupplier, getSuppliers, patchSupplier, postSupplier, removeSupplier } from "./supplier.controller";

export const supplierRouter = Router();

supplierRouter.use(requireAuth);
supplierRouter.get("/", requirePermission("read"), getSuppliers);
supplierRouter.get("/:id", requirePermission("read"), getSupplier);
supplierRouter.post("/", requirePermission("write"), postSupplier);
supplierRouter.patch("/:id", requirePermission("write"), patchSupplier);
supplierRouter.delete("/:id", requirePermission("delete"), removeSupplier);
