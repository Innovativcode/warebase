import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import { ApiError } from "@/utils/http";
import { isApprover } from "@/middleware/permissions";
import { emitRealtime, emitToUser } from "@/realtime";
import { restockSchema, receiveSchema } from "./inventory.schemas";

export type ActorContext = {
  id: string;
  role: string;
  name: string;
};

const nextOrderNumber = () => `PO-${Date.now().toString(36).toUpperCase()}`;

const notifyManagers = async (title: string, body: string, href: string, excludeUserId?: string) => {
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

export const createRestockOrder = async (actor: ActorContext, input: unknown) => {
  const payload = restockSchema.parse(input);

  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
    include: { supplier: { select: { id: true, name: true } } },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const quantity = payload.quantity ?? Math.max(product.reorderQty, product.reorderPoint, 1);

  const latestLine = await prisma.purchaseOrderLine.findFirst({
    where: { productId: product.id },
    orderBy: { createdAt: "desc" },
    select: { unitCost: true },
  });

  const supplierId = payload.supplierId ?? product.supplierId ?? null;
  const orderNumber = nextOrderNumber();

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        status: isApprover(actor.role) ? "SENT" : "DRAFT",
        notes: `Automatic restock of ${product.name}.`,
        createdByUserId: actor.id,
        lines: {
          create: [
            {
              productId: product.id,
              quantityOrdered: quantity,
              quantityReceived: 0,
              unitCost: latestLine?.unitCost ?? 0,
            },
          ],
        },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        lines: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    });

    if (!isApprover(actor.role)) {
      await tx.approvalRequest.create({
        data: {
          type: "PURCHASE_ORDER",
          title: `Restock ${product.name}`,
          entity: `Purchase order ${created.orderNumber}`,
          entityId: created.id,
          requestedByUserId: actor.id,
          status: "PENDING",
          reason: `Triggered while ${product.name} was at or below its reorder point (${product.reorderPoint}).`,
          businessImpact: `Prevents a stock-out of ${product.name}.`,
        },
      });

      await notifyManagers(
        "Restock approval requested",
        `${actor.name} requested a restock of ${product.name} (${quantity} units). Review ${created.orderNumber}.`,
        "/approvals",
      );
    }

    await tx.notification.create({
      data: {
        userId: actor.id,
        title: "Restock order created",
        body: `${created.orderNumber} for ${product.name} (${quantity} units) was created${isApprover(actor.role) ? " and sent to the supplier" : " and is awaiting approval"}.`,
        href: "/purchase-orders",
      },
    });

    return created;
  });

  emitToUser(actor.id, "notification:new", { title: "Restock order created" });
  emitRealtime("purchase-order:created", { id: order.id, orderNumber });
  emitRealtime("approval:created", {});
  emitRealtime("dashboard:updated", {});

  return order;
};

export const receivePurchaseOrder = async (id: string, actor: ActorContext, input: unknown) => {
  const payload = receiveSchema.parse(input);

  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { lines: { include: { product: { select: { id: true, sku: true, name: true } } } } },
  });

  if (!order) {
    throw new ApiError(404, "Purchase order not found");
  }

  if (order.status !== "SENT" && order.status !== "PARTIALLY_RECEIVED") {
    throw new ApiError(409, "Only sent purchase orders can be received");
  }

  if (order.lines.length === 0) {
    throw new ApiError(400, "Purchase order has no lines to receive");
  }

  const warehouse = payload.warehouseId
    ? await prisma.warehouse.findUnique({ where: { id: payload.warehouseId } })
    : await prisma.warehouse.findFirst({ where: { isPrimary: true } });

  if (!warehouse) {
    throw new ApiError(400, "No warehouse specified and no primary warehouse is configured");
  }

  const receivedAt = new Date();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const line of order.lines) {
      const outstanding = line.quantityOrdered - line.quantityReceived;
      if (outstanding <= 0) {
        continue;
      }

      const current = await tx.inventoryItem.findUnique({
        where: {
          productId_warehouseId: { productId: line.productId, warehouseId: warehouse.id },
        },
      });

      const nextQuantityOnHand = (current?.quantityOnHand ?? 0) + outstanding;

      await tx.inventoryItem.upsert({
        where: {
          productId_warehouseId: { productId: line.productId, warehouseId: warehouse.id },
        },
        create: {
          productId: line.productId,
          warehouseId: warehouse.id,
          quantityOnHand: nextQuantityOnHand,
          reservedQty: 0,
          availableQty: nextQuantityOnHand,
        },
        update: {
          quantityOnHand: nextQuantityOnHand,
          availableQty: nextQuantityOnHand - (current?.reservedQty ?? 0),
        },
      });

      await tx.stockMovement.create({
        data: {
          productId: line.productId,
          type: "IN",
          quantity: outstanding,
          reason: `Received from purchase order ${order.orderNumber}`,
          reference: order.orderNumber,
          performedByUserId: actor.id,
          destinationWarehouseId: warehouse.id,
        },
      });

      await tx.purchaseOrderLine.update({
        where: { id: line.id },
        data: { quantityReceived: line.quantityOrdered },
      });
    }

    await tx.purchaseOrder.update({
      where: { id },
      data: { status: "RECEIVED", receivedAt },
    });
  });

  emitRealtime("stock:moved", { orderId: id });
  emitRealtime("purchase-order:updated", { id });
  emitRealtime("dashboard:updated", {});

  const updated = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { lines: true, supplier: { select: { id: true, name: true } } },
  });

  if (!updated) {
    throw new ApiError(404, "Purchase order not found");
  }

  return updated;
};

export const listStockLevels = async () =>
  prisma.inventoryItem.findMany({
    orderBy: [{ warehouseId: "asc" }, { productId: "asc" }],
    include: {
      product: { select: { id: true, sku: true, barcode: true, name: true, unit: true, reorderPoint: true, reorderQty: true } },
      warehouse: { select: { id: true, code: true, name: true } },
    },
  });
