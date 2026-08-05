"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createTransaction } from "@/lib/api";
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
import { cn } from "@/lib/cn";
import type { TransactionInput } from "@/lib/types";

type TransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const INCOME_CATEGORIES = ["Sales", "Services", "Investment", "Other income"];
const EXPENSE_CATEGORIES = ["Inventory", "Salaries", "Rent", "Utilities", "Shipping", "Software", "Other"];

type FormState = {
  type: "INCOME" | "EXPENSE";
  amount: string;
  category: string;
  description: string;
  reference: string;
  occurredAt: string;
};

const emptyState: FormState = {
  type: "INCOME",
  amount: "",
  category: "Sales",
  description: "",
  reference: "",
  occurredAt: "",
};

export function TransactionDialog({ open, onOpenChange }: TransactionDialogProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...emptyState, occurredAt: new Date().toISOString().slice(0, 10) });
    }
  }, [open]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const categories = form.type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount greater than zero");
      return;
    }

    setSaving(true);

    const payload: TransactionInput = {
      type: form.type,
      amount,
      category: form.category || "Other",
      description: form.description || null,
      reference: form.reference || null,
      occurredAt: form.occurredAt ? new Date(`${form.occurredAt}T00:00:00`).toISOString() : null,
    };

    try {
      await createTransaction(payload);
      toast.success(form.type === "INCOME" ? "Income recorded" : "Expense recorded");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to record transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      title="Record transaction"
      description="Book an income or expense entry into the ledger."
      onOpenChange={onOpenChange}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 rounded-[1rem] border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => {
              updateField("type", "INCOME");
              updateField("category", INCOME_CATEGORIES[0]);
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm font-medium transition-colors",
              form.type === "INCOME"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => {
              updateField("type", "EXPENSE");
              updateField("category", EXPENSE_CATEGORIES[0]);
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm font-medium transition-colors",
              form.type === "EXPENSE"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Expense
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occurredAt">Date</Label>
            <Input
              id="occurredAt"
              type="date"
              value={form.occurredAt}
              onChange={(event) => updateField("occurredAt", event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={form.category} onValueChange={(value) => updateField("category", value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Optional note about this transaction"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Reference</Label>
          <Input
            id="reference"
            value={form.reference}
            onChange={(event) => updateField("reference", event.target.value)}
            placeholder="PO number, invoice ID, or other reference"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Recording…" : "Record transaction"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
