import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getSummary, getTransactions, postTransaction } from "./accounting.controller";

export const accountingRouter = Router();

accountingRouter.use(requireAuth);

accountingRouter.get("/summary", requirePermission("accounting:read"), getSummary);
accountingRouter.get("/transactions", requirePermission("accounting:read"), getTransactions);
accountingRouter.post("/transactions", requirePermission("accounting:manage"), postTransaction);
