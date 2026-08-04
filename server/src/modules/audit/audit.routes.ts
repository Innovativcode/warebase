import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getAuditLogs } from "./audit.controller";

export const auditRouter = Router();

auditRouter.use(requireAuth);
auditRouter.get("/", requirePermission("audit:read"), getAuditLogs);
