import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";
import { warehouseSchema } from "./warehouse.schemas";

export const listWarehouses = async () =>
  prisma.warehouse.findMany({
    orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    include: {
      inventoryItems: {
        select: { quantityOnHand: true, availableQty: true, product: { select: { name: true, sku: true } } },
      },
    },
  });

export const getWarehouseById = async (id: string) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
    include: {
      inventoryItems: {
        select: { quantityOnHand: true, availableQty: true, product: { select: { name: true, sku: true } } },
      },
    },
  });

  if (!warehouse) {
    throw new ApiError(404, "Warehouse not found");
  }

  return warehouse;
};

export const createWarehouse = async (input: unknown) => {
  const payload = warehouseSchema.parse(input);
  return prisma.warehouse.create({
    data: {
      code: payload.code,
      name: payload.name,
      location: payload.location ?? undefined,
      isPrimary: payload.isPrimary,
    },
  });
};

export const updateWarehouse = async (id: string, input: unknown) => {
  const payload = warehouseSchema.partial().parse(input);
  const existing = await prisma.warehouse.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Warehouse not found");
  }

  return prisma.warehouse.update({
    where: { id },
    data: {
      ...payload,
      location: payload.location === null ? null : payload.location ?? undefined,
    },
  });
};

export const deleteWarehouse = async (id: string) => {
  const existing = await prisma.warehouse.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Warehouse not found");
  }

  await prisma.warehouse.delete({ where: { id } });
};

