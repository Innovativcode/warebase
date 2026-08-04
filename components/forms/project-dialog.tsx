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
import { Textarea } from "@/components/ui/textarea";
import type { ProjectRecord, UserRecord } from "@/lib/types";

type ProjectDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  project?: ProjectRecord | null;
  users: UserRecord[] | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type FormState = {
  code: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  dueDate: string;
  ownerUserId: string;
};

const emptyState: FormState = {
  code: "",
  name: "",
  description: "",
  status: "PLANNED",
  startDate: "",
  dueDate: "",
  ownerUserId: "",
};

export function ProjectDialog({ open, mode, project, users, onOpenChange, onSaved }: ProjectDialogProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && project) {
      setForm({
        code: project.code,
        name: project.name,
        description: project.description ?? "",
        status: project.status,
        startDate: "",
        dueDate: "",
        ownerUserId: "",
      });
      return;
    }
    setForm(emptyState);
  }, [mode, project, open]);

  const title = useMemo(() => (mode === "create" ? "Create project" : "Edit project"), [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await apiFetch(mode === "create" ? "/projects" : `/projects/${project?.id ?? ""}`, {
        method: mode === "create" ? "POST" : "PATCH",
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          description: form.description || null,
          status: form.status,
          startDate: form.startDate || null,
          dueDate: form.dueDate || null,
          ownerUserId: form.ownerUserId || null,
        }),
      });
      toast.success(mode === "create" ? "Project created" : "Project updated");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} title={title} description="Track program work, ownership, and project status." onOpenChange={onOpenChange}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNED">PLANNED</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="BLOCKED">BLOCKED</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerUserId">Owner</Label>
            <Select value={form.ownerUserId || "__none"} onValueChange={(value) => setForm({ ...form, ownerUserId: value === "__none" ? "" : value })}>
              <SelectTrigger id="ownerUserId">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Unassigned</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
