import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getApprovalRequestById, getApprovalRequests, patchApprovalRequest } from "./approvals.controller";

export const approvalsRouter = Router();

approvalsRouter.use(requireAuth);
approvalsRouter.get("/", requirePermission("approvals:manage"), getApprovalRequests);
approvalsRouter.get("/:id", requirePermission("approvals:manage"), getApprovalRequestById);
approvalsRouter.patch("/:id", requirePermission("approvals:manage"), patchApprovalRequest);
