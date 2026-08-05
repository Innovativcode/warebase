"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronsLeft, ChevronsRight, LogOut, User2 } from "lucide-react";
import { toast } from "sonner";
import { navigationGroups, NAV_TONES } from "@/lib/navigation";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/hooks/use-current-user";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WarebaseIcon } from "@/components/brand/warebase-logo";

const COLLAPSED_KEY = "inventory.sidebar.collapsed";

const TONES = NAV_TONES;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(COLLAPSED_KEY);
    setCollapsed(saved === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      toast.success("Signed out");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out");
    }
    setLogoutOpen(false);
    router.push("/login");
  };

  const userPermissions = data?.data?.permissions || [];

  const hasPermission = (item: { permission?: string | string[]; requireAll?: boolean }) => {
    if (!item.permission) return true;
    
    const permissions = Array.isArray(item.permission) ? item.permission : [item.permission];
    
    return item.requireAll
      ? permissions.every((p) => userPermissions.includes(p as any))
      : permissions.some((p) => userPermissions.includes(p as any));
  };

  return (
    <aside
      className={cn(
        "sticky top-4 hidden h-[calc(100vh-2rem)] overflow-hidden lg:block",
        collapsed ? "w-[92px]" : "w-[304px]",
      )}
    >
      <div className="surface-gradient flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/70 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
        <div className={cn("flex items-center gap-3 px-4 py-4", collapsed && "flex-col items-center")}>
          <WarebaseIcon className={cn("h-11 w-11 shrink-0", collapsed && "h-12 w-12")} />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="font-display text-[1.05rem] font-medium leading-tight tracking-tight text-[#151F38]">
                Ware<span className="font-bold text-[#E8A23D]">Base</span>
              </p>
            </div>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0 border border-border/70 bg-background text-foreground shadow-none hover:bg-muted"
            onClick={toggleCollapsed}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronsRight className="h-[24px] w-[24px] stroke-[2.1] text-foreground/80" /> : <ChevronsLeft className="h-[24px] w-[24px] stroke-[2.1] text-foreground/80" />}
          </Button>
        </div>

        <Separator className="bg-border/60" />

        <div className={cn("vertical-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3", collapsed && "px-2")}>
          <nav className="space-y-4">
            {navigationGroups.map((group) => {
              const visibleItems = group.items.filter(hasPermission);
              
              if (visibleItems.length === 0) return null;
              
              return (
                <div key={group.label} className="space-y-2">
                  {!collapsed ? (
                    <p className="px-3 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {group.label}
                    </p>
                  ) : null}
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const tone = TONES[item.tone];
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "group flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium tracking-normal transition-colors",
                            active
                              ? "border border-border/70 bg-background text-foreground shadow-none"
                              : "text-muted-foreground/80 hover:bg-muted hover:text-foreground",
                            collapsed && "justify-center px-2",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-[0.85rem] border transition-colors",
                              active
                                ? cn("shadow-none", tone.active)
                                : "border-border/70 bg-background group-hover:bg-muted/60",
                            )}
                          >
                            <Icon size={22} weight={active ? "fill" : "regular"} className={cn(active ? "" : cn(tone.icon, "group-hover:text-foreground/85"))} />
                          </span>
                          {!collapsed ? <span className="flex-1">{item.label}</span> : null}
                          {!collapsed ? (
                            <ChevronRight className={cn("h-[20px] w-[20px] stroke-[2.1] transition-transform", active ? "text-foreground/70" : "opacity-0 group-hover:opacity-100 text-muted-foreground")} />
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <Separator className="bg-border/60" />

        <div className={cn("p-3", collapsed && "px-2")}>
              <div className="rounded-[1rem] border border-border/70 bg-background/95 p-3">
                <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-foreground/80 shadow-none">
                <User2 className="h-[20px] w-[20px] stroke-[2.1]" />
                  </div>
              {!collapsed ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {data?.data?.name ?? "Signed in user"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{data?.data?.email ?? "Workspace member"}</p>
                </div>
              ) : null}
            </div>
            {!collapsed ? (
              <div className="mt-3 flex items-center gap-2">
                <Button variant="ghost" className="flex-1 border border-border/70 bg-background shadow-none hover:bg-muted" onClick={() => setLogoutOpen(true)}>
                  <LogOut className="h-[20px] w-[20px] stroke-[2.3]" />
                  Sign out
                </Button>
              </div>
            ) : null}
          </div>
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
    </aside>
  );
}
