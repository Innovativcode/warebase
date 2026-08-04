"use client";

import { useState } from "react";
import { SettingsClientPage } from "@/components/settings/settings-client-page";
import { UserDialog } from "@/components/forms/user-dialog";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { useUsers } from "@/hooks/use-users";
import type { UserRecord } from "@/lib/types";

export default function SettingsPage() {
  const users = useUsers();
  const auditLogs = useAuditLogs();
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <SettingsClientPage
        users={users.data?.data ?? null}
        auditLogs={auditLogs.data?.data ?? null}
        loading={users.loading || auditLogs.loading}
        error={users.error ?? auditLogs.error}
        onUsersChanged={() => {
          users.refetch();
          auditLogs.refetch();
        }}
        onCreateUser={() => setCreating(true)}
        onEditUser={(user) => setEditing(user)}
      />
      <UserDialog
        mode="edit"
        open={Boolean(editing)}
        user={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSaved={() => {
          users.refetch();
          auditLogs.refetch();
          setEditing(null);
        }}
      />
      <UserDialog
        mode="create"
        open={creating}
        onOpenChange={(open) => {
          if (!open) setCreating(false);
        }}
        onSaved={() => {
          users.refetch();
          auditLogs.refetch();
          setCreating(false);
        }}
      />
    </>
  );
}
