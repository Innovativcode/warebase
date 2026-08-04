import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { listAuditLogs } from "./audit.service";

export const getAuditLogs = asyncHandler(async (_req, res: Response) => {
  const logs = await listAuditLogs();
  res.json({ success: true, data: logs });
});

