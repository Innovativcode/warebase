"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SupplierRecord } from "@/lib/types";

type SupplierDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  supplier?: SupplierRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type FormState = {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

const emptyState: FormState = {
  code: "",
  name: "",
  email: "",
  phone: "",
  address: "",
};

export function SupplierDialog({ open, mode, supplier, onOpenChange, onSaved }: SupplierDialogProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && supplier) {
      setForm({
        code: supplier.code,
        name: supplier.name,
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
      });
      return;
    }
    setForm(emptyState);
  }, [mode, supplier, open]);

  const title = useMemo(() => (mode === "create" ? "Create supplier" : "Edit supplier"), [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await apiFetch(mode === "create" ? "/suppliers" : `/suppliers/${supplier?.id ?? ""}`, {
        method: mode === "create" ? "POST" : "PATCH",
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          address: form.address || null,
        }),
      });
      toast.success(mode === "create" ? "Supplier created" : "Supplier updated");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save supplier");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} title={title} description="Register and maintain approved supply partners." onOpenChange={onOpenChange}>
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create supplier" : "Save changes"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
