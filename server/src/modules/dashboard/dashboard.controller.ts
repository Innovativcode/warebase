import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { getDashboardSummary } from "./dashboard.service";
import type { AuthenticatedRequest } from "@/middleware/auth";

export const dashboardSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const summary = await getDashboardSummary(req.user?.id);
  res.json({ success: true, data: summary });
});
