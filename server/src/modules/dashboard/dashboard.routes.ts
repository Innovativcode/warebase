import { Router } from "express";
import { dashboardSummary } from "./dashboard.controller";
import { requireAuth } from "@/middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, dashboardSummary);

