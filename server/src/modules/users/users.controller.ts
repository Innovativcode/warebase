import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { createUser, listUsers, updateUser } from "./users.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";

export const getUsers = asyncHandler(async (_req, res: Response) => {
  const users = await listUsers();
  res.json({ success: true, data: users });
});

export const postUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const user = await createUser({ id: req.user.id, role: req.user.role }, req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "create",
    entity: "user",
    entityId: user.id,
    metadata: { name: user.name, role: user.role, isActive: user.isActive },
  });
  res.status(201).json({ success: true, data: user });
});

export const patchUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const user = await updateUser({ id: req.user.id, role: req.user.role }, String(req.params.id), req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "update",
    entity: "user",
    entityId: user.id,
    metadata: { name: user.name, role: user.role, isActive: user.isActive },
  });
  res.json({ success: true, data: user });
});
