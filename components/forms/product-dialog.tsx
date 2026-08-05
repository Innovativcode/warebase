"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductRecord, SupplierRecord } from "@/lib/types";
import { ImageUpload } from "@/components/ui/image-upload";
import { ProductBarcode } from "@/components/products/product-barcode";

type ProductDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  product?: ProductRecord | null;
  suppliers: SupplierRecord[] | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type ProductFormState = {
  sku: string;
  barcode: string;
  name: string;
  description: string;
  unit: string;
  reorderPoint: string;
  reorderQty: string;
  supplierId: string;
  isActive: boolean;
  imageUrl: string | null;
};

const emptyState: ProductFormState = {
  sku: "",
  barcode: "",
  name: "",
  description: "",
  unit: "pcs",
  reorderPoint: "0",
  reorderQty: "0",
  supplierId: "",
  isActive: true,
  imageUrl: null,
};

export function ProductDialog({
  open,
  mode,
  product,
  suppliers,
  onOpenChange,
  onSaved,
}: ProductDialogProps) {
  const [form, setForm] = useState<ProductFormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && product) {
        setForm({
          sku: product.sku,
          barcode: product.barcode ?? "",
          name: product.name,
        description: product.description ?? "",
        unit: product.unit,
        reorderPoint: String(product.reorderPoint),
        reorderQty: String(product.reorderQty),
        supplierId: product.supplier?.id ?? "",
        isActive: product.isActive,
        imageUrl: product.imageUrl ?? null,
      });
      return;
    }

    setForm(emptyState);
  }, [mode, product, open]);

  const title = useMemo(() => (mode === "create" ? "Create product" : "Edit product"), [mode]);

  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      sku: form.sku,
      barcode: form.barcode || null,
      name: form.name,
      description: form.description || null,
      unit: form.unit,
      reorderPoint: Number(form.reorderPoint),
      reorderQty: Number(form.reorderQty),
      supplierId: form.supplierId || null,
      isActive: form.isActive,
      imageUrl: form.imageUrl,
    };

    try {
      await apiFetch(mode === "create" ? "/products" : `/products/${product?.id ?? ""}`, {
        method: mode === "create" ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success(mode === "create" ? "Product created" : "Product updated");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      title={title}
      description="Maintain product master data, reorder thresholds, and supplier mapping."
      onOpenChange={onOpenChange}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <ImageUpload
          value={form.imageUrl}
          onChange={(imageUrl) => updateField("imageUrl", imageUrl)}
          label="Product image"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={form.sku} onChange={(event) => updateField("sku", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input id="barcode" value={form.barcode} onChange={(event) => updateField("barcode", event.target.value)} placeholder="Optional barcode" />
            <p className="text-xs text-muted-foreground">Leave blank to auto-generate a scannable EAN-13 barcode.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" value={form.unit} onChange={(event) => updateField("unit", event.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Barcode preview</Label>
          <ProductBarcode value={form.barcode || null} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="reorderPoint">Reorder point</Label>
            <Input
              id="reorderPoint"
              type="number"
              min={0}
              value={form.reorderPoint}
              onChange={(event) => updateField("reorderPoint", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorderQty">Reorder qty</Label>
            <Input
              id="reorderQty"
              type="number"
              min={0}
              value={form.reorderQty}
              onChange={(event) => updateField("reorderQty", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierId">Supplier</Label>
            <Select value={form.supplierId || "__none"} onValueChange={(value) => updateField("supplierId", value === "__none" ? "" : value)}>
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
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
          />
          Active product
        </label>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
