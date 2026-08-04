"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { InventoryClientPage } from "@/components/inventory/inventory-client-page";
import { MovementDialog } from "@/components/forms/movement-dialog";
import { useMovements } from "@/hooks/use-movements";
import { useProducts } from "@/hooks/use-products";
import { useStockLevels } from "@/hooks/use-stock-levels";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useRealtimeEvent } from "@/hooks/use-realtime";
import { restockProduct } from "@/lib/api";

export default function InventoryPage() {
  const { data, loading, error, refetch } = useMovements();
  const stockLevels = useStockLevels();
  const products = useProducts();
  const warehouses = useWarehouses();
  const [open, setOpen] = useState(false);
  const [restocking, setRestocking] = useState(false);

  const refresh = useCallback(() => {
    void refetch();
    void stockLevels.refetch();
  }, [refetch, stockLevels.refetch]);

  useRealtimeEvent("stock:moved", refresh);
  useRealtimeEvent("dashboard:updated", refresh);
  useRealtimeEvent("purchase-order:updated", refresh);

  const handleRestock = async (productId: string) => {
    setRestocking(true);
    try {
      const result = await restockProduct({ productId });
      toast.success(`Restock order ${result.data.orderNumber} created`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create restock order");
    } finally {
      setRestocking(false);
    }
  };

  return (
    <>
      <InventoryClientPage
        movements={data?.data ?? null}
        stockLevels={stockLevels.data?.data ?? null}
        stockLevelsLoading={stockLevels.loading}
        loading={loading}
        error={error}
        restocking={restocking}
        onRestock={(productId) => void handleRestock(productId)}
        onCreate={() => setOpen(true)}
      />
      <MovementDialog
        open={open}
        movement={null}
        products={products.data?.data ?? null}
        warehouses={warehouses.data?.data ?? null}
        onOpenChange={setOpen}
        onSaved={refetch}
      />
    </>
  );
}
