import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";
import { productSchema } from "./product.schemas";
import { generateUniqueBarcode } from "./barcode.service";

type ProductWithInventory = {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  unit: string;
  reorderPoint: number;
  reorderQty: number;
  isActive: boolean;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  inventoryItems: Array<{
    quantityOnHand: number;
    reservedQty: number;
    availableQty: number;
    warehouse: { id: string; name: string; code: string };
  }>;
};

export const listProducts = async () => {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: PRODUCT_INCLUDE,
  });

  return (products as ProductWithInventory[]).map(aggregateProduct);
};

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  inventoryItems: {
    select: {
      quantityOnHand: true,
      reservedQty: true,
      availableQty: true,
      warehouse: { select: { id: true, name: true, code: true } },
    },
  },
} as const;

const aggregateProduct = (product: ProductWithInventory) => {
  const quantityOnHand = product.inventoryItems.reduce((sum, item) => sum + item.quantityOnHand, 0);
  const reservedQty = product.inventoryItems.reduce((sum, item) => sum + item.reservedQty, 0);
  const availableQty = product.inventoryItems.reduce((sum, item) => sum + item.availableQty, 0);

  return {
    ...product,
    quantityOnHand,
    reservedQty,
    availableQty,
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: PRODUCT_INCLUDE,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return aggregateProduct(product as ProductWithInventory);
};

export const getProductByBarcode = async (barcode: string) => {
  const product = await prisma.product.findFirst({
    where: { barcode },
    include: PRODUCT_INCLUDE,
  });

  if (!product) {
    throw new ApiError(404, "Product barcode not found");
  }

  return aggregateProduct(product as ProductWithInventory);
};

export const createProduct = async (input: unknown) => {
  const payload = productSchema.parse(input);
  const barcode = payload.barcode ?? (await generateUniqueBarcode(`create:${payload.sku}`));

  return prisma.product.create({
    data: {
      sku: payload.sku,
      barcode,
      name: payload.name,
      description: payload.description ?? undefined,
      unit: payload.unit,
      reorderPoint: payload.reorderPoint,
      reorderQty: payload.reorderQty,
      categoryId: payload.categoryId ?? undefined,
      supplierId: payload.supplierId ?? undefined,
      isActive: payload.isActive,
    },
  });
};

export const updateProduct = async (id: string, input: unknown) => {
  const payload = productSchema.partial().parse(input);
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Product not found");
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...payload,
      description: payload.description === null ? null : payload.description ?? undefined,
      barcode: payload.barcode === null ? null : payload.barcode ?? undefined,
      categoryId: payload.categoryId === null ? null : payload.categoryId ?? undefined,
      supplierId: payload.supplierId === null ? null : payload.supplierId ?? undefined,
    },
  });
};

export const deleteProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Product not found");
  }

  await prisma.product.delete({ where: { id } });
};
