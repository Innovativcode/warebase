import { useResource } from "@/hooks/use-resource";
import type { ApiResult, SupplierRecord } from "@/lib/types";

export function useSuppliers() {
  return useResource<ApiResult<SupplierRecord[]>>("/suppliers");
}

