import { prisma } from "@/db/prisma";
import { emitRealtime, emitToUser } from "@/realtime";

const LOW_STOCK_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

type LowStockCandidate = {
  id: string;
  sku: string;
  name: string;
  reorderPoint: number;
  reorderQty: number;
  unit: string;
  totalOnHand: number;
  supplier: { id: string; name: string } | null;
};

export const findLowStockProducts = async (): Promise<LowStockCandidate[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      name: true,
      reorderPoint: true,
      reorderQty: true,
      unit: true,
      supplier: { select: { id: true, name: true } },
      inventoryItems: { select: { quantityOnHand: true } },
    },
  });

  return products
    .map((product) => ({
      ...product,
      totalOnHand: product.inventoryItems.reduce((sum, item) => sum + item.quantityOnHand, 0),
    }))
    .filter((product) => product.totalOnHand <= product.reorderPoint)
    .sort((a, b) => a.totalOnHand - a.reorderPoint - (b.totalOnHand - b.reorderPoint));
};

export const evaluateLowStock = async () => {
  const low = await findLowStockProducts();
  const alerted: string[] = [];

  if (low.length === 0) {
    return { alerted, total: 0 };
  }

  const cutoff = new Date(Date.now() - LOW_STOCK_DEDUPE_WINDOW_MS);

  const managers = await prisma.user.findMany({
    where: { isActive: true, role: { in: ["ADMIN", "MANAGER"] } },
    select: { id: true, name: true },
  });

  for (const product of low) {
    const recent = await prisma.notification.findFirst({
      where: {
        title: { contains: "Low stock" },
        body: { contains: product.name },
        createdAt: { gte: cutoff },
      },
    });

    if (recent) {
      continue;
    }

    alerted.push(product.id);

    for (const manager of managers) {
      await prisma.notification.create({
        data: {
          userId: manager.id,
          title: "Low stock alert",
          body: `${product.name} (${product.sku}) is at ${product.totalOnHand} ${product.unit}(s) — below the reorder point of ${product.reorderPoint}.`,
          href: `/inventory?restock=${product.id}`,
        },
      });
      emitToUser(manager.id, "notification:new", { title: "Low stock alert", productId: product.id });
    }
  }

  if (alerted.length > 0) {
    emitRealtime("stock:low", { productIds: alerted });
    emitRealtime("dashboard:updated", {});
  }

  return { alerted, total: low.length };
};
