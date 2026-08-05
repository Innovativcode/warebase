"use client";

import { ApprovalsClientPage } from "@/components/approvals/client-page";
import { PermissionGate } from "@/components/auth/permission-gate";

export const dynamic = "force-dynamic";

export default function ApprovalsPage() {
  return (
    <PermissionGate permission="approvals:manage">
      <ApprovalsClientPage />
    </PermissionGate>
  );
}
