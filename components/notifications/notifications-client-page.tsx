"use client";

import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { NotificationRecord } from "@/lib/types";
import { useNotifications } from "@/hooks/use-notifications";
import notificationsAnimation from "@/assets/lottie/notifications.json";
import { Bell, CheckCheck, CircleAlert, CircleCheckBig, CircleHelp, RefreshCw } from "lucide-react";
import { InlineLoader } from "@/components/loader/warebase-loader";
import { useRealtimeEvent } from "@/hooks/use-realtime";
import { useParams, useRouter } from "next/navigation";
import { workspaceHref } from "@/lib/workspace";
import { useCurrentUser } from "@/hooks/use-current-user";

const iconByTitle = (title: string) => {
  if (/alert|expired|critical|failed/i.test(title)) return CircleAlert;
  if (/complete|success|ready|received|updated/i.test(title)) return CircleCheckBig;
  return CircleHelp;
};

export function NotificationsClientPage() {
  const router = useRouter();
  const params = useParams<{ staffId?: string }>();
  const { data: user } = useCurrentUser();
  const { data, loading, error, refetch } = useNotifications(50);
  const notifications = data?.data?.items ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;

  const staffId = params.staffId ?? user?.data?.publicIdentifier;

  const openNotification = (href?: string | null) => {
    if (!href) return;
    router.push(workspaceHref(staffId, href));
  };

  useRealtimeEvent("notification:new", refetch);
  useRealtimeEvent("approval:decision", refetch);

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

  const notificationColumns: Column<NotificationRecord>[] = [
    {
      key: "title",
      label: "Notification",
      sortable: true,
      render: (notification) => {
        const Icon = iconByTitle(notification.title);
        return (
          <button
            type="button"
            className="flex items-start gap-3 text-left transition-colors hover:text-foreground"
            onClick={async () => {
              await markRead(notification);
              openNotification(notification.href);
            }}
          >
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-border/70 bg-background text-muted-foreground/80">
              <Icon className="h-[18px] w-[18px] stroke-[1.9]" />
            </span>
            <div>
              <div className="font-medium text-foreground">{notification.title}</div>
              <div className="text-xs text-muted-foreground">{notification.body}</div>
            </div>
          </button>
        );
      },
    },
    {
      key: "isRead",
      label: "Status",
      sortable: true,
      render: (notification) => (
        <Badge variant={notification.isRead ? "secondary" : "warning"}>
          {notification.isRead ? "Read" : "Unread"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (notification) => (
        <span className="text-sm text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (notification) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await markRead(notification);
            }}
            disabled={notification.isRead}
          >
            Mark read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              openNotification(notification.href);
            }}
          >
            Open
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeroPanel
        badge="Operational inbox"
        title="Notifications"
        description="Track low stock, approvals, and workflow updates without leaving the workspace."
        note="Unread items stay visible until they are acknowledged."
        animationData={notificationsAnimation}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">{unreadCount} unread</Badge>
            <Button variant="outline" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={markAllRead} disabled={!unreadCount} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoader label="Loading notifications…" />
          ) : error ? (
            <EmptyState title="Unable to load notifications" description={error} icon={<Bell className="h-6 w-6" />} />
          ) : notifications.length ? (
            <DataTable
              data={notifications}
              columns={notificationColumns}
              keyExtractor={(notification) => notification.id}
              emptyMessage="No notifications"
            />
          ) : (
            <EmptyState
              title="No notifications"
              description="Operational updates, alerts, and workflow messages will appear here."
              icon={<Bell className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
