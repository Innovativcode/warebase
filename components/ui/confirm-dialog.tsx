"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  confirmVariant?: "default" | "destructive";
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onOpenChange,
  onConfirm,
  confirmVariant = "default",
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} description={description} onOpenChange={onOpenChange}>
      <div className="space-y-5">
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant === "destructive" ? "destructive" : "default"}
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
