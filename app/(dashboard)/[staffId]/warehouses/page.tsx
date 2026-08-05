"use client";

import { useState } from "react";
import { toast } from "sonner";
import { WarehousesClientPage } from "@/components/warehouses/warehouses-client-page";
import { WarehouseDialog } from "@/components/forms/warehouse-dialog";
import { apiFetch } from "@/lib/api";
import { useWarehouses } from "@/hooks/use-warehouses";
import type { WarehouseRecord } from "@/lib/types";

export default function WarehousesPage() {
  const warehouses = useWarehouses();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseRecord | null>(null);

  const handleDelete = async (warehouse: WarehouseRecord) => {
    try {
      await apiFetch(`/warehouses/${warehouse.id}`, { method: "DELETE" });
      toast.success("Warehouse deleted");
      warehouses.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete warehouse");
    }
  };

  return (
    <>
      <WarehousesClientPage
        warehouses={warehouses.data?.data ?? null}
        loading={warehouses.loading}
        error={warehouses.error}
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
        onEdit={(warehouse) => {
          setEditing(warehouse);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />
      <WarehouseDialog
        open={open}
        mode={editing ? "edit" : "create"}
        warehouse={editing}
        onOpenChange={setOpen}
        onSaved={warehouses.refetch}
      />
    </>
  );
}
