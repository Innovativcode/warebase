import bcrypt from "bcryptjs";
import { PrismaClient, ProjectStatus, PurchaseOrderStatus, StockMovementType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// Check environment - only seed in development or staging
const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv === "production") {
  console.log("Skipping seed in production environment.");
  process.exit(0);
}

const adminPassword = "Admin#2026!";
const managerPassword = "Manager#2026!";
const staffPassword = "Staff#2026!";

async function main() {
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const managerHash = await bcrypt.hash(managerPassword, 12);
  const staffHash = await bcrypt.hash(staffPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@inventory.local" },
    update: {
      name: "Amina Okafor",
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      name: "Amina Okafor",
      email: "admin@inventory.local",
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      isActive: true,
      publicIdentifier: "admin-amin",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@inventory.local" },
    update: {
      name: "Daniel Mensah",
      passwordHash: managerHash,
      role: UserRole.MANAGER,
      isActive: true,
    },
    create: {
      name: "Daniel Mensah",
      email: "manager@inventory.local",
      passwordHash: managerHash,
      role: UserRole.MANAGER,
      isActive: true,
      publicIdentifier: "manager-daniel",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@inventory.local" },
    update: {
      name: "Grace Bello",
      passwordHash: staffHash,
      role: UserRole.STAFF,
      isActive: true,
    },
    create: {
      name: "Grace Bello",
      email: "staff@inventory.local",
      passwordHash: staffHash,
      role: UserRole.STAFF,
      isActive: true,
      publicIdentifier: "staff-grace",
    },
  });

  await prisma.approvalRequest.deleteMany();
  await prisma.approvalRequest.createMany({
    data: [
      {
        type: "PURCHASE_ORDER",
        title: "Approve PO for industrial packaging",
        entity: "Purchase order PO-2026-001",
        entityId: "PO-2026-001",
        requestedByUserId: manager.id,
        status: "PENDING",
        reason: "Order exceeds the standard purchasing threshold.",
        businessImpact: "Delays replenishment unless approved today.",
      },
      {
        type: "INVENTORY_ADJUSTMENT",
        title: "Approve warehouse count variance",
        entity: "Adjustment for Lagos Central Warehouse",
        entityId: "ADJ-2026-004",
        requestedByUserId: staff.id,
        status: "PENDING",
        reason: "Cycle count found a variance on packing tape.",
        businessImpact: "Will update stock ledger after approval.",
      },
      {
        type: "STOCK_TRANSFER",
        title: "Approve transfer to Abuja dispatch",
        entity: "Transfer TRF-2026-008",
        entityId: "TRF-2026-008",
        requestedByUserId: manager.id,
        status: "PENDING",
        reason: "Stock must move to support same-day dispatch.",
        businessImpact: "Frees inventory in Lagos and raises available stock in Abuja.",
      },
      {
        type: "PRODUCT_COST_CHANGE",
        title: "Approve cost change for safety vest",
        entity: "Product SAFE-VEST-101",
        entityId: "SAFE-VEST-101",
        requestedByUserId: admin.id,
        status: "PENDING",
        reason: "Supplier updated the price after freight changes.",
        businessImpact: "Updates product cost used in procurement decisions.",
      },
    ],
  });

  await prisma.notification.deleteMany();
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "Low stock alert",
        body: "Industrial Packing Tape is below the reorder point in Lagos Central Warehouse.",
        href: "/inventory",
        isRead: false,
      },
      {
        userId: admin.id,
        title: "Purchase order received",
        body: "PO-2026-001 has a partial receipt waiting for review.",
        href: "/purchase-orders",
        isRead: false,
      },
      {
        userId: manager.id,
        title: "Approval pending",
        body: "A stock transfer needs review in the approval center.",
        href: "/approvals",
        isRead: false,
      },
      {
        userId: staff.id,
        title: "Inventory review assigned",
        body: "A count variance needs your attention in the inventory ledger.",
        href: "/inventory",
        isRead: false,
      },
    ],
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Packaging" },
      update: {},
      create: { name: "Packaging" },
    }),
    prisma.category.upsert({
      where: { name: "Office Supplies" },
      update: {},
      create: { name: "Office Supplies" },
    }),
    prisma.category.upsert({
      where: { name: "Safety Gear" },
      update: {},
      create: { name: "Safety Gear" },
    }),
  ]);

  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { code: "SUP-ALPHA" },
      update: {
        name: "Alpha Industrial Supply",
        email: "orders@alpha-industrial.test",
        phone: "+234-800-111-2200",
        address: "12 Industrial Road, Lagos",
      },
      create: {
        code: "SUP-ALPHA",
        name: "Alpha Industrial Supply",
        email: "orders@alpha-industrial.test",
        phone: "+234-800-111-2200",
        address: "12 Industrial Road, Lagos",
      },
    }),
    prisma.supplier.upsert({
      where: { code: "SUP-BETA" },
      update: {
        name: "Beta Office Mart",
        email: "procurement@beta-office.test",
        phone: "+234-800-111-3300",
        address: "44 Corporate Avenue, Abuja",
      },
      create: {
        code: "SUP-BETA",
        name: "Beta Office Mart",
        email: "procurement@beta-office.test",
        phone: "+234-800-111-3300",
        address: "44 Corporate Avenue, Abuja",
      },
    }),
    prisma.supplier.upsert({
      where: { code: "SUP-GUARD" },
      update: {
        name: "Guardian Safety Works",
        email: "sales@guardian-safety.test",
        phone: "+234-800-111-4400",
        address: "8 Safety Street, Port Harcourt",
      },
      create: {
        code: "SUP-GUARD",
        name: "Guardian Safety Works",
        email: "sales@guardian-safety.test",
        phone: "+234-800-111-4400",
        address: "8 Safety Street, Port Harcourt",
      },
    }),
  ]);

  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { code: "WH-LOS" },
      update: {
        name: "Lagos Central Warehouse",
        location: "Ikeja, Lagos",
        isPrimary: true,
      },
      create: {
        code: "WH-LOS",
        name: "Lagos Central Warehouse",
        location: "Ikeja, Lagos",
        isPrimary: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { code: "WH-ABJ" },
      update: {
        name: "Abuja Dispatch Hub",
        location: "Maitama, Abuja",
        isPrimary: false,
      },
      create: {
        code: "WH-ABJ",
        name: "Abuja Dispatch Hub",
        location: "Maitama, Abuja",
        isPrimary: false,
      },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: "PKG-BOX-001" },
      update: {
        name: "Corrugated Box Small",
        description: "Small reinforced carton for outbound packing.",
        barcode: "6281000000013",
        unit: "pcs",
        reorderPoint: 80,
        reorderQty: 400,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        isActive: true,
      },
      create: {
        sku: "PKG-BOX-001",
        name: "Corrugated Box Small",
        description: "Small reinforced carton for outbound packing.",
        barcode: "6281000000013",
        unit: "pcs",
        reorderPoint: 80,
        reorderQty: 400,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: "OFF-PEN-010" },
      update: {
        name: "Executive Ballpoint Pen",
        description: "Blue ink pens for office use and dispatch documentation.",
        barcode: "6281000000020",
        unit: "pcs",
        reorderPoint: 50,
        reorderQty: 200,
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
        isActive: true,
      },
      create: {
        sku: "OFF-PEN-010",
        name: "Executive Ballpoint Pen",
        description: "Blue ink pens for office use and dispatch documentation.",
        barcode: "6281000000020",
        unit: "pcs",
        reorderPoint: 50,
        reorderQty: 200,
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: "SAFE-VEST-101" },
      update: {
        name: "Reflective Safety Vest",
        description: "High visibility vest for warehouse and field operations.",
        barcode: "6281000000037",
        unit: "pcs",
        reorderPoint: 30,
        reorderQty: 120,
        categoryId: categories[2].id,
        supplierId: suppliers[2].id,
        isActive: true,
      },
      create: {
        sku: "SAFE-VEST-101",
        name: "Reflective Safety Vest",
        description: "High visibility vest for warehouse and field operations.",
        barcode: "6281000000037",
        unit: "pcs",
        reorderPoint: 30,
        reorderQty: 120,
        categoryId: categories[2].id,
        supplierId: suppliers[2].id,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: "PKG-TAPE-002" },
      update: {
        name: "Industrial Packing Tape",
        description: "Heavy duty brown packing tape.",
        barcode: "6281000000044",
        unit: "rolls",
        reorderPoint: 60,
        reorderQty: 300,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        isActive: true,
      },
      create: {
        sku: "PKG-TAPE-002",
        name: "Industrial Packing Tape",
        description: "Heavy duty brown packing tape.",
        barcode: "6281000000044",
        unit: "rolls",
        reorderPoint: 60,
        reorderQty: 300,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        isActive: true,
      },
    }),
  ]);

  const inventorySeed = [
    { productId: products[0].id, warehouseId: warehouses[0].id, quantityOnHand: 180, reservedQty: 18 },
    { productId: products[1].id, warehouseId: warehouses[0].id, quantityOnHand: 46, reservedQty: 4 },
    { productId: products[2].id, warehouseId: warehouses[0].id, quantityOnHand: 22, reservedQty: 2 },
    { productId: products[3].id, warehouseId: warehouses[0].id, quantityOnHand: 95, reservedQty: 12 },
    { productId: products[0].id, warehouseId: warehouses[1].id, quantityOnHand: 60, reservedQty: 6 },
    { productId: products[2].id, warehouseId: warehouses[1].id, quantityOnHand: 14, reservedQty: 0 },
  ];

  for (const item of inventorySeed) {
    await prisma.inventoryItem.upsert({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: item.warehouseId,
        },
      },
      update: {
        quantityOnHand: item.quantityOnHand,
        reservedQty: item.reservedQty,
        availableQty: item.quantityOnHand - item.reservedQty,
      },
      create: {
        productId: item.productId,
        warehouseId: item.warehouseId,
        quantityOnHand: item.quantityOnHand,
        reservedQty: item.reservedQty,
        availableQty: item.quantityOnHand - item.reservedQty,
      },
    });
  }

  const activeProject = await prisma.project.upsert({
    where: { code: "PRJ-ONBOARD-01" },
    update: {
      name: "Warehouse Rollout Q3",
      description: "Roll out stock rebalancing and onboarding across the two main warehouses.",
      status: ProjectStatus.ACTIVE,
      ownerUserId: admin.id,
    },
    create: {
      code: "PRJ-ONBOARD-01",
      name: "Warehouse Rollout Q3",
      description: "Roll out stock rebalancing and onboarding across the two main warehouses.",
      status: ProjectStatus.ACTIVE,
      ownerUserId: admin.id,
    },
  });

  await prisma.projectTask.upsert({
    where: { id: "seed-task-1" },
    update: {
      title: "Confirm stock thresholds",
      description: "Validate reorder points for packaging and safety gear.",
      projectId: activeProject.id,
      status: "doing",
      priority: "high",
      assigneeId: manager.id,
      sortOrder: 1,
    },
    create: {
      id: "seed-task-1",
      title: "Confirm stock thresholds",
      description: "Validate reorder points for packaging and safety gear.",
      projectId: activeProject.id,
      status: "doing",
      priority: "high",
      assigneeId: manager.id,
      sortOrder: 1,
    },
  });

  await prisma.projectTask.upsert({
    where: { id: "seed-task-2" },
    update: {
      title: "Dispatch receiving checklist",
      description: "Prepare transfer checklist for Abuja dispatch hub.",
      projectId: activeProject.id,
      status: "todo",
      priority: "medium",
      assigneeId: staff.id,
      sortOrder: 2,
    },
    create: {
      id: "seed-task-2",
      title: "Dispatch receiving checklist",
      description: "Prepare transfer checklist for Abuja dispatch hub.",
      projectId: activeProject.id,
      status: "todo",
      priority: "medium",
      assigneeId: staff.id,
      sortOrder: 2,
    },
  });

  const po = await prisma.purchaseOrder.upsert({
    where: { orderNumber: "PO-2026-0001" },
    update: {
      supplierId: suppliers[0].id,
      status: PurchaseOrderStatus.SENT,
      notes: "Priority restock for packaging materials.",
      createdByUserId: admin.id,
    },
    create: {
      orderNumber: "PO-2026-0001",
      supplierId: suppliers[0].id,
      status: PurchaseOrderStatus.SENT,
      notes: "Priority restock for packaging materials.",
      createdByUserId: admin.id,
    },
  });

  const existingLines = await prisma.purchaseOrderLine.findMany({
    where: { purchaseOrderId: po.id },
  });
  if (!existingLines.length) {
    await prisma.purchaseOrderLine.createMany({
      data: [
        {
          purchaseOrderId: po.id,
          productId: products[0].id,
          quantityOrdered: 400,
          quantityReceived: 120,
          unitCost: 18.5,
        },
        {
          purchaseOrderId: po.id,
          productId: products[3].id,
          quantityOrdered: 300,
          quantityReceived: 100,
          unitCost: 7.25,
        },
      ],
    });
  }

  await prisma.stockMovement.createMany({
    data: [
      {
        type: StockMovementType.IN,
        quantity: 120,
        reason: "Initial packaging stock",
        reference: "SEED-INIT-001",
        productId: products[0].id,
        performedByUserId: admin.id,
        destinationWarehouseId: warehouses[0].id,
      },
      {
        type: StockMovementType.OUT,
        quantity: 14,
        reason: "Office supply issue",
        reference: "SEED-OUT-001",
        productId: products[1].id,
        performedByUserId: staff.id,
        sourceWarehouseId: warehouses[0].id,
      },
      {
        type: StockMovementType.TRANSFER,
        quantity: 10,
        reason: "Rebalance between hubs",
        reference: "SEED-TRF-001",
        productId: products[2].id,
        performedByUserId: manager.id,
        sourceWarehouseId: warehouses[0].id,
        destinationWarehouseId: warehouses[1].id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "seed",
        entity: "user",
        entityId: admin.id,
        metadata: { email: admin.email, role: admin.role },
      },
      {
        actorId: admin.id,
        action: "seed",
        entity: "warehouse",
        entityId: warehouses[0].id,
        metadata: { code: warehouses[0].code },
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete.");
  console.log("App login credentials:");
  console.log("admin@inventory.local / Admin#2026!");
  console.log("manager@inventory.local / Manager#2026!");
  console.log("staff@inventory.local / Staff#2026!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
