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
import type { MovementRecord, ProductRecord, WarehouseRecord } from "@/lib/types";

type MovementDialogProps = {
  open: boolean;
  movement?: MovementRecord | null;
  products: ProductRecord[] | null;
  warehouses: WarehouseRecord[] | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type FormState = {
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
  quantity: string;
  reason: string;
  reference: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
};

const emptyState: FormState = {
  productId: "",
  type: "IN",
  quantity: "1",
  reason: "",
  reference: "",
  sourceWarehouseId: "",
  destinationWarehouseId: "",
};

export function MovementDialog({ open, movement, products, warehouses, onOpenChange, onSaved }: MovementDialogProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyState);
  }, [open]);

  const title = useMemo(() => "Record stock movement", []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await apiFetch("/inventory/movements", {
        method: "POST",
        body: JSON.stringify({
          productId: form.productId,
          type: form.type,
          quantity: Number(form.quantity),
          reason: form.reason || null,
          reference: form.reference || null,
          sourceWarehouseId: form.sourceWarehouseId || null,
          destinationWarehouseId: form.destinationWarehouseId || null,
        }),
      });
      toast.success("Stock movement recorded");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save movement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} title={title} description="Receive, issue, transfer, or adjust stock with a permanent ledger entry." onOpenChange={onOpenChange}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="productId">Product</Label>
            <Select value={form.productId} onValueChange={(value) => setForm({ ...form, productId: value })}>
              <SelectTrigger id="productId">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as FormState["type"] })}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">IN</SelectItem>
                <SelectItem value="OUT">OUT</SelectItem>
                <SelectItem value="ADJUSTMENT">ADJUSTMENT</SelectItem>
                <SelectItem value="TRANSFER">TRANSFER</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min={1} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sourceWarehouseId">Source warehouse</Label>
            <Select value={form.sourceWarehouseId || "__none"} onValueChange={(value) => setForm({ ...form, sourceWarehouseId: value === "__none" ? "" : value })}>
              <SelectTrigger id="sourceWarehouseId">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {warehouses?.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinationWarehouseId">Destination warehouse</Label>
            <Select value={form.destinationWarehouseId || "__none"} onValueChange={(value) => setForm({ ...form, destinationWarehouseId: value === "__none" ? "" : value })}>
              <SelectTrigger id="destinationWarehouseId">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {warehouses?.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Input id="reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Record movement"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
