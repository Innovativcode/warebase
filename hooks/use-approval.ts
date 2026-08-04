import { useResource } from "@/hooks/use-resource";
import type { ApiResult, ApprovalRecord } from "@/lib/types";

export function useApproval(id: string) {
  return useResource<ApiResult<ApprovalRecord>>(`/approvals/${id}`);
}
