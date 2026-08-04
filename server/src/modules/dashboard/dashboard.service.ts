import { prisma } from "@/db/prisma";

type DashboardProduct = {
  id: string;
  sku: string;
  name: string;
  reorderPoint: number;
  unit: string;
  inventoryItems: Array<{
    quantityOnHand: number;
    warehouse: { name: string };
  }>;
};

type DashboardMovement = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
  quantity: number;
  reason: string | null;
  createdAt: Date;
  product: { name: string; sku: string };
  sourceWarehouse: { name: string } | null;
  destinationWarehouse: { name: string } | null;
};

type DashboardWarehouse = {
  id: string;
  code: string;
  name: string;
  inventoryItems: Array<{
    quantityOnHand: number;
    availableQty: number;
  }>;
};

export const getDashboardSummary = async (userId?: string) => {
  const [productCount, warehouseCount, supplierCount, activeProjectCount, approvalsPendingCount, notificationsUnreadCount, lowStockProducts, recentMovements, warehouses] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.warehouse.count(),
      prisma.supplier.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.approvalRequest.count({ where: { status: "PENDING" } }),
      userId ? prisma.notification.count({ where: { userId, isRead: false } }) : Promise.resolve(0),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: [{ reorderPoint: "desc" }, { updatedAt: "desc" }],
        take: 10,
        select: {
          id: true,
          sku: true,
          name: true,
          reorderPoint: true,
          unit: true,
          inventoryItems: {
            select: { quantityOnHand: true, warehouse: { select: { name: true } } },
          },
        },
      }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: "desc" },
        take: 14,
        select: {
          id: true,
          type: true,
          quantity: true,
          reason: true,
          createdAt: true,
          product: { select: { name: true, sku: true } },
          sourceWarehouse: { select: { name: true } },
          destinationWarehouse: { select: { name: true } },
        },
      }),
      prisma.warehouse.findMany({
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          code: true,
          name: true,
          inventoryItems: {
            select: {
              quantityOnHand: true,
              availableQty: true,
            },
          },
        },
      }),
    ]);

  const typedLowStockProducts = lowStockProducts as DashboardProduct[];
  const typedRecentMovements = recentMovements as DashboardMovement[];
  const typedWarehouses = warehouses as DashboardWarehouse[];

  const aggregatedLowStock = typedLowStockProducts
    .map((product) => {
      const totalOnHand = product.inventoryItems.reduce((sum: number, item) => sum + item.quantityOnHand, 0);
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
        reorderPoint: product.reorderPoint,
        totalOnHand,
      };
    })
    .filter((product) => product.totalOnHand <= product.reorderPoint)
    .slice(0, 6);

  const movementTrend = typedRecentMovements.reduce<Array<{
    date: string;
    inbound: number;
    outbound: number;
    adjustments: number;
    transfers: number;
  }>>((acc, movement) => {
    const date = movement.createdAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const existing = acc.find((entry) => entry.date === date);
    const bucket = existing ?? { date, inbound: 0, outbound: 0, adjustments: 0, transfers: 0 };
    if (movement.type === "IN") bucket.inbound += movement.quantity;
    if (movement.type === "OUT") bucket.outbound += movement.quantity;
    if (movement.type === "ADJUSTMENT") bucket.adjustments += movement.quantity;
    if (movement.type === "TRANSFER") bucket.transfers += movement.quantity;
    if (!existing) {
      acc.push(bucket);
    }
    return acc;
  }, []).reverse();

  const movementMix = typedRecentMovements.reduce<Record<string, number>>((acc, movement) => {
    acc[movement.type] = (acc[movement.type] ?? 0) + movement.quantity;
    return acc;
  }, {});

  const warehouseStock = typedWarehouses.map((warehouse) => {
    const onHand = warehouse.inventoryItems.reduce((sum: number, item) => sum + item.quantityOnHand, 0);
    const available = warehouse.inventoryItems.reduce((sum: number, item) => sum + item.availableQty, 0);
    return {
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      onHand,
      available,
    };
  });

  return {
    totals: {
      products: productCount,
      warehouses: warehouseCount,
      suppliers: supplierCount,
      activeProjects: activeProjectCount,
    },
    charts: {
      movementTrend,
      movementMix: [
        { type: "IN", value: movementMix.IN ?? 0 },
        { type: "OUT", value: movementMix.OUT ?? 0 },
        { type: "ADJUSTMENT", value: movementMix.ADJUSTMENT ?? 0 },
        { type: "TRANSFER", value: movementMix.TRANSFER ?? 0 },
      ],
      lowStockPressure: aggregatedLowStock.map((product) => ({
        ...product,
        gap: Math.max(product.reorderPoint - product.totalOnHand, 0),
      })),
      warehouseStock,
      governance: {
        approvalsPending: approvalsPendingCount,
        notificationsUnread: notificationsUnreadCount,
      },
    },
    lowStockProducts: aggregatedLowStock,
    recentMovements: typedRecentMovements,
  };
};
