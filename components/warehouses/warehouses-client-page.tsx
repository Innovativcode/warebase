import { AppShell } from "@/components/layout/app-shell";
import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { DeleteConfirmButton } from "@/components/layout/delete-confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Warehouse, Boxes, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WarehouseRecord } from "@/lib/types";
import { InlineLoader } from "@/components/loader/warebase-loader";
import inventoryAnimation from "@/assets/lottie/Inventory.json";

type WarehousesClientPageProps = {
  warehouses: WarehouseRecord[] | null;
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onEdit: (warehouse: WarehouseRecord) => void;
  onDelete: (warehouse: WarehouseRecord) => void;
};

export function WarehousesClientPage({ warehouses, loading, error, onCreate, onEdit, onDelete }: WarehousesClientPageProps) {
  return (
    <AppShell title="Warehouses" description="Track stock by location, primary fulfillment hubs, and warehouse-level movement flow.">
      <PageHeroPanel
        badge="Location control"
        title="Warehouses"
        description="Operational storage locations with inventory distribution across the network."
        note="Keep fulfillment hubs, primary storage, and secondary locations easy to understand."
        animationData={inventoryAnimation}
        action={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New warehouse
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Location register</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoader label="Loading warehouses…" />
          ) : error ? (
            <EmptyState title="Unable to load warehouses" description={error} icon={<Warehouse className="h-6 w-6" />} />
          ) : warehouses?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Inventory lines</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-border/70 bg-background text-muted-foreground/80">
                          <Warehouse className="h-[18px] w-[18px] stroke-[1.9]" />
                        </span>
                        <div>
                          <div className="font-medium text-foreground">{warehouse.name}</div>
                          <div className="text-xs text-muted-foreground">{warehouse.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-muted-foreground/70" />
                        <span className="tabular-nums">{warehouse.inventoryItems.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={warehouse.isPrimary ? "info" : "secondary"}>
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {warehouse.isPrimary ? "Primary" : "Secondary"}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(warehouse)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <DeleteConfirmButton itemName={warehouse.name} onConfirm={() => onDelete(warehouse)} buttonLabel="Delete" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No warehouses created"
              description="Add warehouse records in the backend to start distributing inventory by location."
              icon={<Warehouse className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
