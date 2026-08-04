"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CircleAlert, CircleCheckBig, CircleHelp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { apiFetch } from "@/lib/api";
import { useNotifications } from "@/hooks/use-notifications";
import { useRealtimeEvent } from "@/hooks/use-realtime";
import type { NotificationRecord } from "@/lib/types";

const safeRoutes = new Set([
  "/dashboard",
  "/inventory",
  "/products",
  "/warehouses",
  "/suppliers",
  "/purchase-orders",
  "/projects",
  "/settings",
  "/approvals",
  "/notifications",
]);

const iconByTitle = (title: string) => {
  if (/alert|expired|critical|failed/i.test(title)) return CircleAlert;
  if (/complete|success|ready|received|updated/i.test(title)) return CircleCheckBig;
  return CircleHelp;
};

export function NotificationCenter() {
  const router = useRouter();
  const { data, loading, error, refetch } = useNotifications();
  const [open, setOpen] = useState(false);
  const unreadCount = data?.data?.unreadCount ?? 0;
  const items = data?.data?.items ?? [];

  useRealtimeEvent("notification:new", (payload) => {
    const title = typeof payload === "object" && payload && "title" in payload ? String(payload.title) : "New notification";
    void refetch();
    if (!document.hidden) {
      toast.info(title, { duration: 4000 });
    }
  });

  const markRead = async (notification: NotificationRecord) => {
    if (notification.isRead) return;
    try {
      await apiFetch(`/notifications/${notification.id}/read`, { method: "PATCH" });
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to mark notification as read");
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      toast.success("All notifications marked as read");
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to mark notifications as read");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Notifications"
          className="relative h-12 w-12 border-border/70 bg-background/95 text-muted-foreground/90 shadow-sm"
        >
          <Bell className="h-[20px] w-[20px] stroke-[1.8] text-muted-foreground/65" />
          {unreadCount > 0 ? (
            <span className="absolute right-2 top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-success px-1 text-[0.55rem] font-semibold leading-none text-success-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">Notifications</DropdownMenuLabel>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-medium text-muted-foreground"
            onClick={markAllRead}
            disabled={!unreadCount}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[420px] overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications…
            </div>
          ) : error ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">{error}</div>
          ) : items.length ? (
            items.map((notification) => {
              const Icon = iconByTitle(notification.title);
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[0.9rem] px-3 py-3",
                    notification.isRead ? "opacity-75" : "bg-muted/40",
                  )}
                  onSelect={async (event) => {
                    event.preventDefault();
                    await markRead(notification);
                    const targetHref = notification.href && safeRoutes.has(notification.href) ? notification.href : "/dashboard";
                    if (targetHref) {
                      router.push(targetHref);
                    }
                    setOpen(false);
                  }}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground">
                    <Icon className="h-4 w-4 stroke-[1.9]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{notification.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{notification.body}</span>
                  </span>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="px-3 py-6 text-sm text-muted-foreground">No notifications right now.</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
