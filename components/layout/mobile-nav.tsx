"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { navigationGroups } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/cn";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WarebaseIcon } from "@/components/brand/warebase-logo";

export function MobileNav() {
  const router = useRouter();
  const { data } = useCurrentUser();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      toast.success("Signed out");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out");
    }
    setLogoutOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="h-[24px] w-[24px] stroke-[2.3]" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/28" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(90vw,360px)] border-r border-border/70 bg-card shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <WarebaseIcon className="h-10 w-10 shrink-0" />
                <div>
                  <p className="font-display text-base font-medium leading-none tracking-tight text-[#151F38]">
                    Ware<span className="font-bold text-[#E8A23D]">Base</span>
                  </p>
                </div>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close navigation">
                  <X className="h-[24px] w-[24px] stroke-[2.1]" />
                </Button>
              </Dialog.Close>
            </div>
            <Separator />
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {navigationGroups.map((group) => (
                <div key={group.label} className="mb-5 space-y-2">
                  <p className="px-3 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] border border-border/70 bg-background text-foreground/80">
                          <item.icon size={22} weight="regular" className="text-foreground/80" />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className="h-[20px] w-[20px] stroke-[2.1] text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="p-4">
              <div className="rounded-[0.9rem] border border-border/70 bg-background p-3">
                <p className="text-sm font-medium text-foreground">{data?.data?.name ?? "Signed in user"}</p>
                <p className="text-xs text-muted-foreground">{data?.data?.email ?? "Workspace member"}</p>
                <Button variant="outline" className="mt-3 w-full" onClick={() => setLogoutOpen(true)}>
                  <LogOut className="h-[20px] w-[20px] stroke-[2.3]" />
                  Sign out
                </Button>
              </div>
            </div>
            <ConfirmDialog
              open={logoutOpen}
              title="Sign out"
              description="You will need to sign in again to continue."
              confirmLabel="Sign out"
              confirmVariant="destructive"
              onOpenChange={setLogoutOpen}
              onConfirm={handleLogout}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
