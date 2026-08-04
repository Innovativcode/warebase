import { useResource } from "@/hooks/use-resource";
import type { ApiResult, NotificationSummary } from "@/lib/types";

export function useNotifications(limit = 8) {
  return useResource<ApiResult<NotificationSummary>>(`/notifications?limit=${limit}`);
}
