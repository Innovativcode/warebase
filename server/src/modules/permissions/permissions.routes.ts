import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import {
  getMatrix,
  updateRolePermission,
  updateUserPermission,
  getUserOverrides,
  getRoleOverrides,
} from "./permissions.controller";

export const permissionsRouter = Router();

permissionsRouter.use(requireAuth);

permissionsRouter.get("/matrix", requirePermission("users:manage"), getMatrix);
permissionsRouter.get("/role/:role", requirePermission("users:manage"), getRoleOverrides);
permissionsRouter.patch("/role/:role", requirePermission("users:manage"), updateRolePermission);
permissionsRouter.get("/user/:userId", requirePermission("users:manage"), getUserOverrides);
permissionsRouter.patch("/user/:userId", requirePermission("users:manage"), updateUserPermission);
