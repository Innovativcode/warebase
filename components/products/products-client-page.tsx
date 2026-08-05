import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { DeleteConfirmButton } from "@/components/layout/delete-confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Package, Pencil, Plus, ArrowUpDown, Box, CheckCircle2, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { workspaceHref } from "@/lib/workspace";
import type { ProductRecord } from "@/lib/types";
import { InlineLoader } from "@/components/loader/warebase-loader";
import automationAnimation from "@/assets/lottie/automation.json";

type ProductsClientPageProps = {
  products: ProductRecord[] | null;
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onEdit: (product: ProductRecord) => void;
  onDelete: (product: ProductRecord) => void;
};

export function ProductsClientPage({ products, loading, error, onCreate, onEdit, onDelete }: ProductsClientPageProps) {
  const router = useRouter();
  const params = useParams<{ staffId?: string }>();

  const openProduct = (product: ProductRecord) => {
    router.push(workspaceHref(params.staffId, `/products/${product.id}`));
  };

  const columns: Column<ProductRecord>[] = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (product) => (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center overflow-hidden rounded-[0.85rem] border border-border/70 bg-background">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-[18px] w-[18px] stroke-[1.9] text-muted-foreground/80" />
            )}
          </span>
          <div>
            <Link
              href={workspaceHref(params.staffId, `/products/${product.id}`)}
              className="font-medium text-foreground hover:underline"
            >
              {product.name}
            </Link>
            <div className="text-xs text-muted-foreground">{product.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: "barcode",
      label: "Barcode",
      sortable: true,
      render: (product) =>
        product.barcode ? (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[0.75rem] border border-border bg-background text-muted-foreground/80">
              <ScanBarcode className="h-4 w-4 stroke-[2]" />
            </span>
            <span className="font-mono text-sm text-foreground">{product.barcode}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: "quantityOnHand",
      label: "Availability",
      sortable: true,
      render: (product) => (
        <>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground/70" />
            <span className="tabular-nums">{product.quantityOnHand} on hand</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Box className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="tabular-nums">{product.availableQty} available</span>
          </div>
        </>
      ),
    },
    {
      key: "reorderPoint",
      label: "Reorder",
      sortable: true,
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (product) => (
        <Badge variant={product.isActive ? "success" : "secondary"}>
          {product.isActive ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </span>
          ) : (
            "Inactive"
          )}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (product) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <DeleteConfirmButton itemName={product.name} onConfirm={() => onDelete(product)} buttonLabel="Delete" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeroPanel
        badge="Catalog discipline"
        title="Catalog"
        description="Maintain a clean product master with operational quantities and reorder intelligence."
        note="The catalog is where reorder signals, supplier links, and stock visibility stay aligned."
        animationData={automationAnimation}
        action={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New product
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Product register</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoader label="Loading catalog…" />
          ) : error ? (
            <EmptyState title="Unable to load products" description={error} icon={<Package className="h-6 w-6" />} />
          ) : products?.length ? (
            <DataTable
              data={products}
              columns={columns}
              keyExtractor={(product) => product.id}
              emptyMessage="No products created"
              onRowClick={openProduct}
            />
          ) : (
            <EmptyState
              title="No products created"
              description="Create products through the backend API to start populating the catalog."
              icon={<Package className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
