import { useResource } from "@/hooks/use-resource";
import type { ApiResult, WarehouseRecord } from "@/lib/types";

export function useWarehouses() {
  return useResource<ApiResult<WarehouseRecord[]>>("/warehouses");
}

