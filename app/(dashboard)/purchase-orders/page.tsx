"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { PurchaseOrdersClientPage } from "@/components/purchase-orders/purchase-orders-client-page";
import { PurchaseOrderDialog } from "@/components/forms/purchase-order-dialog";
import { apiFetch, receivePurchaseOrder } from "@/lib/api";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useProducts } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useRealtimeEvent } from "@/hooks/use-realtime";
import type { PurchaseOrderRecord } from "@/lib/types";

export default function PurchaseOrdersPage() {
  const purchaseOrders = usePurchaseOrders();
  const products = useProducts();
  const suppliers = useSuppliers();
  const [open, setOpen] = useState(false);

  const refresh = useCallback(() => {
    void purchaseOrders.refetch();
  }, [purchaseOrders.refetch]);

  useRealtimeEvent("purchase-order:created", refresh);
  useRealtimeEvent("purchase-order:updated", refresh);
  useRealtimeEvent("purchase-order:deleted", refresh);
  useRealtimeEvent("approval:reviewed", refresh);

  const handleDelete = async (purchaseOrder: PurchaseOrderRecord) => {
    try {
      await apiFetch(`/purchase-orders/${purchaseOrder.id}`, { method: "DELETE" });
      toast.success("Purchase order deleted");
      purchaseOrders.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete purchase order");
    }
  };

  const handleReceive = async (purchaseOrder: PurchaseOrderRecord) => {
    try {
      const result = await receivePurchaseOrder(purchaseOrder.id);
      toast.success(`${result.data.orderNumber} received and stock posted`);
      purchaseOrders.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to receive purchase order");
    }
  };

  return (
    <>
      <PurchaseOrdersClientPage
        purchaseOrders={purchaseOrders.data?.data ?? null}
        loading={purchaseOrders.loading}
        error={purchaseOrders.error}
        onCreate={() => setOpen(true)}
        onDelete={handleDelete}
        onReceive={(purchaseOrder) => void handleReceive(purchaseOrder)}
      />
      <PurchaseOrderDialog
        open={open}
        suppliers={suppliers.data?.data ?? null}
        products={products.data?.data ?? null}
        onOpenChange={setOpen}
        onSaved={purchaseOrders.refetch}
      />
    </>
  );
}
