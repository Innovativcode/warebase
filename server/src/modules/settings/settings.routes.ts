import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getSettings, patchSettings } from "./settings.controller";

const settingsRouter = Router();

settingsRouter.use(requireAuth);
settingsRouter.get("/", getSettings);
settingsRouter.patch("/", requirePermission("users:manage"), patchSettings);

export { settingsRouter };
