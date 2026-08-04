import { useResource } from "@/hooks/use-resource";
import type { ApiResult, AuditLogRecord } from "@/lib/types";

export function useAuditLogs() {
  return useResource<ApiResult<AuditLogRecord[]>>("/audit-logs");
}

