"use client";

import { useParams } from "next/navigation";
import { ProductDetailClientPage } from "@/components/products/product-detail-client-page";
import { PermissionGate } from "@/components/auth/permission-gate";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PermissionGate permission="read">
      <ProductDetailClientPage id={id} />
    </PermissionGate>
  );
}
