"use client";

import { PermissionGate } from "@/components/auth/permission-gate";
import { AccountingClientPage } from "@/components/accounting/accounting-client-page";

export default function AccountingPage() {
  return (
    <PermissionGate permission="accounting:read">
      <AccountingClientPage />
    </PermissionGate>
  );
}
