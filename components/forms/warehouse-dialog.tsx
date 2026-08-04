"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WarehouseRecord } from "@/lib/types";

type WarehouseDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  warehouse?: WarehouseRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type FormState = {
  code: string;
  name: string;
  location: string;
  isPrimary: boolean;
};

const emptyState: FormState = {
  code: "",
  name: "",
  location: "",
  isPrimary: false,
};

export function WarehouseDialog({ open, mode, warehouse, onOpenChange, onSaved }: WarehouseDialogProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && warehouse) {
      setForm({
        code: warehouse.code,
        name: warehouse.name,
        location: warehouse.location ?? "",
        isPrimary: warehouse.isPrimary,
      });
      return;
    }
    setForm(emptyState);
  }, [mode, warehouse, open]);

  const title = useMemo(() => (mode === "create" ? "Create warehouse" : "Edit warehouse"), [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await apiFetch(mode === "create" ? "/warehouses" : `/warehouses/${warehouse?.id ?? ""}`, {
        method: mode === "create" ? "POST" : "PATCH",
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          location: form.location || null,
          isPrimary: form.isPrimary,
        }),
      });
      toast.success(mode === "create" ? "Warehouse created" : "Warehouse updated");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save warehouse");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} title={title} description="Register a physical storage location or fulfillment hub." onOpenChange={onOpenChange}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={form.isPrimary} onChange={(event) => setForm({ ...form, isPrimary: event.target.checked })} />
          Primary warehouse
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create warehouse" : "Save changes"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
