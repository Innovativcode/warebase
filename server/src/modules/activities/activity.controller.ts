import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { listActivities } from "./activity.service";
import type { AuthenticatedRequest } from "@/middleware/auth";

export const getActivities = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = Number(req.query.limit) || 50;
  const businessId = (req.query.businessId as string | undefined) ?? null;
  const activities = await listActivities({ limit, businessId });
  res.json({ success: true, data: activities });
});
