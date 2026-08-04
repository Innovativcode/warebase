import { useResource } from "@/hooks/use-resource";
import type { ApiResult, MovementRecord } from "@/lib/types";

export function useMovements() {
  return useResource<ApiResult<MovementRecord[]>>("/inventory/movements");
}

