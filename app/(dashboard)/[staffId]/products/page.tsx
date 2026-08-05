"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProductsClientPage } from "@/components/products/products-client-page";
import { ProductDialog } from "@/components/forms/product-dialog";
import { useProducts } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import { apiFetch } from "@/lib/api";
import type { ProductRecord } from "@/lib/types";
import { PermissionGate } from "@/components/auth/permission-gate";

export default function ProductsPage() {
  const products = useProducts();
  const suppliers = useSuppliers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRecord | null>(null);

  const handleDelete = async (product: ProductRecord) => {
    try {
      await apiFetch(`/products/${product.id}`, { method: "DELETE" });
      toast.success("Product deleted");
      products.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product");
    }
  };

  return (
    <PermissionGate permission="read">
      <ProductsClientPage
        products={products.data?.data ?? null}
        loading={products.loading}
        error={products.error}
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
        onEdit={(product) => {
          setEditing(product);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />
      <ProductDialog
        open={open}
        mode={editing ? "edit" : "create"}
        product={editing}
        suppliers={suppliers.data?.data ?? null}
        onOpenChange={setOpen}
        onSaved={products.refetch}
      />
    </PermissionGate>
  );
}
