import { useResource } from "@/hooks/use-resource";
import type { ApiResult, DashboardSummary } from "@/lib/types";

export function useDashboardSummary() {
  return useResource<ApiResult<DashboardSummary>>("/dashboard/summary");
}

