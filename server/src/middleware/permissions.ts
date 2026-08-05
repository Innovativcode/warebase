import type { NextFunction, Response } from "express";
import { ApiError } from "@/utils/http";
import type { AuthenticatedRequest } from "./auth";
import { prisma } from "@/db/prisma";

export type Permission = "read" | "write" | "delete" | "users:manage" | "approvals:manage" | "audit:read" | "accounting:read" | "accounting:manage";

const DEFAULT_PERMISSION_MATRIX: Record<string, Permission[]> = {
  VIEWER: ["read"],
  STAFF: ["read", "write"],
  MANAGER: ["read", "write", "delete", "users:manage", "approvals:manage", "audit:read", "accounting:read", "accounting:manage"],
  ADMIN: ["read", "write", "delete", "users:manage", "approvals:manage", "audit:read", "accounting:read", "accounting:manage"],
};

export const ROLE_RANK: Record<string, number> = {
  VIEWER: 0,
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
};

export const ALL_PERMISSIONS: Permission[] = ["read", "write", "delete", "users:manage", "approvals:manage", "audit:read", "accounting:read", "accounting:manage"];

export const getRolePermissions = async (role: string): Promise<Permission[]> => {
  const overrides = await prisma.permissionOverride.findMany({
    where: { role: role as any },
  });

  const basePermissions = [...(DEFAULT_PERMISSION_MATRIX[role] ?? [])];

  for (const override of overrides) {
    if (override.granted && !basePermissions.includes(override.permission as Permission)) {
      basePermissions.push(override.permission as Permission);
    } else if (!override.granted) {
      const index = basePermissions.indexOf(override.permission as Permission);
      if (index > -1) {
        basePermissions.splice(index, 1);
      }
    }
  }

  return basePermissions;
};

export const getUserPermissions = async (userId: string, role: string): Promise<Permission[]> => {
  const rolePermissions = await getRolePermissions(role);

  const userOverrides = await prisma.permissionOverride.findMany({
    where: { userId },
  });

  const permissions = [...rolePermissions];

  for (const override of userOverrides) {
    if (override.granted && !permissions.includes(override.permission as Permission)) {
      permissions.push(override.permission as Permission);
    } else if (!override.granted) {
      const index = permissions.indexOf(override.permission as Permission);
      if (index > -1) {
        permissions.splice(index, 1);
      }
    }
  }

  return permissions;
};

export const can = async (userId: string | undefined, role: string | undefined, permission: Permission): Promise<boolean> => {
  if (!role) {
    return false;
  }

  if (userId) {
    const permissions = await getUserPermissions(userId, role);
    return permissions.includes(permission);
  }

  const permissions = await getRolePermissions(role);
  return permissions.includes(permission);
};

export const canSync = (role: string | undefined, permission: Permission): boolean => {
  if (!role) {
    return false;
  }
  return (DEFAULT_PERMISSION_MATRIX[role] ?? []).includes(permission);
};

export const isApprover = (role: string | undefined): boolean => role === "ADMIN" || role === "MANAGER";

export const requirePermission = (...permissions: Permission[]) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    const hasPermission = await can(req.user.id, req.user.role, permissions[0]);
    if (!hasPermission) {
      next(new ApiError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
};

export const getPermissionMatrix = async () => {
  const matrix: Record<string, Permission[]> = {};

  for (const role of Object.keys(DEFAULT_PERMISSION_MATRIX)) {
    matrix[role] = await getRolePermissions(role);
  }

  return matrix;
};

export const setRolePermission = async (role: string, permission: Permission, granted: boolean) => {
  return prisma.permissionOverride.upsert({
    where: {
      role_permission: {
        role: role as any,
        permission,
      },
    },
    update: { granted },
    create: {
      role: role as any,
      permission,
      granted,
    },
  });
};

export const setUserPermission = async (userId: string, permission: Permission, granted: boolean) => {
  return prisma.permissionOverride.upsert({
    where: {
      userId_permission: {
        userId,
        permission,
      },
    },
    update: { granted },
    create: {
      userId,
      permission,
      granted,
    },
  });
};

export const getUserPermissionOverrides = async (userId: string) => {
  return prisma.permissionOverride.findMany({
    where: { userId },
  });
};

export const getRolePermissionOverrides = async (role: string) => {
  return prisma.permissionOverride.findMany({
    where: { role: role as any },
  });
};
