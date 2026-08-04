import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getProjects, patchProject, postProject, removeProject, getProject } from "./project.controller";

export const projectRouter = Router();

projectRouter.use(requireAuth);
projectRouter.get("/", requirePermission("read"), getProjects);
projectRouter.get("/:id", requirePermission("read"), getProject);
projectRouter.post("/", requirePermission("write"), postProject);
projectRouter.patch("/:id", requirePermission("write"), patchProject);
projectRouter.delete("/:id", requirePermission("delete"), removeProject);
