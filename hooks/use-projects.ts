import { useResource } from "@/hooks/use-resource";
import type { ApiResult, ProjectRecord } from "@/lib/types";

export function useProjects() {
  return useResource<ApiResult<ProjectRecord[]>>("/projects");
}

