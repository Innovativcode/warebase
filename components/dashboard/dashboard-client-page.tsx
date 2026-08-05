import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/layout/stat-card";
import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import {
  Activity,
  ArrowRightLeft,
  Boxes,
  Clock3,
  Package,
  Truck,
  Warehouse,
  Users2,
  Workflow,
  ScanSearch,
} from "lucide-react";
import type { DashboardSummary } from "@/lib/types";
import { FinanceOverview } from "@/components/dashboard/finance-overview";
import { LiveActivityFeed } from "@/components/dashboard/live-activity-feed";
import automationAnimation from "@/assets/lottie/automation.json";

type DashboardClientPageProps = {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
};

const movementTone: Record<"IN" | "OUT" | "ADJUSTMENT" | "TRANSFER", { label: string; icon: typeof Truck; className: string }> = {
  IN: { label: "Receipt", icon: Truck, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  OUT: { label: "Issue", icon: Truck, className: "border-rose-200 bg-rose-50 text-rose-700" },
  ADJUSTMENT: { label: "Adjustment", icon: Package, className: "border-violet-200 bg-violet-50 text-violet-700" },
  TRANSFER: { label: "Transfer", icon: ArrowRightLeft, className: "border-sky-200 bg-sky-50 text-sky-700" },
};

const statIconStyles = {
  products: "bg-emerald-50 text-emerald-700",
  warehouses: "bg-sky-50 text-sky-700",
  suppliers: "bg-violet-50 text-violet-700",
  projects: "bg-amber-50 text-amber-700",
} as const;

const movementPalette = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--info))"];
const lowStockPalette = ["hsl(var(--primary))", "hsl(var(--warning))"];
const governancePalette = ["hsl(var(--primary))", "hsl(var(--info))"];

export function DashboardClientPage({ summary, loading, error }: DashboardClientPageProps) {
  const recentMovements = useMemo(() => summary?.recentMovements ?? [], [summary?.recentMovements]);
  const movementTrend = summary?.charts.movementTrend ?? [];
  const movementMix = summary?.charts.movementMix ?? [];
  const lowStockPressure = summary?.charts.lowStockPressure ?? [];
  const governance = summary?.charts.governance ?? { approvalsPending: 0, notificationsUnread: 0 };

  return (
    <>
      <PageHeroPanel
        badge="Control center"
        title="Operations dashboard"
        description="Track stock health, purchasing flow and recent inventory movement from a calm, information-dense workspace."
        note="Use the dashboard to monitor movement, stock risk, and open activity across the operation."
        animationData={automationAnimation}
        animationClassName="lg:max-w-[360px] lg:justify-self-end"
      />

      {error ? (
        <div className="mb-6 flex items-start gap-3 rounded-[1rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Products"
          value={summary?.totals.products ?? 0}
          hint="Active catalog items"
          iconClassName={statIconStyles.products}
          icon={<Package className="h-[18px] w-[18px] text-emerald-700" />}
        />
        <StatCard
          label="Warehouses"
          value={summary?.totals.warehouses ?? 0}
          hint="Stock locations"
          tone="default"
          iconClassName={statIconStyles.warehouses}
          icon={<Warehouse className="h-[18px] w-[18px] text-sky-700" />}
        />
        <StatCard
          label="Suppliers"
          value={summary?.totals.suppliers ?? 0}
          hint="Approved vendors"
          tone="success"
          iconClassName={statIconStyles.suppliers}
          icon={<Users2 className="h-[18px] w-[18px] text-violet-700" />}
        />
        <StatCard
          label="Active projects"
          value={summary?.totals.activeProjects ?? 0}
          hint="Open workstreams"
          tone="warning"
          iconClassName={statIconStyles.projects}
          icon={<Workflow className="h-[18px] w-[18px] text-amber-700" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Movement trend</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">A classic line view of inbound, outbound, adjustments, and transfers.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {movementTrend.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={movementTrend} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inbound" stroke={movementPalette[0]} strokeWidth={2.2} dot={false} />
                    <Line type="monotone" dataKey="outbound" stroke={movementPalette[1]} strokeWidth={2.2} dot={false} />
                    <Line type="monotone" dataKey="adjustments" stroke={movementPalette[2]} strokeWidth={2.2} dot={false} />
                    <Line type="monotone" dataKey="transfers" stroke={movementPalette[3]} strokeWidth={2.2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No movement data"
                description="As inventory activity starts, this chart will show inbound and outbound trends."
                icon={<Activity className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Movement mix</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">A compact mix view for recent movement distribution.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {movementMix.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie data={movementMix} dataKey="value" nameKey="type" innerRadius={48} outerRadius={88} paddingAngle={3}>
                      {movementMix.map((entry, index) => (
                        <Cell key={entry.type} fill={movementPalette[index % movementPalette.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No movement mix yet"
                description="Movement categories will appear here once stock starts flowing through the system."
                icon={<Activity className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Low stock pressure</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Products closest to reorder pressure, arranged like a traditional report chart.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {lowStockPressure.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lowStockPressure} layout="vertical" margin={{ top: 10, right: 8, left: 16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis dataKey="sku" type="category" tickLine={false} axisLine={false} fontSize={12} width={96} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalOnHand" name="On hand" fill="hsl(var(--primary))" radius={[0, 10, 10, 0]} />
                    <Bar dataKey="gap" name="Gap to reorder" fill="hsl(var(--warning))" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No low stock items"
                description="When inventory crosses the threshold, items will surface here."
                icon={<Boxes className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Governance queue</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Open approvals and unread notifications in a simple classic donut.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {summary ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={[
                        { label: "Approvals", value: governance.approvalsPending },
                        { label: "Notifications", value: governance.notificationsUnread },
                      ]}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={46}
                      outerRadius={86}
                      paddingAngle={4}
                    >
                      {governancePalette.map((color) => (
                        <Cell key={color} fill={color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No governance data"
                description="Approvals and notifications will appear here once the workflow starts."
                icon={<ScanSearch className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>

        <FinanceOverview />
      </div>

      <div className="mt-6">
        <LiveActivityFeed />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Recent movement timeline</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">A chronological ledger of inventory changes with direct route context.</p>
          </div>
        </CardHeader>
        <CardContent>
          {recentMovements.length ? (
            <div className="space-y-0">
              {recentMovements.map((movement, index) => {
                const tone = movementTone[movement.type];
                const Icon = tone.icon;
                const route = movement.sourceWarehouse?.name && movement.destinationWarehouse?.name
                  ? `${movement.sourceWarehouse.name} → ${movement.destinationWarehouse.name}`
                  : movement.destinationWarehouse?.name
                    ? `Into ${movement.destinationWarehouse.name}`
                    : movement.sourceWarehouse?.name
                      ? `From ${movement.sourceWarehouse.name}`
                      : "System generated";

                return (
                  <div key={movement.id} className="relative pl-12">
                    {index < recentMovements.length - 1 ? <span className="absolute left-[1.35rem] top-12 h-full w-px bg-border/70" /> : null}
                    <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-none">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${tone.className}`}>
                        <Icon size={18} />
                      </span>
                    </div>
                    <div className="pb-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{movement.product.name}</span>
                        <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{tone.label}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-mono text-xs text-muted-foreground">{movement.product.sku}</span>
                        <span className="inline-flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5" />
                          {route}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(movement.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-[auto_auto_1fr] sm:items-center">
                        <span className="text-sm font-medium tabular-nums text-foreground">{movement.quantity}</span>
                        <span className="text-sm text-muted-foreground">units</span>
                        <span className="text-sm text-muted-foreground">{movement.reason ?? "No reason supplied."}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No stock movements yet" description="Stock changes will appear once transactions start flowing." icon={<ArrowRightLeft className="h-6 w-6" />} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
