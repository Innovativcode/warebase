import type { Response } from "express";
import { asyncHandler, ApiError } from "@/utils/http";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "./notifications.service";

export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const limit = Number(req.query.limit ?? 8);
  const notifications = await listNotifications(req.user.id, Number.isFinite(limit) && limit > 0 ? limit : 8);
  res.json({ success: true, data: notifications });
});

export const patchNotificationRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  await markNotificationRead(req.user.id, String(req.params.id));
  res.json({ success: true });
});

export const postNotificationsReadAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const result = await markAllNotificationsRead(req.user.id);
  res.json({ success: true, data: { updated: result.count } });
});
