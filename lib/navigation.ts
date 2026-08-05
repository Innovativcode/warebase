import type { ComponentType } from "react";
import { BellSimple, Coins, GearSix, HouseSimple, Package, Scan, ShieldCheck, SquaresFour, Truck, Users, Warehouse, Clock } from "@phosphor-icons/react";
import type { Permission } from "@/lib/types";

export type NavTone =
  | "indigo"
  | "emerald"
  | "violet"
  | "sky"
  | "amber"
  | "teal"
  | "orange"
  | "blue"
  | "rose"
  | "green"
  | "slate";

export const NAV_TONES: Record<NavTone, { icon: string; active: string }> = {
  indigo: { icon: "text-indigo-600", active: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  emerald: { icon: "text-emerald-600", active: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  violet: { icon: "text-violet-600", active: "border-violet-200 bg-violet-50 text-violet-700" },
  sky: { icon: "text-sky-600", active: "border-sky-200 bg-sky-50 text-sky-700" },
  amber: { icon: "text-amber-600", active: "border-amber-200 bg-amber-50 text-amber-700" },
  teal: { icon: "text-teal-600", active: "border-teal-200 bg-teal-50 text-teal-700" },
  orange: { icon: "text-orange-600", active: "border-orange-200 bg-orange-50 text-orange-700" },
  blue: { icon: "text-blue-600", active: "border-blue-200 bg-blue-50 text-blue-700" },
  rose: { icon: "text-rose-600", active: "border-rose-200 bg-rose-50 text-rose-700" },
  green: { icon: "text-green-600", active: "border-green-200 bg-green-50 text-green-700" },
  slate: { icon: "text-slate-600", active: "border-slate-200 bg-slate-100 text-slate-700" },
};

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
  tone: NavTone;
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
  { path: "/accounting", title: "Accounting", description: "Track income, expenses, and cash flow alongside your inventory operations." },
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
    items: [{ href: "/dashboard", label: "Dashboard", icon: SquaresFour, tone: "indigo", permission: "read" }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/products", label: "Products", icon: Package, tone: "emerald", permission: "read" },
      { href: "/suppliers", label: "Suppliers", icon: Users, tone: "violet", permission: "read" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/inventory", label: "Stock overview", icon: HouseSimple, tone: "sky", permission: "read" },
      { href: "/warehouses", label: "Warehouses", icon: Warehouse, tone: "amber", permission: "read" },
      { href: "/barcode-scanner", label: "Barcode scanner", icon: Scan, tone: "teal", permission: "read" },
      { href: "/projects", label: "Activity", icon: Clock, tone: "orange", permission: "read" },
    ],
  },
  {
    label: "Purchasing",
    items: [{ href: "/purchase-orders", label: "Purchase orders", icon: Truck, tone: "blue", permission: "read" }],
  },
  {
    label: "Finance",
    items: [{ href: "/accounting", label: "Accounting", icon: Coins, tone: "green", permission: "accounting:read" }],
  },
  {
    label: "Governance",
    items: [
      { href: "/approvals", label: "Approvals", icon: ShieldCheck, tone: "rose", permission: "approvals:manage" },
      { href: "/notifications", label: "Notifications", icon: BellSimple, tone: "amber" },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/settings", label: "Settings", icon: GearSix, tone: "slate", permission: "users:manage" }],
  },
] as const;
