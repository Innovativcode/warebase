"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
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
import type { UserRecord } from "@/lib/types";
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
};

const emptyState: FormState = {
  name: "",
  email: "",
  password: "",
  role: "STAFF",
  isActive: true,
};

export function UserDialog({ open, mode, user, onOpenChange, onSaved }: UserDialogProps) {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.data?.role === "ADMIN";
  const roleOptions = isAdmin ? ROLE_OPTIONS : MANAGER_GRANTABLE_ROLES;
  const [form, setForm] = useState<FormState>(emptyState);
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
      });
      return;
    }
    setForm(emptyState);
  }, [mode, user, open]);

  const title = useMemo(() => (mode === "create" ? "Create user" : "Edit user"), [mode]);

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
              })
            : JSON.stringify({
                name: form.name,
                role: form.role,
                isActive: form.isActive,
              }),
      });
      toast.success(mode === "create" ? "User created" : "User updated");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} title={title} description="Adjust name, role, or activation state." onOpenChange={onOpenChange}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </div>
        {mode === "create" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </div>
          </>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as UserRecord["role"] })}>
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
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          Active account
        </label>
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
