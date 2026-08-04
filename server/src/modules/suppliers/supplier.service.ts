import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";
import { supplierSchema } from "./supplier.schemas";

export const listSuppliers = async () =>
  prisma.supplier.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { purchaseOrders: true } } },
  });

export const getSupplierById = async (id: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { _count: { select: { purchaseOrders: true } } },
  });

  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }

  return supplier;
};

export const createSupplier = async (input: unknown) => {
  const payload = supplierSchema.parse(input);
  return prisma.supplier.create({
    data: {
      code: payload.code,
      name: payload.name,
      email: payload.email ?? undefined,
      phone: payload.phone ?? undefined,
      address: payload.address ?? undefined,
    },
  });
};

export const updateSupplier = async (id: string, input: unknown) => {
  const payload = supplierSchema.partial().parse(input);
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Supplier not found");
  }

  return prisma.supplier.update({
    where: { id },
    data: {
      ...payload,
      email: payload.email === null ? null : payload.email ?? undefined,
      phone: payload.phone === null ? null : payload.phone ?? undefined,
      address: payload.address === null ? null : payload.address ?? undefined,
    },
  });
};

export const deleteSupplier = async (id: string) => {
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Supplier not found");
  }

  await prisma.supplier.delete({ where: { id } });
};

