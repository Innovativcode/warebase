import { useResource } from "@/hooks/use-resource";
import type { ApiResult, PurchaseOrderRecord } from "@/lib/types";

export function usePurchaseOrders() {
  return useResource<ApiResult<PurchaseOrderRecord[]>>("/purchase-orders");
}

