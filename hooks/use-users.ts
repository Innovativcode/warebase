import { useResource } from "@/hooks/use-resource";
import type { ApiResult, UserRecord } from "@/lib/types";

export function useUsers() {
  return useResource<ApiResult<UserRecord[]>>("/users");
}

