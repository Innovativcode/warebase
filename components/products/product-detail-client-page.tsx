"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  Boxes,
  CheckCircle2,
  Flag,
  Package,
  Pencil,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { ProductDialog } from "@/components/forms/product-dialog";
import { ProductBarcode } from "@/components/products/product-barcode";
import { useResource } from "@/hooks/use-resource";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useCurrentUser } from "@/hooks/use-current-user";
import { apiFetch, blockProduct, flagProduct, unblockProduct } from "@/lib/api";
import { workspaceHref } from "@/lib/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { InlineLoader } from "@/components/loader/warebase-loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ApiResult, ProductRecord } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

export function ProductDetailClientPage({ id }: { id: string }) {
  const { data, loading, error, refetch } = useResource<ApiResult<ProductRecord>>(`/products/${id}`);
  const suppliers = useSuppliers();
  const { data: currentUser } = useCurrentUser();
  const params = useParams<{ staffId?: string }>();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [acting, setActing] = useState(false);

  const product = data?.data ?? null;
  const permissions = currentUser?.data?.permissions ?? [];
  const canWrite = permissions.includes("write");
  const canDelete = permissions.includes("delete");
  const catalogHref = workspaceHref(params.staffId, "/products");

  const handleFlag = async () => {
    if (!product) return;
    setActing(true);
    try {
      await flagProduct(product.id, "Flagged from product details");
      toast.success("Product flagged");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to flag product");
    } finally {
      setActing(false);
    }
  };

  const handleBlock = async () => {
    if (!product) return;
    setActing(true);
    try {
      await blockProduct(product.id);
      toast.success("Product blocked");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to block product");
    } finally {
      setActing(false);
    }
  };

  const handleUnblock = async () => {
    if (!product) return;
    setActing(true);
    try {
      await unblockProduct(product.id);
      toast.success("Product unblocked");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to unblock product");
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    setActing(true);
    try {
      await apiFetch(`/products/${product.id}`, { method: "DELETE" });
      toast.success("Product deleted");
      router.push(catalogHref);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete product");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <InlineLoader label="Loading product…" />;
  }

  if (error || !product) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            title="Unable to load product"
            description={error ?? "Product not found."}
            icon={<Package className="h-6 w-6" />}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
          <Link href={catalogHref}>
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="space-y-4">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1.25rem] border border-border bg-muted/30">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-10 w-10" />
                  <span className="text-sm">No image uploaded</span>
                </div>
              )}
            </div>
            <ProductBarcode value={product.barcode} />
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">{product.name}</h1>
                  <Badge variant={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {product.flaggedAt ? (
                    <Badge variant="warning">
                      <TriangleAlert className="mr-1 h-3.5 w-3.5" />
                      Flagged
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">SKU: {product.sku}</span>
                  {product.barcode ? <span className="font-mono">Barcode: {product.barcode}</span> : null}
                </div>
                {product.category || product.supplier ? (
                  <div className="flex flex-wrap gap-2">
                    {product.category ? <Badge variant="outline">{product.category.name}</Badge> : null}
                    {product.supplier ? <Badge variant="outline">{product.supplier.name}</Badge> : null}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {canWrite ? (
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                ) : null}
                {canDelete ? (
                  product.isActive ? (
                    <>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => void handleFlag()} disabled={acting}>
                        <Flag className="h-4 w-4" />
                        Flag
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-2" onClick={() => void handleBlock()} disabled={acting}>
                        <Ban className="h-4 w-4" />
                        Block
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => void handleUnblock()} disabled={acting}>
                      <RefreshCw className="h-4 w-4" />
                      Unblock
                    </Button>
                  )
                ) : null}
              </div>
            </div>

            {product.description ? (
              <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
            ) : null}

            {product.flaggedReason ? (
              <div className="flex items-start gap-2 rounded-[0.95rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{product.flaggedReason}</span>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[1rem] border border-border bg-background p-4">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  <Boxes className="h-3.5 w-3.5" />
                  On hand
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{numberFormatter.format(product.quantityOnHand)}</p>
              </div>
              <div className="rounded-[1rem] border border-border bg-background p-4">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Available
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-700">{numberFormatter.format(product.availableQty)}</p>
              </div>
              <div className="rounded-[1rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Reserved</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{numberFormatter.format(product.reservedQty)}</p>
              </div>
              <div className="rounded-[1rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Reorder point</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{numberFormatter.format(product.reorderPoint)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Warehouse breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {product.inventoryItems?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">On hand</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.inventoryItems.map((item) => (
                  <TableRow key={item.warehouse.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] border border-border bg-background text-muted-foreground/80">
                          <Warehouse className="h-4 w-4 stroke-[2]" />
                        </span>
                        <div>
                          <div className="font-medium text-foreground">{item.warehouse.name}</div>
                          <div className="text-xs text-muted-foreground">{item.warehouse.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{numberFormatter.format(item.quantityOnHand)}</TableCell>
                    <TableCell className="text-right tabular-nums">{numberFormatter.format(item.availableQty)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No inventory yet"
              description="This product exists in the catalog but has not been stocked into a warehouse."
              icon={<Warehouse className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        mode="edit"
        product={product}
        suppliers={suppliers.data?.data ?? null}
        onOpenChange={setDialogOpen}
        onSaved={refetch}
      />
    </>
  );
}
