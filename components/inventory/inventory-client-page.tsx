import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ArrowRightLeft, Boxes, Loader2, PackageOpen, Plus, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { LottiePlayer } from "@/components/media/lottie-player";
import inventoryAnimation from "@/assets/lottie/Inventory.json";
import type { MovementRecord, StockLevelRecord } from "@/lib/types";
import { InlineLoader } from "@/components/loader/warebase-loader";

type InventoryClientPageProps = {
  movements: MovementRecord[] | null;
  stockLevels: StockLevelRecord[] | null;
  stockLevelsLoading: boolean;
  loading: boolean;
  error: string | null;
  restocking: boolean;
  onRestock: (productId: string) => void;
  onCreate: () => void;
};

export function InventoryClientPage({
  movements,
  stockLevels,
  stockLevelsLoading,
  loading,
  error,
  restocking,
  onRestock,
  onCreate,
}: InventoryClientPageProps) {
  const lowStock = stockLevels?.filter((item) => item.availableQty <= item.product.reorderPoint) ?? [];

  return (
    <AppShell title="Inventory movements" description="Audit every stock change across warehouses and products.">
      <PageHeader
        title="Inventory flow"
        description="Operational stock movement ledger."
        action={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Record movement
          </Button>
        }
      />

      <Card className="mb-6 border-amber-600/30 bg-amber-50/40 dark:bg-amber-950/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Low stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stockLevelsLoading ? (
            <InlineLoader label="Loading stock levels…" />
          ) : lowStock.length ? (
            <div className="space-y-2">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-[0.95rem] border border-amber-600/20 bg-background px-4 py-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] border border-border bg-background text-amber-600">
                    <PackageOpen className="h-5 w-5 stroke-[1.9]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.sku} · reorder at {item.product.reorderPoint}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium tabular-nums text-foreground">{item.availableQty}</span>
                    <span className="text-muted-foreground"> / {item.quantityOnHand} on hand</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-amber-600/40 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-950"
                    onClick={() => onRestock(item.productId)}
                    disabled={restocking}
                  >
                    {restocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-[0.95rem] border border-border/60 bg-background p-3 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-muted-foreground/50" />
              All stocked products are above their reorder points.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[0.9rem] border border-border bg-background p-4">
            <LottiePlayer
              animationData={inventoryAnimation}
              className="h-[220px] w-full"
              preserveAspectRatio="xMidYMid meet"
            />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-xl">Stock movement at a glance</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              This ledger captures receiving, issuing, transfers, and adjustments with a permanent audit trail.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Use the record movement action when stock changes need to be posted against the inventory balance.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoader label="Loading inventory movements…" />
          ) : error ? (
            <EmptyState title="Unable to load inventory movements" description={error} icon={<Boxes className="h-6 w-6" />} />
          ) : movements?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Warehouse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-border/70 bg-background text-muted-foreground/80">
                          {movement.type === "IN" ? (
                            <TrendingUp className="h-[18px] w-[18px] stroke-[1.9]" />
                          ) : movement.type === "OUT" ? (
                            <TrendingDown className="h-[18px] w-[18px] stroke-[1.9]" />
                          ) : (
                            <ArrowRightLeft className="h-[18px] w-[18px] stroke-[1.9]" />
                          )}
                        </span>
                        <div>
                          <div className="font-medium text-foreground">{movement.product.name}</div>
                          <div className="text-xs text-muted-foreground">{movement.product.sku}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={movement.type === "IN" ? "success" : movement.type === "OUT" ? "danger" : "info"}>
                        {movement.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{movement.quantity}</TableCell>
                    <TableCell>{movement.destinationWarehouse?.name ?? movement.sourceWarehouse?.name ?? "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No movements recorded"
              description="Once stock is received, issued, transferred, or adjusted, the ledger will appear here."
              icon={<Boxes className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
