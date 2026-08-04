import { useResource } from "@/hooks/use-resource";
import type { ApiResult, ProductRecord } from "@/lib/types";

export function useProducts() {
  return useResource<ApiResult<ProductRecord[]>>("/products");
}

