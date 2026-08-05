import type { Permission } from "@/lib/types";

export const PERMISSION_LIST: Array<{ key: Permission; label: string; description: string }> = [
  { key: "read", label: "View Data", description: "Can view products, inventory, and reports" },
  { key: "write", label: "Create & Edit", description: "Can create new records and edit existing ones" },
  { key: "delete", label: "Delete Records", description: "Can remove products, orders, and other data" },
  { key: "approvals:manage", label: "Approve Requests", description: "Can approve purchase orders and stock requests" },
  { key: "users:manage", label: "Manage Team", description: "Can add users, assign roles, and manage access" },
  { key: "audit:read", label: "View Activity Log", description: "Can see the complete history of all actions" },
  { key: "accounting:read", label: "View Accounting", description: "Can view income, expenses, and the ledger" },
  { key: "accounting:manage", label: "Manage Accounting", description: "Can record income and expense transactions" },
];

export const ROLE_ORDER = ["VIEWER", "STAFF", "MANAGER", "ADMIN"] as const;
