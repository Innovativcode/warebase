import { useResource } from "@/hooks/use-resource";
import type { ApiResult, UserRecord } from "@/lib/types";

export function useCurrentUser() {
  return useResource<ApiResult<UserRecord>>("/auth/me");
}

