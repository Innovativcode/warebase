import { useResource } from "@/hooks/use-resource";
import type { ApiResult, StockLevelRecord } from "@/lib/types";

export function useStockLevels() {
  return useResource<ApiResult<StockLevelRecord[]>>("/inventory/stock");
}
