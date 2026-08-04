"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteConfirmButtonProps = {
  itemName: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  buttonLabel?: string;
  onConfirm: () => void | Promise<void>;
  buttonVariant?: ButtonProps["variant"];
};

export function DeleteConfirmButton({
  itemName,
  title = "Delete record",
  description,
  confirmLabel = "Delete",
  buttonLabel = "Delete",
  onConfirm,
  buttonVariant = "destructive",
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant={buttonVariant} size="sm" onClick={() => setOpen(true)}>
        {buttonLabel}
      </Button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description ?? `Delete ${itemName}? This cannot be undone.`}
        confirmLabel={confirmLabel}
        confirmVariant="destructive"
        onOpenChange={setOpen}
        onConfirm={onConfirm}
      />
    </>
  );
}
