import { AppShell } from "@/components/layout/app-shell";
import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { DeleteConfirmButton } from "@/components/layout/delete-confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Users2, Mail, PhoneCall, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SupplierRecord } from "@/lib/types";
import { InlineLoader } from "@/components/loader/warebase-loader";
import shoppingAnimation from "@/assets/lottie/shopping.json";

type SuppliersClientPageProps = {
  suppliers: SupplierRecord[] | null;
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onEdit: (supplier: SupplierRecord) => void;
  onDelete: (supplier: SupplierRecord) => void;
};

export function SuppliersClientPage({ suppliers, loading, error, onCreate, onEdit, onDelete }: SuppliersClientPageProps) {
  return (
    <AppShell title="Suppliers" description="Maintain vendor intelligence, ordering points, and procurement relationships.">
      <PageHeroPanel
        badge="Procurement network"
        title="Suppliers"
        description="Approved supply partners for replenishment and procurement workflows."
        note="Vendor records should feel operational, not decorative: clear contacts, codes, and commitments."
        animationData={shoppingAnimation}
        action={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New supplier
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Supplier register</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoader label="Loading suppliers…" />
          ) : error ? (
            <EmptyState title="Unable to load suppliers" description={error} icon={<Users2 className="h-6 w-6" />} />
          ) : suppliers?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>POs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-border/70 bg-background text-muted-foreground/80">
                          <Users2 className="h-[18px] w-[18px] stroke-[1.9]" />
                        </span>
                        <div>
                          <div className="font-medium text-foreground">{supplier.name}</div>
                          <div className="text-xs text-muted-foreground">{supplier.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground/70" />
                        <span>{supplier.email ?? "No email"}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <PhoneCall className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>{supplier.phone ?? "No phone"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground/70" />
                        <span className="tabular-nums">{supplier._count.purchaseOrders}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(supplier)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <DeleteConfirmButton itemName={supplier.name} onConfirm={() => onDelete(supplier)} buttonLabel="Delete" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No suppliers created"
              description="Supplier records will appear here once your procurement master data is loaded."
              icon={<Users2 className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
