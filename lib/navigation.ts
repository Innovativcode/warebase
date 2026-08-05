import type { ComponentType } from "react";
import { BellSimple, GearSix, HouseSimple, Package, Scan, ShieldCheck, SquaresFour, Truck, Users, Warehouse, Clock } from "@phosphor-icons/react";
import type { Permission } from "@/lib/types";

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
  permission?: Permission | Permission[];
  requireAll?: boolean;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export type NavigationIcon = ComponentType<{
  className?: string;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

export type PageMeta = {
  title: string;
  description: string;
};

const PAGE_META: { path: string; title: string; description: string }[] = [
  { path: "/dashboard", title: "Dashboard", description: "Operational visibility for inventory, purchasing and warehouse control." },
  { path: "/products", title: "Products", description: "Manage the full catalog, reorder thresholds, supplier links, and per-warehouse stock visibility." },
  { path: "/suppliers", title: "Suppliers", description: "Maintain vendor intelligence, ordering points, and procurement relationships." },
  { path: "/inventory", title: "Inventory movements", description: "Audit every stock change across warehouses and products." },
  { path: "/warehouses", title: "Warehouses", description: "Track stock by location, primary fulfillment hubs, and warehouse-level movement flow." },
  { path: "/barcode-scanner", title: "Barcode scanner", description: "Scan a barcode or enter it manually to resolve a product directly from the database." },
  { path: "/projects", title: "Projects", description: "Coordinate delivery work, ownership, and task throughput alongside inventory operations." },
  { path: "/purchase-orders", title: "Purchase Orders", description: "Control replenishment, supplier commitments, and receiving status." },
  { path: "/approvals", title: "Approvals", description: "Review purchase orders, stock moves, and cost changes that need authorization." },
  { path: "/approvals/", title: "Approval detail", description: "Review a single operational request in full context." },
  { path: "/notifications", title: "Notifications", description: "Follow alerts, approvals, and operational updates in one inbox." },
  { path: "/settings", title: "Settings", description: "Configure roles, system controls, and operational policies." },
];

export function getPageMeta(pathname: string): PageMeta {
  const match = PAGE_META.filter(
    (meta) => pathname === meta.path || pathname.startsWith(meta.path),
  ).sort((a, b) => b.path.length - a.path.length)[0];

  return match ?? { title: "WareBase", description: "WareBase workspace" };
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: SquaresFour, permission: "read" }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/products", label: "Products", icon: Package, permission: "read" },
      { href: "/suppliers", label: "Suppliers", icon: Users, permission: "read" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/inventory", label: "Stock overview", icon: HouseSimple, permission: "read" },
      { href: "/warehouses", label: "Warehouses", icon: Warehouse, permission: "read" },
      { href: "/barcode-scanner", label: "Barcode scanner", icon: Scan, permission: "read" },
      { href: "/projects", label: "Activity", icon: Clock, permission: "read" },
    ],
  },
  {
    label: "Purchasing",
    items: [{ href: "/purchase-orders", label: "Purchase orders", icon: Truck, permission: "read" }],
  },
  {
    label: "Governance",
    items: [
      { href: "/approvals", label: "Approvals", icon: ShieldCheck, permission: "approvals:manage" },
      { href: "/notifications", label: "Notifications", icon: BellSimple },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/settings", label: "Settings", icon: GearSix, permission: "users:manage" }],
  },
] as const;
