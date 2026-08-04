import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";
import { isApprover } from "@/middleware/permissions";
import { emitRealtime, emitToUser } from "@/realtime";
import { purchaseOrderSchema } from "./purchase-order.schemas";

export type PurchaseOrderActor = {
  id: string;
  role: string;
  name: string;
};

export const listPurchaseOrders = async () =>
  prisma.purchaseOrder.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      supplier: { select: { id: true, name: true, code: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

export const getPurchaseOrderById = async (id: string) => {
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: { select: { id: true, name: true, code: true } },
      lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!purchaseOrder) {
    throw new ApiError(404, "Purchase order not found");
  }

  return purchaseOrder;
};

const notifyManagers = async (title: string, body: string, href: string, excludeUserId: string) => {
  const managers = await prisma.user.findMany({
    where: { isActive: true, role: { in: ["ADMIN", "MANAGER"] } },
    select: { id: true },
  });

  for (const manager of managers) {
    if (manager.id === excludeUserId) {
      continue;
    }
    await prisma.notification.create({
      data: { userId: manager.id, title, body, href },
    });
    emitToUser(manager.id, "notification:new", { title });
  }
};

export const createPurchaseOrder = async (actor: PurchaseOrderActor, input: unknown) => {
  const payload = purchaseOrderSchema.parse(input);
  const requiresApproval = !isApprover(actor.role);

  const purchaseOrder = await prisma.$transaction(async (tx) => {
    const created = await tx.purchaseOrder.create({
      data: {
        orderNumber: payload.orderNumber,
        supplierId: payload.supplierId ?? undefined,
        status: requiresApproval ? "DRAFT" : payload.status,
        orderedAt: payload.orderedAt ?? undefined,
        expectedAt: payload.expectedAt ?? undefined,
        receivedAt: payload.receivedAt ?? undefined,
        notes: payload.notes ?? undefined,
        createdByUserId: actor.id,
        lines: {
          create: payload.lines.map((line) => ({
            productId: line.productId,
            quantityOrdered: line.quantityOrdered,
            quantityReceived: line.quantityReceived,
            unitCost: line.unitCost,
          })),
        },
      },
      include: { lines: true },
    });

    if (requiresApproval) {
      await tx.approvalRequest.create({
        data: {
          type: "PURCHASE_ORDER",
          title: `Approve purchase order ${created.orderNumber}`,
          entity: `Purchase order ${created.orderNumber}`,
          entityId: created.id,
          requestedByUserId: actor.id,
          status: "PENDING",
          reason: "Purchase order created by a non-approver role.",
          businessImpact: "Releasing this order replenishes inventory; blocking it delays restock.",
        },
      });

      await notifyManagers(
        "Purchase order pending approval",
        `${actor.name} created purchase order ${created.orderNumber} and it is awaiting review.`,
        "/approvals",
        actor.id,
      );
    }

    await tx.notification.create({
      data: {
        userId: actor.id,
        title: "Purchase order created",
        body: `${created.orderNumber} was created${requiresApproval ? " and is awaiting approval" : ""}.`,
        href: "/purchase-orders",
      },
    });

    return created;
  });

  emitToUser(actor.id, "notification:new", { title: "Purchase order created" });
  emitRealtime("purchase-order:created", { id: purchaseOrder.id, orderNumber: purchaseOrder.orderNumber });
  if (requiresApproval) {
    emitRealtime("approval:created", {});
  }
  emitRealtime("dashboard:updated", {});

  return purchaseOrder;
};

export const updatePurchaseOrder = async (id: string, actor: PurchaseOrderActor, input: unknown) => {
  const payload = purchaseOrderSchema.partial().parse(input);
  const existing = await prisma.purchaseOrder.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Purchase order not found");
  }

  const { lines, createdByUserId: _ignored, ...rest } = payload;

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      ...rest,
      supplierId: payload.supplierId === null ? null : payload.supplierId ?? undefined,
      orderedAt: payload.orderedAt === null ? null : payload.orderedAt ?? undefined,
      expectedAt: payload.expectedAt === null ? null : payload.expectedAt ?? undefined,
      receivedAt: payload.receivedAt === null ? null : payload.receivedAt ?? undefined,
      notes: payload.notes === null ? null : payload.notes ?? undefined,
    },
  });

  emitRealtime("purchase-order:updated", { id: updated.id, orderNumber: updated.orderNumber });
  emitRealtime("dashboard:updated", {});

  return updated;
};

export const deletePurchaseOrder = async (id: string) => {
  const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Purchase order not found");
  }

  await prisma.purchaseOrder.delete({ where: { id } });
  emitRealtime("purchase-order:deleted", { id });
  emitRealtime("dashboard:updated", {});
};
