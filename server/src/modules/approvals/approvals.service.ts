import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";
import { emitRealtime, emitToUser } from "@/realtime";
import { recordAuditLog } from "@/modules/audit/audit.service";
import { approvalDecisionSchema } from "./approval.schemas";

export const listApprovalRequests = async () =>
  prisma.approvalRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: 50,
    include: {
      requestedBy: { select: { id: true, name: true, email: true, role: true } },
      reviewedBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });

export const getApprovalRequest = async (id: string) =>
  prisma.approvalRequest.findUnique({
    where: { id },
    include: {
      requestedBy: { select: { id: true, name: true, email: true, role: true } },
      reviewedBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });

export const reviewApprovalRequest = async (id: string, reviewerId: string, input: unknown) => {
  const payload = approvalDecisionSchema.parse(input);
  const existing = await prisma.approvalRequest.findUnique({
    where: { id },
    include: {
      requestedBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!existing) {
    throw new ApiError(404, "Approval request not found");
  }

  if (existing.status !== "PENDING") {
    throw new ApiError(409, "Approval request has already been reviewed");
  }

  if (existing.requestedByUserId === reviewerId) {
    throw new ApiError(403, "You cannot review your own approval request");
  }

  const reviewed = await prisma.$transaction(async (tx) => {
    const updated = await tx.approvalRequest.update({
      where: { id },
      data: {
        status: payload.status,
        reviewerNote: payload.reviewerNote ?? null,
        reviewedByUserId: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (payload.status === "APPROVED" && existing.type === "PURCHASE_ORDER" && existing.entityId) {
      const purchaseOrder = await tx.purchaseOrder.findUnique({ where: { id: existing.entityId } });

      if (purchaseOrder && purchaseOrder.status === "DRAFT") {
        await tx.purchaseOrder.update({
          where: { id: purchaseOrder.id },
          data: { status: "SENT", orderedAt: new Date() },
        });
      }
    }

    if (existing.requestedByUserId) {
      await tx.notification.create({
        data: {
          userId: existing.requestedByUserId,
          title:
            payload.status === "APPROVED"
              ? "Approval approved"
              : payload.status === "REJECTED"
                ? "Approval rejected"
                : "Approval changes requested",
          body: `${existing.title} was ${payload.status.toLowerCase().replace("_", " ")}.`,
          href: "/approvals",
          isRead: false,
        },
      });
      emitToUser(existing.requestedByUserId, "notification:new", { title: "Approval decision" });
    }

    await recordAuditLog({
      actorId: reviewerId,
      action: payload.status.toLowerCase(),
      entity: "approval_request",
      entityId: updated.id,
      metadata: {
        title: updated.title,
        status: updated.status,
        reviewerNote: updated.reviewerNote,
      },
    });

    return updated;
  });

  emitRealtime("approval:reviewed", { id: reviewed.id, status: reviewed.status });
  if (payload.status === "APPROVED" && existing.type === "PURCHASE_ORDER" && existing.entityId) {
    emitRealtime("purchase-order:updated", { id: existing.entityId });
  }
  emitRealtime("dashboard:updated", {});

  return reviewed;
};
