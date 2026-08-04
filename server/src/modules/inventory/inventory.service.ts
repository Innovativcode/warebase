import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import { ApiError } from "@/utils/http";
import { emitRealtime } from "@/realtime";
import { movementSchema } from "./inventory.schemas";

export const listMovements = async () =>
  prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      performedByUser: { select: { id: true, name: true, email: true } },
      sourceWarehouse: { select: { id: true, name: true, code: true } },
      destinationWarehouse: { select: { id: true, name: true, code: true } },
    },
  });

export const createMovement = async (input: unknown, performedByUserId: string) => {
  const payload = movementSchema.parse(input);
  const product = await prisma.product.findUnique({ where: { id: payload.productId } });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (payload.type === "IN" && !payload.destinationWarehouseId) {
    throw new ApiError(400, "destinationWarehouseId is required for inbound stock movements");
  }

  if (payload.type === "OUT" && !payload.sourceWarehouseId) {
    throw new ApiError(400, "sourceWarehouseId is required for outbound stock movements");
  }

  if (payload.type === "TRANSFER" && (!payload.sourceWarehouseId || !payload.destinationWarehouseId)) {
    throw new ApiError(400, "Both sourceWarehouseId and destinationWarehouseId are required for transfers");
  }

  const stockMutation = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const upsertInventory = async (warehouseId: string, delta: number) => {
      const current = await tx.inventoryItem.findUnique({
        where: {
          productId_warehouseId: {
            productId: payload.productId,
            warehouseId,
          },
        },
      });

      if (!current && delta < 0) {
        throw new ApiError(400, "Insufficient stock for the requested warehouse");
      }

      const nextQuantityOnHand = (current?.quantityOnHand ?? 0) + delta;

      if (nextQuantityOnHand < 0) {
        throw new ApiError(400, "Insufficient stock for the requested warehouse");
      }

      return tx.inventoryItem.upsert({
        where: {
          productId_warehouseId: {
            productId: payload.productId,
            warehouseId,
          },
        },
        create: {
          productId: payload.productId,
          warehouseId,
          quantityOnHand: nextQuantityOnHand,
          reservedQty: 0,
          availableQty: nextQuantityOnHand,
        },
        update: {
          quantityOnHand: nextQuantityOnHand,
          availableQty: nextQuantityOnHand - (current?.reservedQty ?? 0),
        },
      });
    };

    if (payload.type === "IN") {
      await upsertInventory(payload.destinationWarehouseId!, payload.quantity);
    }

    if (payload.type === "OUT") {
      await upsertInventory(payload.sourceWarehouseId!, -payload.quantity);
    }

    if (payload.type === "TRANSFER") {
      await upsertInventory(payload.sourceWarehouseId!, -payload.quantity);
      await upsertInventory(payload.destinationWarehouseId!, payload.quantity);
    }

    if (payload.type === "ADJUSTMENT") {
      const warehouseId = payload.destinationWarehouseId ?? payload.sourceWarehouseId;
      if (!warehouseId) {
        throw new ApiError(400, "A warehouse id is required for adjustments");
      }

      const direction = payload.destinationWarehouseId ? 1 : -1;
      await upsertInventory(warehouseId, payload.quantity * direction);
    }

    return tx.stockMovement.create({
      data: {
        productId: payload.productId,
        type: payload.type,
        quantity: payload.quantity,
        reason: payload.reason ?? undefined,
        reference: payload.reference ?? undefined,
        performedByUserId,
        sourceWarehouseId: payload.sourceWarehouseId ?? undefined,
        destinationWarehouseId: payload.destinationWarehouseId ?? undefined,
      },
    });
  });

  emitRealtime("stock:moved", {
    id: stockMutation.id,
    productId: stockMutation.productId,
    type: stockMutation.type,
    quantity: stockMutation.quantity,
  });
  emitRealtime("dashboard:updated", {});

  return stockMutation;
};
