import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";
import { productSchema } from "./product.schemas";
import {
  ensureProductBarcode,
  generateUniqueBarcode,
  isBarcodeMissing,
  normalizeBarcode,
} from "./barcode.service";

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
  imageUrl: string | null;
  flaggedAt: Date | null;
  flaggedReason: string | null;
  businessId: string | null;
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
    select: PRODUCT_LIST_SELECT,
  });

  const raw = products as ProductWithInventory[];

  const withBarcodes = await Promise.all(
    raw.map(async (product) => {
      if (!isBarcodeMissing(product.barcode)) {
        return product;
      }
      const barcode = await ensureProductBarcode(product.id, `${product.id}:${product.sku}`, product.barcode);
      return { ...product, barcode };
    }),
  );

  return withBarcodes.map(aggregateProduct);
};

const PRODUCT_BASE_SELECT = {
  id: true,
  sku: true,
  barcode: true,
  name: true,
  description: true,
  unit: true,
  reorderPoint: true,
  reorderQty: true,
  isActive: true,
  imageUrl: true,
  flaggedAt: true,
  flaggedReason: true,
  businessId: true,
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
} as const;

const PRODUCT_INVENTORY_SELECT = {
  inventoryItems: {
    select: {
      quantityOnHand: true,
      reservedQty: true,
      availableQty: true,
      warehouse: { select: { id: true, name: true, code: true } },
    },
  },
} as const;

const PRODUCT_LIST_SELECT = {
  ...PRODUCT_BASE_SELECT,
  ...PRODUCT_INVENTORY_SELECT,
} as const;

const PRODUCT_DETAIL_SELECT = {
  ...PRODUCT_BASE_SELECT,
  ...PRODUCT_INVENTORY_SELECT,
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
    select: PRODUCT_DETAIL_SELECT,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const raw = product as ProductWithInventory;

  if (isBarcodeMissing(raw.barcode)) {
    const barcode = await ensureProductBarcode(raw.id, `${raw.id}:${raw.sku}`, raw.barcode);
    return aggregateProduct({ ...raw, barcode });
  }

  return aggregateProduct(raw);
};

export const getProductByBarcode = async (barcode: string) => {
  const product = await prisma.product.findFirst({
    where: { barcode },
    select: PRODUCT_DETAIL_SELECT,
  });

  if (!product) {
    throw new ApiError(404, "Product barcode not found");
  }

  return aggregateProduct(product as ProductWithInventory);
};

export const createProduct = async (input: unknown) => {
  const payload = productSchema.parse(input);
  const barcode =
    normalizeBarcode(payload.barcode) ?? (await generateUniqueBarcode(`create:${payload.sku}`));

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
      imageUrl: payload.imageUrl ?? undefined,
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
      barcode: payload.barcode === undefined ? undefined : normalizeBarcode(payload.barcode),
      categoryId: payload.categoryId === null ? null : payload.categoryId ?? undefined,
      supplierId: payload.supplierId === null ? null : payload.supplierId ?? undefined,
      imageUrl: payload.imageUrl === null ? null : payload.imageUrl ?? undefined,
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

export const flagProduct = async (id: string, reason?: string | null) => {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Product not found");
  }

  return prisma.product.update({
    where: { id },
    data: { flaggedAt: new Date(), flaggedReason: reason ?? null },
  });
};

export const blockProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Product not found");
  }

  return prisma.product.update({
    where: { id },
    data: { isActive: false, flaggedAt: new Date(), flaggedReason: "Blocked by operator" },
  });
};

export const unblockProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Product not found");
  }

  return prisma.product.update({
    where: { id },
    data: { isActive: true, flaggedAt: null, flaggedReason: null },
  });
};
