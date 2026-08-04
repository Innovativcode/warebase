import { useResource } from "@/hooks/use-resource";
import type { ApiResult, ApprovalRecord } from "@/lib/types";

export function useApprovals() {
  return useResource<ApiResult<ApprovalRecord[]>>("/approvals");
}
