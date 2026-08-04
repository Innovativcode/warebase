"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, Box, Plus, ScanBarcode, ShieldCheck } from "lucide-react";
import { navigationGroups } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type CommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const quickActions = [
  { label: "Add product", href: "/products?dialog=create", icon: Box },
  { label: "Create purchase order", href: "/purchase-orders?dialog=create", icon: Plus },
  { label: "Transfer inventory", href: "/inventory?dialog=transfer", icon: ArrowRight },
  { label: "Scan barcode", href: "/barcode-scanner", icon: ScanBarcode },
  { label: "Review approvals", href: "/approvals", icon: ShieldCheck },
  { label: "Open notifications", href: "/notifications", icon: Bell },
] as const;

export function GlobalCommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  const items = useMemo(() => {
    const navItems = navigationGroups.flatMap((group) =>
      group.items.map((item) => ({
        label: item.label,
        href: item.href,
        group: group.label,
        icon: item.icon,
      })),
    );

    const filteredNav = navItems.filter((item) =>
      `${item.label} ${item.group}`.toLowerCase().includes(search.toLowerCase()),
    );
    const filteredQuick = quickActions.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    );

    return { filteredNav, filteredQuick };
  }, [search]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content className="fixed left-1/2 top-[10%] z-50 w-[min(92vw,760px)] -translate-x-1/2 rounded-[1.5rem] border border-border/70 bg-background shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <Command className="overflow-hidden rounded-[1.5rem] bg-transparent">
            <div className="border-b border-border/70 px-4 py-3">
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search products, SKUs, purchase orders, warehouses..."
                className="h-11 w-full rounded-[0.85rem] border border-border/70 bg-background px-4 text-sm tracking-normal outline-none"
              />
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-sm text-muted-foreground">No matching records.</Command.Empty>

              <Command.Group heading="Quick actions" className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.03em] text-muted-foreground">
                {items.filteredQuick.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Command.Item
                      key={action.label}
                      value={action.label}
                      onSelect={() => {
                        window.location.assign(action.href);
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[0.95rem] px-3 py-2.5 text-sm outline-none aria-selected:bg-primary/10",
                      )}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] border border-border/70 bg-background text-foreground/75">
                        <Icon className="h-[20px] w-[20px] stroke-[2.2]" />
                      </span>
                      <span className="flex-1">{action.label}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>

              <Command.Separator className="my-2 h-px bg-border" />

              <Command.Group heading="Navigation" className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.03em] text-muted-foreground">
                {items.filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.href}
                      value={`${item.label} ${item.group}`}
                      onSelect={() => {
                        window.location.assign(item.href);
                        onOpenChange(false);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-[0.95rem] px-3 py-2.5 text-sm outline-none aria-selected:bg-primary/10"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] border border-border/70 bg-background text-foreground/75">
                        <Icon size={20} weight="regular" className="text-foreground/75" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.group}</p>
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
          <Dialog.Close asChild>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3" aria-label="Close command menu">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
