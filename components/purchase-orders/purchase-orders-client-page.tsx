import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { DeleteConfirmButton } from "@/components/layout/delete-confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pencil, Plus, ShoppingCart, FileText, Truck, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PurchaseOrderRecord } from "@/lib/types";
import { InlineLoader } from "@/components/loader/warebase-loader";
import shoppingAnimation from "@/assets/lottie/shopping.json";

type PurchaseOrdersClientPageProps = {
  purchaseOrders: PurchaseOrderRecord[] | null;
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onDelete: (purchaseOrder: PurchaseOrderRecord) => void;
  onReceive: (purchaseOrder: PurchaseOrderRecord) => void;
};

export function PurchaseOrdersClientPage({ purchaseOrders, loading, error, onCreate, onDelete, onReceive }: PurchaseOrdersClientPageProps) {
  const columns: Column<PurchaseOrderRecord>[] = [
    {
      key: "orderNumber",
      label: "Order",
      sortable: true,
      render: (order) => (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-border/70 bg-background text-muted-foreground/80">
            <FileText className="h-[18px] w-[18px] stroke-[1.9]" />
          </span>
          <div>
            <div className="font-medium text-foreground">{order.orderNumber}</div>
            <div className="text-xs text-muted-foreground">{order.createdBy?.name ?? "System"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      sortable: true,
      render: (order) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground/70" />
          <span>{order.supplier?.name ?? "Unassigned"}</span>
        </div>
      ),
    },
    {
      key: "lines",
      label: "Lines",
      sortable: true,
      render: (order) => (
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-muted-foreground/70" />
          <span className="tabular-nums">{order.lines.length}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (order) => (
        <Badge variant="info">
          <span className="inline-flex items-center gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            {order.status}
          </span>
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (order) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          {order.status === "SENT" || order.status === "PARTIALLY_RECEIVED" ? (
            <Button variant="outline" size="sm" className="gap-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40" onClick={() => onReceive(order)}>
              <PackageCheck className="h-4 w-4" />
              Receive
            </Button>
          ) : null}
          <DeleteConfirmButton itemName={order.orderNumber} onConfirm={() => onDelete(order)} buttonLabel="Delete" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeroPanel
        badge="Buying flow"
        title="Purchase orders"
        description="Keep procurement traceable from draft to receipt."
        note="Use purchase orders to keep supplier commitments, item counts, and receiving status visible."
        animationData={shoppingAnimation}
        reverse
        action={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New order
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Order register</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoader label="Loading purchase orders…" />
          ) : error ? (
            <EmptyState title="Unable to load purchase orders" description={error} icon={<ShoppingCart className="h-6 w-6" />} />
          ) : purchaseOrders?.length ? (
            <DataTable
              data={purchaseOrders}
              columns={columns}
              keyExtractor={(order) => order.id}
              emptyMessage="No purchase orders created"
            />
          ) : (
            <EmptyState
              title="No purchase orders created"
              description="Purchase orders will appear here when procurement starts flowing."
              icon={<ShoppingCart className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
