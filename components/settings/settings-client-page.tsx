"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Pencil, ShieldCheck, User2, ShieldAlert, ShieldCheck as ShieldCheckIcon, Clock3, FileClock, Plus, Check, Minus, Settings2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, updateAppSettings } from "@/lib/api";
import { PERMISSION_LIST, ROLE_ORDER } from "@/lib/permissions";
import type { AuditLogRecord, UserRecord } from "@/lib/types";
import { InlineLoader } from "@/components/loader/warebase-loader";
import { PermissionGate } from "@/components/auth/permission-gate";
import automationAnimation from "@/assets/lottie/automation.json";

type SettingsClientPageProps = {
  users: UserRecord[] | null;
  auditLogs: AuditLogRecord[] | null;
  loading: boolean;
  error: string | null;
  onUsersChanged: () => void;
  onCreateUser: () => void;
  onEditUser: (user: UserRecord) => void;
};

const DEFAULT_PERMISSION_MATRIX: Record<string, string[]> = {
  VIEWER: ["read"],
  STAFF: ["read", "write"],
  MANAGER: ["read", "write", "delete", "approvals:manage", "users:manage", "audit:read", "accounting:read", "accounting:manage"],
  ADMIN: ["read", "write", "delete", "approvals:manage", "users:manage", "audit:read", "accounting:read", "accounting:manage"],
};

const CURRENCY_OPTIONS = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "NGN", label: "Nigerian Naira (NGN)" },
  { code: "KES", label: "Kenyan Shilling (KES)" },
  { code: "ZAR", label: "South African Rand (ZAR)" },
  { code: "GHS", label: "Ghanaian Cedi (GHS)" },
  { code: "RWF", label: "Rwandan Franc (RWF)" },
  { code: "TZS", label: "Tanzanian Shilling (TZS)" },
  { code: "UGX", label: "Ugandan Shilling (UGX)" },
  { code: "EGP", label: "Egyptian Pound (EGP)" },
  { code: "MAD", label: "Moroccan Dirham (MAD)" },
  { code: "AED", label: "UAE Dirham (AED)" },
  { code: "SAR", label: "Saudi Riyal (SAR)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "JPY", label: "Japanese Yen (JPY)" },
  { code: "CNY", label: "Chinese Yuan (CNY)" },
];

const formatAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    approve: "Approved",
    reject: "Rejected",
    restore: "Restored",
    login: "Logged in",
    logout: "Logged out",
  };
  return actionMap[action.toLowerCase()] || action;
};

const formatEntity = (entity: string): string => {
  const entityMap: Record<string, string> = {
    product: "Product",
    purchase_order: "Purchase Order",
    user: "User",
    warehouse: "Warehouse",
    supplier: "Supplier",
    inventory: "Inventory",
    approval: "Approval",
  };
  return entityMap[entity.toLowerCase()] || entity;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function SettingsClientPage({ users, auditLogs, loading, error, onCreateUser, onEditUser }: SettingsClientPageProps) {
  const [permissionMatrix, setPermissionMatrix] = useState(DEFAULT_PERMISSION_MATRIX);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [workspaceCurrency, setWorkspaceCurrency] = useState<string | null>(null);
  const [currencyLoading, setCurrencyLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ success: boolean; data: { currency: string | null } }>("/settings")
      .then((response) => {
        if (mounted) setWorkspaceCurrency(response.data.currency);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setCurrencyLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveCurrency = async () => {
    try {
      await updateAppSettings({ currency: workspaceCurrency });
      toast.success("Workspace currency updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update currency");
    }
  };

  const handleToggleRolePermission = async (role: string, permission: string) => {
    const currentPermissions = permissionMatrix[role] || [];
    const hasPermission = currentPermissions.includes(permission);
    const granted = !hasPermission;

    try {
      await apiFetch(`/permissions/role/${role}`, {
        method: "PATCH",
        body: JSON.stringify({ permission, granted }),
      });

      setPermissionMatrix((prev) => {
        const newMatrix = { ...prev };
        if (granted) {
          newMatrix[role] = [...(newMatrix[role] || []), permission];
        } else {
          newMatrix[role] = (newMatrix[role] || []).filter((p) => p !== permission);
        }
        return newMatrix;
      });

      toast.success(`Permission ${granted ? "granted" : "revoked"} for ${role}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update permission");
    }
  };

  const handleEditUserPermissions = async (user: UserRecord) => {
    try {
      const response = await apiFetch<{ success: boolean; data: Array<{ permission: string; granted: boolean }> }>(
        `/permissions/user/${user.id}`
      );
      const perms: Record<string, boolean> = {};
      response.data.forEach((override) => {
        perms[override.permission] = override.granted;
      });
      setUserPermissions(perms);
      setSelectedUser(user);
    } catch (err) {
      toast.error("Failed to load user permissions");
      console.error("Permission load error:", err);
    }
  };

  const handleToggleUserPermission = async (permission: string) => {
    if (!selectedUser) return;

    const currentGranted = userPermissions[permission];
    const granted = currentGranted === undefined ? true : !currentGranted;

    try {
      await apiFetch(`/permissions/user/${selectedUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({ permission, granted }),
      });

      setUserPermissions((prev) => ({
        ...prev,
        [permission]: granted,
      }));

      toast.success(`Permission ${granted ? "granted" : "revoked"} for ${selectedUser.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update permission");
    }
  };

  const getUserEffectivePermissions = (user: UserRecord) => {
    if (user.isSuperAdmin) {
      return PERMISSION_LIST.map((capability) => capability.key);
    }
    const rolePerms = permissionMatrix[user.role] || [];
    return rolePerms;
  };

  const userColumns: Column<UserRecord>[] = [
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (user) => (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center overflow-hidden rounded-[0.85rem] border border-border/70 bg-background">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <User2 className="h-[18px] w-[18px] stroke-[1.9] text-muted-foreground/80" />
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{user.name}</span>
              {user.isSuperAdmin ? (
                <Badge variant="outline" className="gap-1 text-[0.65rem] font-semibold text-[#E8A23D]">
                  <Lock className="h-3 w-3" />
                  Super admin
                </Badge>
              ) : null}
            </div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (user) => (
        <Badge variant={user.role === "ADMIN" ? "danger" : user.role === "MANAGER" ? "warning" : "secondary"}>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            {user.role}
          </span>
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (user) => (
        <Badge variant={user.isActive ? "success" : "secondary"}>
          <span className="inline-flex items-center gap-1.5">
            {user.isActive ? <ShieldCheckIcon className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {user.isActive ? "Active" : "Disabled"}
          </span>
        </Badge>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (user) => {
        const perms = getUserEffectivePermissions(user);
        return (
          <div className="flex flex-wrap gap-1">
            {perms.slice(0, 3).map((perm) => (
              <Badge key={perm} variant="outline" className="text-xs">
                {perm}
              </Badge>
            ))}
            {perms.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{perms.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditUserPermissions(user)}
            disabled={user.isSuperAdmin}
            title={user.isSuperAdmin ? "Super admin permissions are fixed" : undefined}
          >
            <Settings2 className="h-4 w-4" />
            Permissions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditUser(user)}
            disabled={user.isSuperAdmin}
            title={user.isSuperAdmin ? "Super admin cannot be edited" : undefined}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const auditColumns: Column<AuditLogRecord>[] = [
    {
      key: "action",
      label: "What Happened",
      sortable: true,
      render: (log) => (
        <div className="flex items-center gap-2">
          <FileClock className="h-4 w-4 text-muted-foreground/70" />
          <span className="font-medium">{formatAction(log.action)}</span>
        </div>
      ),
    },
    {
      key: "entity",
      label: "What Changed",
      sortable: true,
      render: (log) => (
        <div>
          <div className="font-medium text-foreground">{formatEntity(log.entity)}</div>
          {log.entityId && (
            <div className="text-xs text-muted-foreground">ID: {log.entityId}</div>
          )}
        </div>
      ),
    },
    {
      key: "actorId",
      label: "Who Did It",
      sortable: true,
      render: (log) => (
        <div className="flex items-center gap-2">
          <User2 className="h-4 w-4 text-muted-foreground/70" />
          <span>{log.actorId ?? "System"}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "When",
      sortable: true,
      render: (log) => (
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-muted-foreground/70" />
          <span>{formatDate(log.createdAt)}</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeroPanel
        badge="Governance"
        title="System settings"
        description="Security, access, and operational governance live here."
        note="Settings should make access, environment, and security policy easy to review without adding clutter."
        animationData={automationAnimation}
        reverse
      />

      <PermissionGate permission="users:manage">
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>User access</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Admin and manager accounts currently registered in the system.</p>
              </div>
              <Button onClick={onCreateUser} className="gap-2">
                <Plus className="h-4 w-4" />
                New user
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <InlineLoader label="Loading users…" />
            ) : users?.length ? (
              <DataTable
                data={users}
                columns={userColumns}
                keyExtractor={(user) => user.id}
                emptyMessage="No users found"
              />
            ) : (
              <EmptyState
                title="No users found"
                description="The first admin account will appear here after registration."
                icon={<ShieldCheck className="h-6 w-6" />}
              />
            )}
          </CardContent>
      </Card>
      </PermissionGate>

      <PermissionGate permission="users:manage">
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Workspace</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Set the currency used across the ledger, summaries, and charts. Defaults to Nigerian Naira (NGN) when unset.
              </p>
            </div>
            <Settings2 className="h-5 w-5 text-muted-foreground/60" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label>Ledger currency</Label>
              <Select
                value={workspaceCurrency ?? "__unset"}
                onValueChange={(value) => setWorkspaceCurrency(value === "__unset" ? null : value)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unset">Default (NGN)</SelectItem>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveCurrency} disabled={currencyLoading}>
              {currencyLoading ? "Loading…" : "Save currency"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </PermissionGate>

      <PermissionGate permission="users:manage">
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Permission matrix</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Click cells to toggle permissions for each role. Changes are saved immediately.
              </p>
            </div>
            <Badge variant="secondary">
              {editingPermissions ? "Editing" : "View only"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  {ROLE_ORDER.map((role) => (
                    <TableHead key={role} className="text-center">
                      <span className={role === "ADMIN" ? "font-bold text-[#E8A23D]" : undefined}>{role}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_LIST.map((capability) => (
                  <TableRow key={capability.key}>
                    <TableCell className="font-medium text-foreground">{capability.label}</TableCell>
                    {ROLE_ORDER.map((role) => {
                      const granted = permissionMatrix[role]?.includes(capability.key) || false;
                      return (
                        <TableCell key={role} className="text-center">
                          <button
                            onClick={() => handleToggleRolePermission(role, capability.key)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                          >
                            {granted ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground/40">
                                <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
                              </span>
                            )}
                          </button>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </PermissionGate>

      <PermissionGate permission="users:manage">
        <Sheet
          open={!!selectedUser}
          title={selectedUser ? `User permissions: ${selectedUser.name}` : ""}
          description="Override default role permissions for this specific user. Changes are saved immediately."
          onOpenChange={(open) => !open && setSelectedUser(null)}
        >
          {selectedUser && (
            <div className="space-y-3">
              {selectedUser.isSuperAdmin ? (
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Super admin users always have every permission. These cannot be changed.</span>
                </div>
              ) : null}
              {PERMISSION_LIST.map((capability) => {
                const locked = selectedUser.isSuperAdmin;
                const roleHasPermission = permissionMatrix[selectedUser.role]?.includes(capability.key) || false;
                const userOverride = userPermissions[capability.key];
                const effectiveGranted = locked ? true : userOverride !== undefined ? userOverride : roleHasPermission;

                return (
                  <div key={capability.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{capability.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {capability.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {roleHasPermission ? `Default for ${selectedUser.role}` : `Not granted to ${selectedUser.role}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleUserPermission(capability.key)}
                      disabled={locked}
                      title={locked ? "Fixed for super admin" : undefined}
                      className="ml-4 inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:pointer-events-none"
                    >
                      {effectiveGranted ? (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <Check className="h-4 w-4" strokeWidth={2.6} />
                        </span>
                      ) : (
                        <span className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground/40">
                          <Minus className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Sheet>
      </PermissionGate>

      <PermissionGate permission="audit:read">
      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Activity Log</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete record of all actions taken in the system. This log helps track changes, ensure accountability, and maintain compliance.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {auditLogs?.length ? (
            <DataTable
              data={auditLogs}
              columns={auditColumns}
              keyExtractor={(log) => log.id}
              emptyMessage="No activity yet"
            />
          ) : (
            <EmptyState
              title="No activity yet"
              description="Actions like creating products, processing orders, and managing users will appear here."
              icon={<ShieldCheck className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
      </PermissionGate>
    </>
  );
}
