import type { Response } from "express";
import { asyncHandler } from "@/utils/http";
import { createTransaction, getAccountingSummary, listTransactions } from "./accounting.service";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { recordAuditLog } from "@/modules/audit/audit.service";
import { recordActivity, resolveActor } from "@/modules/activities/activity.service";
import type { TransactionType } from "@prisma/client";

export const getSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const summary = await getAccountingSummary();
  res.json({ success: true, data: summary });
});

export const getTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const type = req.query.type as TransactionType | undefined;
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;

  const result = await listTransactions({
    type: type ?? null,
    limit,
    offset,
  });

  res.json({ success: true, data: result });
});

export const postTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const actor = await resolveActor(req.user?.id);

  const transaction = await createTransaction({
    type: req.body.type as TransactionType,
    amount: Number(req.body.amount),
    category: String(req.body.category ?? "Other"),
    description: req.body.description ?? null,
    reference: req.body.reference ?? null,
    currency: req.body.currency ?? "USD",
    occurredAt: req.body.occurredAt ? new Date(String(req.body.occurredAt)) : undefined,
    createdByUserId: req.user?.id ?? null,
    businessId: actor.businessId,
  });

  const direction = transaction.type === "INCOME" ? "Income" : "Expense";
  await recordAuditLog({
    actorId: req.user?.id,
    action: "create",
    entity: "transaction",
    entityId: transaction.id,
    metadata: { type: transaction.type, amount: transaction.amount.toString(), category: transaction.category },
  });

  await recordActivity({
    type: "FINANCE",
    message: `${actor.actorName ?? "Someone"} recorded ${direction.toLowerCase()} of ${transaction.amount.toString()} ${transaction.currency} (${transaction.category})`,
    actorId: req.user?.id,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "transaction",
    targetId: transaction.id,
    businessId: actor.businessId,
  });

  res.status(201).json({ success: true, data: transaction });
});
