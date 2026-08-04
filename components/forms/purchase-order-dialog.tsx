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
import type { ProductRecord, SupplierRecord } from "@/lib/types";

type PurchaseOrderDialogProps = {
  open: boolean;
  suppliers: SupplierRecord[] | null;
  products: ProductRecord[] | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type FormState = {
  orderNumber: string;
  supplierId: string;
  status: "DRAFT" | "SENT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  notes: string;
  productId: string;
  quantityOrdered: string;
  quantityReceived: string;
  unitCost: string;
};

const emptyState: FormState = {
  orderNumber: "",
  supplierId: "",
  status: "DRAFT",
  notes: "",
  productId: "",
  quantityOrdered: "1",
  quantityReceived: "0",
  unitCost: "0.00",
};

export function PurchaseOrderDialog({ open, suppliers, products, onOpenChange, onSaved }: PurchaseOrderDialogProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyState);
  }, [open]);

  const title = useMemo(() => "Create purchase order", []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await apiFetch("/purchase-orders", {
        method: "POST",
        body: JSON.stringify({
          orderNumber: form.orderNumber,
          supplierId: form.supplierId || null,
          status: form.status,
          notes: form.notes || null,
          lines: [
            {
              productId: form.productId,
              quantityOrdered: Number(form.quantityOrdered),
              quantityReceived: Number(form.quantityReceived),
              unitCost: Number(form.unitCost),
            },
          ],
        }),
      });
      toast.success("Purchase order created");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save purchase order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} title={title} description="Create a procurement order with a first receiving line." onOpenChange={onOpenChange}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input id="orderNumber" value={form.orderNumber} onChange={(event) => setForm({ ...form, orderNumber: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as FormState["status"] })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="SENT">SENT</SelectItem>
                <SelectItem value="PARTIALLY_RECEIVED">PARTIALLY_RECEIVED</SelectItem>
                <SelectItem value="RECEIVED">RECEIVED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="supplierId">Supplier</Label>
            <Select value={form.supplierId || "__none"} onValueChange={(value) => setForm({ ...form, supplierId: value === "__none" ? "" : value })}>
              <SelectTrigger id="supplierId">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Unassigned</SelectItem>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="productId">Product line</Label>
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
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="quantityOrdered">Qty ordered</Label>
            <Input id="quantityOrdered" type="number" min={1} value={form.quantityOrdered} onChange={(event) => setForm({ ...form, quantityOrdered: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantityReceived">Qty received</Label>
            <Input id="quantityReceived" type="number" min={0} value={form.quantityReceived} onChange={(event) => setForm({ ...form, quantityReceived: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitCost">Unit cost</Label>
            <Input id="unitCost" type="number" step="0.01" min={0} value={form.unitCost} onChange={(event) => setForm({ ...form, unitCost: event.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Create order"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
