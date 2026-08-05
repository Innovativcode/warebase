"use client";

import { useMemo } from "react";
import { useEffect } from "react";
import { Coins, TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useResource } from "@/hooks/use-resource";
import { useCurrentUser } from "@/hooks/use-current-user";
import { subscribeRealtime } from "@/lib/realtime";
import type { ApiResult, AccountingSummary } from "@/lib/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function FinanceOverviewInner() {
  const { data, loading, error, refetch } = useResource<ApiResult<AccountingSummary>>("/accounting/summary");

  useEffect(() => {
    return subscribeRealtime("activity:new", () => {
      void refetch();
    });
  }, [refetch]);

  const summary = data?.data ?? null;
  const trend = useMemo(() => {
    if (!summary) {
      return [];
    }
    return [...summary.monthlyTrend].slice(-6).map((entry) => ({
      month: entry.month,
      Net: entry.income - entry.expense,
    }));
  }, [summary]);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Finance at a glance</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">A compact summary of recorded income and expenses.</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Coins className="h-3.5 w-3.5" />
          Ledger
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-[1rem]" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : summary ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-emerald-700">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Income
                </div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-emerald-700">{formatMoney(summary.totals.income)}</div>
              </div>
              <div className="rounded-[1rem] border border-rose-200 bg-rose-50/60 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-rose-700">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Expenses
                </div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-rose-700">{formatMoney(summary.totals.expense)}</div>
              </div>
              <div
                className={`rounded-[1rem] border px-4 py-3 ${
                  summary.totals.net >= 0 ? "border-sky-200 bg-sky-50/60" : "border-amber-200 bg-amber-50/60"
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] ${
                    summary.totals.net >= 0 ? "text-sky-700" : "text-amber-700"
                  }`}
                >
                  <Coins className="h-3.5 w-3.5" />
                  Net
                </div>
                <div
                  className={`mt-1 text-xl font-semibold tabular-nums ${summary.totals.net >= 0 ? "text-sky-700" : "text-amber-700"}`}
                >
                  {formatMoney(summary.totals.net)}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Net movement — last 6 months</p>
              {trend.length ? (
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                      <Bar dataKey="Net" radius={[6, 6, 0, 0]}>
                        {trend.map((entry) => (
                          <Cell key={entry.month} fill={entry.Net >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No ledger data available yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function FinanceOverview() {
  const { data: currentUser } = useCurrentUser();
  const canRead = currentUser?.data?.permissions?.includes("accounting:read") ?? false;

  if (!canRead) {
    return null;
  }

  return <FinanceOverviewInner />;
}
