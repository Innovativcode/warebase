import { AppShell } from "@/components/layout/app-shell";
import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, ShieldCheck, User2, ShieldAlert, ShieldCheck as ShieldCheckIcon, Clock3, FileClock, Plus, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditLogRecord, UserRecord } from "@/lib/types";
import { InlineLoader } from "@/components/loader/warebase-loader";
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

const PERMISSION_CAPABILITIES: Array<{ key: string; label: string }> = [
  { key: "read", label: "View catalog & inventory" },
  { key: "write", label: "Create & edit records" },
  { key: "delete", label: "Delete records" },
  { key: "approvals:manage", label: "Approve purchase & restock requests" },
  { key: "users:manage", label: "Manage users, roles & access" },
  { key: "audit:read", label: "Read the audit trail" },
];

const PERMISSION_MATRIX: Record<string, string[]> = {
  VIEWER: ["read"],
  STAFF: ["read", "write"],
  MANAGER: ["read", "write", "delete", "approvals:manage", "users:manage", "audit:read"],
  ADMIN: ["read", "write", "delete", "approvals:manage", "users:manage", "audit:read"],
};

const ROLE_ORDER = ["VIEWER", "STAFF", "MANAGER", "ADMIN"] as const;

export function SettingsClientPage({ users, auditLogs, loading, error, onCreateUser, onEditUser }: SettingsClientPageProps) {
  return (
    <AppShell title="Settings" description="Configure roles, system controls, and operational policies.">
      <PageHeroPanel
        badge="Governance"
        title="System settings"
        description="Security, access, and operational governance live here."
        note="Settings should make access, environment, and security policy easy to review without adding clutter."
        animationData={automationAnimation}
        reverse
      />

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
          ) : error ? (
            <EmptyState
              title="Unable to load users"
              description={error}
              icon={<ShieldCheck className="h-6 w-6" />}
            />
          ) : users?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-border/70 bg-background text-muted-foreground/80">
                          <User2 className="h-[18px] w-[18px] stroke-[1.9]" />
                        </span>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "danger" : user.role === "MANAGER" ? "warning" : "secondary"}>
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheckIcon className="h-3.5 w-3.5" />
                          {user.role}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "secondary"}>
                        <span className="inline-flex items-center gap-1.5">
                          {user.isActive ? <ShieldCheckIcon className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEditUser(user)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No users found"
              description="The first admin account will appear here after registration."
              icon={<ShieldCheck className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Permission matrix</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              What each role can do. Edit a user to elevate, de-elevate, or disable access.
            </p>
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
                {PERMISSION_CAPABILITIES.map((capability) => (
                  <TableRow key={capability.key}>
                    <TableCell className="font-medium text-foreground">{capability.label}</TableCell>
                    {ROLE_ORDER.map((role) => {
                      const granted = PERMISSION_MATRIX[role].includes(capability.key);
                      return (
                        <TableCell key={role} className="text-center">
                          {granted ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground/40">
                              <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
                            </span>
                          )}
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

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Audit trail</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Recent operational changes captured from the backend.</p>
          </div>
        </CardHeader>
        <CardContent>
          {auditLogs?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileClock className="h-4 w-4 text-muted-foreground/70" />
                        <span>{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User2 className="h-4 w-4 text-muted-foreground/70" />
                        <span>{log.actorId ?? "system"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-muted-foreground/70" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No audit logs yet"
              description="Write operations will appear here once users start creating or updating records."
              icon={<ShieldCheck className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
