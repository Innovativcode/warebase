import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getActivities } from "./activity.controller";

export const activitiesRouter = Router();

activitiesRouter.use(requireAuth);

activitiesRouter.get("/", requirePermission("read"), getActivities);
