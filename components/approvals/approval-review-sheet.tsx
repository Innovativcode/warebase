"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft, DollarSign, FileText, ShoppingCart, ShieldCheck, Sparkles } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApprovalRecord } from "@/lib/types";

const reviewSchema = z.object({
  reviewerNote: z.string().trim().max(500).optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

type ApprovalReviewSheetProps = {
  approval: ApprovalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecision: (id: string, status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED", reviewerNote?: string) => Promise<void>;
};

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

export function ApprovalReviewSheet({ approval, open, onOpenChange, onDecision }: ApprovalReviewSheetProps) {
  const [submitting, setSubmitting] = useState<ApprovalRecord["status"] | null>(null);
  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      reviewerNote: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ reviewerNote: approval?.reviewerNote ?? "" });
    }
  }, [approval?.id, open, form]);

  const reviewTitle = useMemo(() => {
    if (!approval) return "";
    return approval.type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }, [approval]);

  const submitDecision = async (status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
    if (!approval) return;
    const values = form.getValues();
    const note = values.reviewerNote?.trim();

    if (status !== "APPROVED" && !note) {
      form.setError("reviewerNote", { message: "Add a note before sending this decision." });
      return;
    }

    try {
      setSubmitting(status);
      await onDecision(approval.id, status, note || undefined);
      onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  };

  const Icon = approval ? typeIcon(approval.type) : ShieldCheck;

  return (
    <Sheet
      open={open}
      title={approval ? approval.title : "Approval review"}
      description={approval ? `Review ${reviewTitle.toLowerCase()} request and decide the next step.` : "Select a request to inspect its details."}
      onOpenChange={onOpenChange}
    >
      {approval ? (
        <div className="space-y-6">
          <div className="rounded-[1rem] border border-border bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(0_0%_100%)_78%,hsl(265_45%_99%)_100%)] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-border bg-background text-muted-foreground/80">
                <Icon className="h-[22px] w-[22px] stroke-[1.9]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-border bg-background text-[0.65rem] text-muted-foreground">
                    {approval.type}
                  </Badge>
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
                <p className="mt-2 text-sm font-medium text-foreground">{approval.entity}</p>
                <p className="mt-1 text-sm text-muted-foreground">{approval.reason ?? "No reason provided."}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1rem] border border-border bg-background p-4">
              <Label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Requested by</Label>
              <p className="mt-2 text-sm font-medium text-foreground">{approval.requestedBy?.name ?? "System"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{approval.requestedBy?.email ?? "No email"}</p>
            </div>
            <div className="rounded-[1rem] border border-border bg-background p-4">
              <Label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Requested at</Label>
              <p className="mt-2 text-sm font-medium text-foreground">{new Date(approval.requestedAt).toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">{approval.businessImpact ?? "No business impact noted."}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="reviewerNote">Reviewer note</Label>
            <Textarea
              id="reviewerNote"
              {...form.register("reviewerNote")}
              placeholder="Add context for the requester and audit trail"
              className="min-h-[120px]"
            />
            {form.formState.errors.reviewerNote ? (
              <p className="text-sm text-destructive">{form.formState.errors.reviewerNote.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="justify-center">
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => void submitDecision("CHANGES_REQUESTED")}
              disabled={submitting !== null}
              className="justify-center"
            >
              {submitting === "CHANGES_REQUESTED" ? "Sending..." : "Request changes"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void submitDecision("REJECTED")}
              disabled={submitting !== null}
              className="justify-center"
            >
              {submitting === "REJECTED" ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              onClick={() => void submitDecision("APPROVED")}
              disabled={submitting !== null}
              className="justify-center"
            >
              {submitting === "APPROVED" ? "Approving..." : "Approve"}
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}
