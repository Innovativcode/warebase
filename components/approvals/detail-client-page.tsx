"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { workspaceHref } from "@/lib/workspace";
import { useApproval } from "@/hooks/use-approval";
import { InlineLoader } from "@/components/loader/warebase-loader";
import approvalAnimation from "@/assets/lottie/approval.json";
import {
  ArrowLeft,
  ArrowRightLeft,
  CircleDashed,
  DollarSign,
  FileText,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

type ApprovalDetailClientPageProps = {
  id: string;
};

const typeIcon = (type: string) => {
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

export function ApprovalDetailClientPage({ id }: ApprovalDetailClientPageProps) {
  const router = useRouter();
  const params = useParams<{ staffId?: string }>();
  const { data, loading, error, refetch } = useApproval(id);
  const approval = data?.data ?? null;
  const [submitting, setSubmitting] = useState<"APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | null>(null);

  const backHref = workspaceHref(params.staffId, "/approvals");

  const handleDecision = async (status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
    if (!approval) return;
    try {
      setSubmitting(status);
      await apiFetch(`/approvals/${approval.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
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
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <>
      <PageHeroPanel
        badge="Governance"
        title={approval ? approval.title : "Approval detail"}
        description={approval ? approval.entity : "Loading approval request"}
        note="Use this page for direct links from the queue or notifications."
        animationData={approvalAnimation}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => router.push(backHref)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to approvals
            </Button>
            <Button variant="outline" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <InlineLoader label="Loading approval request…" />
          </CardContent>
        </Card>
      ) : error ? (
        <EmptyState title="Unable to load approval" description={error} icon={<ShieldCheck className="h-6 w-6" />} />
      ) : approval ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Request details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-[1rem] border border-border bg-background p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-border bg-background text-muted-foreground/80">
                  {(() => {
                    const Icon = typeIcon(approval.type);
                    return <Icon className="h-[22px] w-[22px] stroke-[1.9]" />;
                  })()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{approval.type}</Badge>
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
                      {approval.status}
                    </Badge>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">{approval.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{approval.entity}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1rem] border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Requested by</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{approval.requestedBy?.name ?? "System"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{approval.requestedBy?.email ?? "No email"}</p>
                </div>
                <div className="rounded-[1rem] border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Reviewed by</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{approval.reviewedBy?.name ?? "Pending review"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{approval.reviewedAt ? new Date(approval.reviewedAt).toLocaleString() : "Not reviewed yet"}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1rem] border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Reason</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{approval.reason ?? "No reason provided."}</p>
                </div>
                <div className="rounded-[1rem] border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Business impact</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{approval.businessImpact ?? "No business impact provided."}</p>
                </div>
              </div>

              {approval.reviewerNote ? (
                <div className="rounded-[1rem] border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Reviewer note</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{approval.reviewerNote}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1rem] border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Current state</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  The request is now in a decision workflow. Approval updates are written to the audit log and the requester receives a notification.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => void handleDecision("APPROVED")}
                  disabled={submitting !== null || approval.status !== "PENDING"}
                  className="justify-center gap-2"
                >
                  {submitting === "APPROVED" ? "Approving..." : "Approve"}
                  <Sparkles className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleDecision("CHANGES_REQUESTED")}
                  disabled={submitting !== null || approval.status !== "PENDING"}
                  className="justify-center gap-2"
                >
                  <CircleDashed className="h-4 w-4" />
                  Request changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void handleDecision("REJECTED")}
                  disabled={submitting !== null || approval.status !== "PENDING"}
                  className="justify-center gap-2"
                >
                  {submitting === "REJECTED" ? "Rejecting..." : "Reject"}
                  <TriangleAlert className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState title="Approval not found" description="The requested approval record could not be located." icon={<ShieldCheck className="h-6 w-6" />} />
      )}
    </>
  );
}
