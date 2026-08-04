import type { Response } from "express";
import { asyncHandler, ApiError } from "@/utils/http";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { getApprovalRequest, listApprovalRequests, reviewApprovalRequest } from "./approvals.service";

export const getApprovalRequests = asyncHandler(async (_req, res: Response) => {
  const approvals = await listApprovalRequests();
  res.json({ success: true, data: approvals });
});

export const getApprovalRequestById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const approval = await getApprovalRequest(String(req.params.id));

  if (!approval) {
    throw new ApiError(404, "Approval request not found");
  }

  res.json({ success: true, data: approval });
});

export const patchApprovalRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const approval = await reviewApprovalRequest(String(req.params.id), req.user.id, req.body);
  res.json({ success: true, data: approval });
});
