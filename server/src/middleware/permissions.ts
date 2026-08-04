import type { NextFunction, Response } from "express";
import { ApiError } from "@/utils/http";
import type { AuthenticatedRequest } from "./auth";

export type Permission = "read" | "write" | "delete" | "users:manage" | "approvals:manage" | "audit:read";

const PERMISSION_MATRIX: Record<string, Permission[]> = {
  VIEWER: ["read"],
  STAFF: ["read", "write"],
  MANAGER: ["read", "write", "delete", "users:manage", "approvals:manage", "audit:read"],
  ADMIN: ["read", "write", "delete", "users:manage", "approvals:manage", "audit:read"],
};

export const ROLE_RANK: Record<string, number> = {
  VIEWER: 0,
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
};

export const can = (role: string | undefined, permission: Permission): boolean => {
  if (!role) {
    return false;
  }
  return (PERMISSION_MATRIX[role] ?? []).includes(permission);
};

export const isApprover = (role: string | undefined): boolean => role === "ADMIN" || role === "MANAGER";

export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!permissions.some((permission) => can(req.user?.role, permission))) {
      next(new ApiError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
};
