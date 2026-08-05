"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ApprovalReviewSheet } from "@/components/approvals/approval-review-sheet";
import { InlineLoader } from "@/components/loader/warebase-loader";
import { apiFetch } from "@/lib/api";
import { workspaceHref } from "@/lib/workspace";
import type { ApprovalRecord } from "@/lib/types";
import { useApprovals } from "@/hooks/use-approvals";
import { useRealtimeEvent } from "@/hooks/use-realtime";
import { useCurrentUser } from "@/hooks/use-current-user";
import approvalAnimation from "@/assets/lottie/approval.json";
import {
  ArrowRightLeft,
  CheckCircle2,
  DollarSign,
  FileText,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  SquareDashedBottomCode,
  TriangleAlert,
} from "lucide-react";

const typeIcon = (type: ApprovalRecord["type"]) => {
  switch (type) {
    case "PURCHASE_ORDER":
      return ShoppingCart;
    case "INVENTORY_ADJUSTMENT":
      return FileText;
    case "STOCK_TRANSFER":
      return ArrowRightLeft;
    case "PRODUCT_COST_CHANGE":
      return DollarSign;
    default:
      return ShieldCheck;
  }
};

const statusIcon = (status: ApprovalRecord["status"]) => {
  switch (status) {
    case "APPROVED":
      return CheckCircle2;
    case "REJECTED":
      return TriangleAlert;
    case "CHANGES_REQUESTED":
      return SquareDashedBottomCode;
    default:
      return ShieldCheck;
  }
};

export function ApprovalsClientPage() {
  const router = useRouter();
  const params = useParams<{ staffId?: string }>();
  const { data: user } = useCurrentUser();
  const { data, loading, error, refetch } = useApprovals();
  const approvals = data?.data ?? [];
  const [selected, setSelected] = useState<ApprovalRecord | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const staffId = params.staffId ?? user?.data?.publicIdentifier;

  useRealtimeEvent("approval:created", refetch);
  useRealtimeEvent("approval:reviewed", refetch);
  useRealtimeEvent("approval:decision", refetch);
  useRealtimeEvent("purchase-order:updated", refetch);

  const counts = useMemo(() => {
    return approvals.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.status] += 1;
        return acc;
      },
      { total: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, CHANGES_REQUESTED: 0 },
    );
  }, [approvals]);

  const openApproval = (approval: ApprovalRecord) => {
    setSelected(approval);
    setSheetOpen(true);
  };

  const handleDecision = async (id: string, status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED", reviewerNote?: string) => {
    try {
      await apiFetch(`/approvals/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, reviewerNote }),
      });
      if (status === "APPROVED") {
        toast.success("Approval approved");
      } else if (status === "REJECTED") {
        toast.warning("Approval rejected");
      } else {
        toast.warning("Changes requested for approval");
      }
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update approval");
    }
  };

  const approvalColumns: Column<ApprovalRecord>[] = [
    {
      key: "title",
      label: "Request",
      sortable: true,
      render: (approval) => {
        const TypeIcon = typeIcon(approval.type);
        return (
          <button
            type="button"
            onClick={() => openApproval(approval)}
            className="flex items-start gap-3 text-left transition-colors hover:text-foreground"
          >
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-border/70 bg-background text-muted-foreground/80">
              <TypeIcon className="h-[18px] w-[18px] stroke-[1.9]" />
            </span>
            <div>
              <div className="font-medium text-foreground">{approval.title}</div>
              <div className="text-xs text-muted-foreground">{approval.entity}</div>
            </div>
          </button>
        );
      },
    },
    {
      key: "requestedBy",
      label: "Requested by",
      sortable: true,
      render: (approval) => (
        <>
          <div className="text-sm text-foreground">{approval.requestedBy?.name ?? "System"}</div>
          <div className="text-xs text-muted-foreground">{approval.requestedBy?.role ?? "Unknown role"}</div>
        </>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (approval) => {
        const StatusIcon = statusIcon(approval.status);
        return (
          <Badge
            variant={
              approval.status === "PENDING"
                ? "warning"
                : approval.status === "APPROVED"
                  ? "success"
                  : approval.status === "REJECTED"
                    ? "danger"
                    : "info"
            }
          >
            <span className="inline-flex items-center gap-1.5">
              <StatusIcon className="h-3.5 w-3.5" />
              {approval.status}
            </span>
          </Badge>
        );
      },
    },
    {
      key: "requestedAt",
      label: "Requested",
      sortable: true,
      render: (approval) => (
        <span className="text-sm text-muted-foreground">{new Date(approval.requestedAt).toLocaleString()}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (approval) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(workspaceHref(staffId, `/approvals/${approval.id}`))}>
            Details
          </Button>
          <Button variant="outline" size="sm" onClick={() => openApproval(approval)}>
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeroPanel
        badge="Governance"
        title="Approval center"
        description="Handle requests that need review before they affect stock, spend, or policy."
        note="Every decision is recorded, not just visually hidden."
        animationData={approvalAnimation}
        action={
          <Button variant="outline" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh queue
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending" value={counts.PENDING} hint="Requests awaiting action" tone="warning" icon={<ShieldCheck className="h-[18px] w-[18px]" />} />
        <StatCard label="Approved" value={counts.APPROVED} hint="Completed decisions" tone="success" icon={<CheckCircle2 className="h-[18px] w-[18px]" />} />
        <StatCard label="Rejected" value={counts.REJECTED} hint="Declined requests" tone="danger" icon={<TriangleAlert className="h-[18px] w-[18px]" />} />
        <StatCard label="Changes requested" value={counts.CHANGES_REQUESTED} hint="Sent back for updates" tone="info" icon={<SquareDashedBottomCode className="h-[18px] w-[18px]" />} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Review queue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoader label="Loading approvals…" />
          ) : error ? (
            <EmptyState title="Unable to load approvals" description={error} icon={<ShieldCheck className="h-6 w-6" />} />
          ) : approvals.length ? (
            <DataTable
              data={approvals}
              columns={approvalColumns}
              keyExtractor={(approval) => approval.id}
              emptyMessage="No approvals waiting"
            />
          ) : (
            <EmptyState
              title="No approvals waiting"
              description="Requests requiring review will appear here as soon as they are created by the workflow."
              icon={<ShieldCheck className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>

      <ApprovalReviewSheet
        approval={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDecision={handleDecision}
      />
    </>
  );
}
