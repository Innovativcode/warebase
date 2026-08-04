import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { createProject, deleteProject, getProjectById, listProjects, updateProject } from "./project.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";

export const getProjects = asyncHandler(async (_req, res: Response) => {
  const projects = await listProjects();
  res.json({ success: true, data: projects });
});

export const getProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await getProjectById(String(req.params.id));
  res.json({ success: true, data: project });
});

export const postProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const project = await createProject({ id: req.user.id, role: req.user.role }, req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "create",
    entity: "project",
    entityId: project.id,
    metadata: { code: project.code, name: project.name, status: project.status },
  });
  res.status(201).json({ success: true, data: project });
});

export const patchProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: "Authentication required" } });
  }

  const project = await updateProject(String(req.params.id), { id: req.user.id, role: req.user.role }, req.body);
  await recordAuditLog({
    actorId: req.user?.id,
    action: "update",
    entity: "project",
    entityId: project.id,
    metadata: { code: project.code, name: project.name, status: project.status },
  });
  res.json({ success: true, data: project });
});

export const removeProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteProject(String(req.params.id));
  await recordAuditLog({
    actorId: req.user?.id,
    action: "delete",
    entity: "project",
    entityId: String(req.params.id),
  });
  res.status(204).send();
});
