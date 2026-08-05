export type ApiResult<T> = {
  success: boolean;
  data: T;
};

export type DashboardSummary = {
  totals: {
    products: number;
    warehouses: number;
    suppliers: number;
    activeProjects: number;
  };
  charts: {
    movementTrend: Array<{
      date: string;
      inbound: number;
      outbound: number;
      adjustments: number;
      transfers: number;
    }>;
    movementMix: Array<{
      type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
      value: number;
    }>;
    lowStockPressure: Array<{
      id: string;
      sku: string;
      name: string;
      unit: string;
      reorderPoint: number;
      totalOnHand: number;
      gap: number;
    }>;
    warehouseStock: Array<{
      id: string;
      code: string;
      name: string;
      onHand: number;
      available: number;
    }>;
    governance: {
      approvalsPending: number;
      notificationsUnread: number;
    };
  };
  lowStockProducts: Array<{
    id: string;
    sku: string;
    name: string;
    unit: string;
    reorderPoint: number;
    totalOnHand: number;
  }>;
  recentMovements: Array<{
    id: string;
    type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
    quantity: number;
    reason: string | null;
    createdAt: string;
    product: { name: string; sku: string };
    sourceWarehouse: { name: string } | null;
    destinationWarehouse: { name: string } | null;
  }>;
};

export type ProductRecord = {
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
  flaggedAt: string | null;
  flaggedReason: string | null;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  quantityOnHand: number;
  reservedQty: number;
  availableQty: number;
  inventoryItems: Array<{
    quantityOnHand: number;
    availableQty: number;
    warehouse: { id: string; code: string; name: string };
  }>;
};

export type WarehouseRecord = {
  id: string;
  code: string;
  name: string;
  location: string | null;
  isPrimary: boolean;
  inventoryItems: Array<{
    quantityOnHand: number;
    availableQty: number;
    product: { name: string; sku: string };
  }>;
};

export type SupplierRecord = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count: { purchaseOrders: number };
};

export type ProjectRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  owner: { id: string; name: string; email: string } | null;
  _count: { tasks: number };
};

export type PurchaseOrderRecord = {
  id: string;
  orderNumber: string;
  status: string;
  notes: string | null;
  supplier: { id: string; name: string; code: string } | null;
  createdBy: { id: string; name: string; email: string } | null;
  lines: Array<{
    id: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitCost: string;
    product: { id: string; name: string; sku: string };
  }>;
};

export type MovementRecord = {
  id: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdAt: string;
  product: { id: string; name: string; sku: string };
  sourceWarehouse: { id: string; name: string; code: string } | null;
  destinationWarehouse: { id: string; name: string; code: string } | null;
  performedByUser: { id: string; name: string; email: string } | null;
};

export type StockLevelRecord = {
  id: string;
  productId: string;
  warehouseId: string;
  quantityOnHand: number;
  reservedQty: number;
  availableQty: number;
  product: { id: string; sku: string; barcode: string | null; name: string; unit: string; reorderPoint: number; reorderQty: number };
  warehouse: { id: string; code: string; name: string };
};

export type RestockInput = {
  productId: string;
  quantity?: number;
  supplierId?: string | null;
};

export type ReceiveInput = {
  warehouseId?: string | null;
};

export type Permission = "read" | "write" | "delete" | "users:manage" | "approvals:manage" | "audit:read" | "accounting:read" | "accounting:manage";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";
  isActive: boolean;
  isSuperAdmin: boolean;
  avatarUrl: string | null;
  publicIdentifier: string | null;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
};

export type AppSettings = {
  currency: string | null;
};

export type AuditLogRecord = {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
};

export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationSummary = {
  unreadCount: number;
  items: NotificationRecord[];
};

export type ApprovalRecord = {
  id: string;
  type: "PURCHASE_ORDER" | "INVENTORY_ADJUSTMENT" | "STOCK_TRANSFER" | "PRODUCT_COST_CHANGE";
  title: string;
  entity: string;
  entityId: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  reason: string | null;
  businessImpact: string | null;
  reviewerNote: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  requestedBy: { id: string; name: string; email: string; role: string } | null;
  reviewedBy: { id: string; name: string; email: string; role: string } | null;
};

export type TransactionRecord = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  currency: string | null;
  category: string;
  description: string | null;
  reference: string | null;
  occurredAt: string;
  createdAt: string;
};

export type AccountingSummary = {
  currency: string | null;
  totals: {
    income: number;
    expense: number;
    net: number;
    incomeCount: number;
    expenseCount: number;
  };
  recent: TransactionRecord[];
  monthlyTrend: Array<{ month: string; income: number; expense: number }>;
};

export type ActivityType = "SCAN" | "FLAG" | "BLOCK" | "UNBLOCK" | "RESTOCK" | "STOCK_IN" | "STOCK_OUT" | "APPROVAL" | "FINANCE" | "USER" | "SYSTEM";

export type ActivityRecord = {
  id: string;
  type: ActivityType;
  message: string;
  actorName: string | null;
  actorRole: string | null;
  targetType: string | null;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
};

export type TransactionInput = {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description?: string | null;
  reference?: string | null;
  occurredAt?: string | null;
};
