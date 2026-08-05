"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SuppliersClientPage } from "@/components/suppliers/suppliers-client-page";
import { SupplierDialog } from "@/components/forms/supplier-dialog";
import { apiFetch } from "@/lib/api";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { SupplierRecord } from "@/lib/types";

export default function SuppliersPage() {
  const suppliers = useSuppliers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRecord | null>(null);

  const handleDelete = async (supplier: SupplierRecord) => {
    try {
      await apiFetch(`/suppliers/${supplier.id}`, { method: "DELETE" });
      toast.success("Supplier deleted");
      suppliers.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete supplier");
    }
  };

  return (
    <>
      <SuppliersClientPage
        suppliers={suppliers.data?.data ?? null}
        loading={suppliers.loading}
        error={suppliers.error}
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
        onEdit={(supplier) => {
          setEditing(supplier);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />
      <SupplierDialog
        open={open}
        mode={editing ? "edit" : "create"}
        supplier={editing}
        onOpenChange={setOpen}
        onSaved={suppliers.refetch}
      />
    </>
  );
}
