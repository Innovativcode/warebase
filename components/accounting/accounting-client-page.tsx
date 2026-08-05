"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, Wallet, Landmark, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/layout/stat-card";
import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionDialog } from "@/components/accounting/transaction-dialog";
import { PermissionGate } from "@/components/auth/permission-gate";
import { useResource } from "@/hooks/use-resource";
import type { AccountingSummary, ApiResult, TransactionRecord } from "@/lib/types";
import automationAnimation from "@/assets/lottie/automation.json";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type TransactionsState = {
  items: TransactionRecord[];
  total: number;
};

export function AccountingClientPage() {
  const { data: summaryData } = useResource<ApiResult<AccountingSummary>>("/accounting/summary");
  const { data: transactionsData } = useResource<ApiResult<TransactionsState>>("/accounting/transactions?limit=50");
  const [dialogOpen, setDialogOpen] = useState(false);

  const summary: AccountingSummary | null = useMemo(() => summaryData?.data ?? null, [summaryData]);
  const transactions: TransactionsState = useMemo(
    () => transactionsData?.data ?? { items: [], total: 0 },
    [transactionsData],
  );

  const netPositive = (summary?.totals.net ?? 0) >= 0;

  return (
    <>
      <PageHeroPanel
        badge="Finance"
        title="Accounting"
        description="Track income, expenses, and cash flow alongside your inventory operations."
        note="Record transactions and follow how money moves through the operation."
        animationData={automationAnimation}
        animationClassName="lg:max-w-[360px] lg:justify-self-end"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">All figures in USD. Book a transaction to keep the ledger current.</p>
        <PermissionGate permission="accounting:manage">
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Record transaction
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Income"
          value={summary ? currencyFormatter.format(summary.totals.income) : "$0"}
          hint={`${summary?.totals.incomeCount ?? 0} income entries`}
          tone="success"
          iconClassName="bg-emerald-50 text-emerald-700"
          icon={<ArrowUpRight className="h-[18px] w-[18px] text-emerald-700" />}
        />
        <StatCard
          label="Expenses"
          value={summary ? currencyFormatter.format(summary.totals.expense) : "$0"}
          hint={`${summary?.totals.expenseCount ?? 0} expense entries`}
          tone="danger"
          iconClassName="bg-rose-50 text-rose-700"
          icon={<ArrowDownRight className="h-[18px] w-[18px] text-rose-700" />}
        />
        <StatCard
          label="Net cash flow"
          value={summary ? currencyFormatter.format(summary.totals.net) : "$0"}
          hint={netPositive ? "Running positive" : "Running negative"}
          iconClassName={netPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}
          icon={<TrendingUp className={`h-[18px] w-[18px] ${netPositive ? "text-emerald-700" : "text-rose-700"}`} />}
        />
        <StatCard
          label="Transactions"
          value={summary ? summary.totals.incomeCount + summary.totals.expenseCount : 0}
          hint="Booked entries"
          iconClassName="bg-sky-50 text-sky-700"
          icon={<Landmark className="h-[18px] w-[18px] text-sky-700" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Monthly cash flow</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Income against expenses for the current year.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {summary?.monthlyTrend?.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.monthlyTrend} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No cash flow yet"
                description="Record income and expenses to see monthly trends here."
                icon={<Wallet className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent activity</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Latest booked income and expenses.</p>
            </div>
          </CardHeader>
          <CardContent>
            {summary?.recent?.length ? (
              <div className="space-y-2">
                {summary.recent.map((transaction) => {
                  const isIncome = transaction.type === "INCOME";
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 rounded-[0.95rem] border border-border bg-background p-3"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] ${
                          isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{transaction.category}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {transaction.description ?? transaction.reference ?? "No description"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold tabular-nums ${isIncome ? "text-emerald-700" : "text-rose-700"}`}>
                          {isIncome ? "+" : "−"}
                          {currencyFormatter.format(Number(transaction.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.occurredAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No transactions yet"
                description="Record your first income or expense to start the ledger."
                icon={<Wallet className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>All transactions</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {transactions.total} booked entries, newest first.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.items.length ? (
            <div className="space-y-2">
              {transactions.items.map((transaction) => {
                const isIncome = transaction.type === "INCOME";
                return (
                  <div
                    key={transaction.id}
                    className="flex flex-wrap items-center gap-3 rounded-[0.95rem] border border-border/70 bg-muted/25 p-3"
                  >
                    <Badge variant={isIncome ? "success" : "danger"} className="gap-1.5">
                      {isIncome ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {isIncome ? "Income" : "Expense"}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{transaction.category}</span>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {new Date(transaction.occurredAt).toLocaleDateString()}
                    </span>
                    <span className={`text-sm font-semibold tabular-nums ${isIncome ? "text-emerald-700" : "text-rose-700"}`}>
                      {isIncome ? "+" : "−"}
                      {currencyFormatter.format(Number(transaction.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No transactions booked"
              description="Use Record transaction to add income or expenses."
              icon={<Wallet className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
