"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch, updateUserPermissions } from "@/lib/api";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { PERMISSION_LIST } from "@/lib/permissions";
import type { Permission, UserRecord } from "@/lib/types";
import { useCurrentUser } from "@/hooks/use-current-user";

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "STAFF", "VIEWER"] as const;
const MANAGER_GRANTABLE_ROLES = ["STAFF", "VIEWER"] as const;

type UserDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  user?: UserRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role: UserRecord["role"];
  isActive: boolean;
  avatarUrl: string | null;
};

const emptyState: FormState = {
  name: "",
  email: "",
  password: "",
  role: "STAFF",
  isActive: true,
  avatarUrl: null,
};

const effectivePermissions = (user: UserRecord): Record<string, boolean> => {
  const map: Record<string, boolean> = {};
  for (const permission of PERMISSION_LIST) {
    map[permission.key] = user.permissions.includes(permission.key);
  }
  return map;
};

export function UserDialog({ open, mode, user, onOpenChange, onSaved }: UserDialogProps) {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.data?.role === "ADMIN";
  const roleOptions = isAdmin ? ROLE_OPTIONS : MANAGER_GRANTABLE_ROLES;
  const [form, setForm] = useState<FormState>(emptyState);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl ?? null,
      });
      setPermissions(effectivePermissions(user));
      return;
    }
    setForm(emptyState);
  }, [mode, user, open]);

  const title = useMemo(() => (mode === "create" ? "Create user" : "Edit user"), [mode]);

  const savePermissionChanges = async () => {
    if (mode !== "edit" || !user) {
      return;
    }

    const initial = effectivePermissions(user);
    const changes: Record<string, boolean> = {};
    for (const permission of PERMISSION_LIST) {
      if ((permissions[permission.key] ?? false) !== initial[permission.key]) {
        changes[permission.key] = permissions[permission.key] ?? false;
      }
    }

    if (Object.keys(changes).length) {
      await updateUserPermissions(user.id, changes);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);

    try {
      await apiFetch(mode === "create" ? "/users" : `/users/${user?.id ?? ""}`, {
        method: mode === "create" ? "POST" : "PATCH",
        body:
          mode === "create"
            ? JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                isActive: form.isActive,
                avatarUrl: form.avatarUrl,
              })
            : JSON.stringify({
                name: form.name,
                role: form.role,
                isActive: form.isActive,
                avatarUrl: form.avatarUrl,
              }),
      });

      await savePermissionChanges();

      toast.success(mode === "create" ? "User created" : "User updated");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save user");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePermission = (key: Permission) => {
    setPermissions((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <Sheet open={open} title={title} description="Adjust profile, role, activation state, and permissions." onOpenChange={onOpenChange}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <ImageUpload value={form.avatarUrl} onChange={(avatarUrl) => updateField("avatarUrl", avatarUrl)} label="Profile image" maxDimension={512} />
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        </div>
        {mode === "create" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
            </div>
          </>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={form.role} onValueChange={(value) => updateField("role", value as UserRecord["role"])}>
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={form.isActive} onChange={(event) => updateField("isActive", event.target.checked)} />
          Active account
        </label>

        {mode === "edit" ? (
          <div className="space-y-3 rounded-[1rem] border border-border p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Permission matrix</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Override the default role permissions for this user. Toggle each capability below.
              </p>
            </div>
            {PERMISSION_LIST.map((capability) => (
              <button
                key={capability.key}
                type="button"
                onClick={() => togglePermission(capability.key)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{capability.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{capability.description}</p>
                </div>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    permissions[capability.key]
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-border bg-muted/40 text-muted-foreground/50"
                  }`}
                >
                  {permissions[capability.key] ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create user" : "Save user"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
