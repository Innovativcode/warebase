import type { Request, Response } from "express";
import { asyncHandler, ApiError } from "@/utils/http";
import {
  getPermissionMatrix,
  setRolePermission,
  setUserPermission,
  getUserPermissionOverrides,
  getRolePermissionOverrides,
  ALL_PERMISSIONS,
  type Permission,
} from "@/middleware/permissions";

export const getMatrix = asyncHandler(async (_req: Request, res: Response) => {
  const matrix = await getPermissionMatrix();
  res.json({ success: true, data: { matrix, permissions: ALL_PERMISSIONS } });
});

export const updateRolePermission = asyncHandler(async (req: Request, res: Response) => {
  const role = req.params.role as string;
  const { permission, granted } = req.body as { permission: string; granted: boolean };

  if (!ALL_PERMISSIONS.includes(permission as Permission)) {
    throw new ApiError(400, "Invalid permission");
  }

  const override = await setRolePermission(role, permission as Permission, granted);
  res.json({ success: true, data: override });
});

export const updateUserPermission = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const { permission, granted } = req.body as { permission: string; granted: boolean };

  if (!ALL_PERMISSIONS.includes(permission as Permission)) {
    throw new ApiError(400, "Invalid permission");
  }

  const override = await setUserPermission(userId, permission as Permission, granted);
  res.json({ success: true, data: override });
});

export const getUserOverrides = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const overrides = await getUserPermissionOverrides(userId);
  res.json({ success: true, data: overrides });
});

export const getRoleOverrides = asyncHandler(async (req: Request, res: Response) => {
  const role = req.params.role as string;
  const overrides = await getRolePermissionOverrides(role);
  res.json({ success: true, data: overrides });
});
