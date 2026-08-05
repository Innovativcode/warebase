"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import type { Permission } from "@/lib/types";

type PermissionGateProps = {
  permission: Permission | Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser?.data) {
    return null;
  }

  const userPermissions = currentUser.data.permissions || [];
  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasPermission = requireAll
    ? permissions.every((p) => userPermissions.includes(p))
    : permissions.some((p) => userPermissions.includes(p));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
