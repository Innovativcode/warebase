import type { ComponentType } from "react";
import { BellSimple, GearSix, HouseSimple, Package, Scan, ShieldCheck, SquaresFour, Truck, Users, Warehouse, Clock } from "@phosphor-icons/react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIcon;
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

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: SquaresFour }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/products", label: "Products", icon: Package },
      { href: "/suppliers", label: "Suppliers", icon: Users },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/inventory", label: "Stock overview", icon: HouseSimple },
      { href: "/warehouses", label: "Warehouses", icon: Warehouse },
      { href: "/barcode-scanner", label: "Barcode scanner", icon: Scan },
      { href: "/projects", label: "Activity", icon: Clock },
    ],
  },
  {
    label: "Purchasing",
    items: [{ href: "/purchase-orders", label: "Purchase orders", icon: Truck }],
  },
  {
    label: "Governance",
    items: [
      { href: "/approvals", label: "Approvals", icon: ShieldCheck },
      { href: "/notifications", label: "Notifications", icon: BellSimple },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/settings", label: "Settings", icon: GearSix }],
  },
] as const;
