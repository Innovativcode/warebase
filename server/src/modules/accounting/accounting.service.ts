import { prisma } from "@/db/prisma";
import { Prisma, type TransactionType } from "@prisma/client";

type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string | null;
  reference?: string | null;
  currency?: string;
  occurredAt?: Date;
  createdByUserId?: string | null;
  businessId?: string | null;
};

const MONTHLY_LABELS: { month: number; label: string }[] = Array.from({ length: 12 }, (_, index) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (11 - index));
  return { month: date.getMonth(), label: date.toLocaleString("en-US", { month: "short" }) };
});

const YEAR_LABEL = new Date().getFullYear();

export const createTransaction = async (input: CreateTransactionInput) => {
  const amount = new Prisma.Decimal(input.amount.toFixed(2));
  if (amount.isNegative()) {
    throw new Error("Amount must be positive");
  }

  return prisma.transaction.create({
    data: {
      type: input.type,
      amount,
      currency: input.currency ?? "USD",
      category: input.category,
      description: input.description ?? null,
      reference: input.reference ?? null,
      occurredAt: input.occurredAt ?? new Date(),
      createdByUserId: input.createdByUserId ?? null,
      businessId: input.businessId ?? null,
    },
  });
};

export const listTransactions = async (options?: {
  type?: TransactionType | null;
  limit?: number;
  offset?: number;
  businessId?: string | null;
}) => {
  const where: Prisma.TransactionWhereInput = {
    ...(options?.businessId ? { businessId: options.businessId } : {}),
    ...(options?.type ? { type: options.type } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        category: true,
        description: true,
        reference: true,
        occurredAt: true,
        createdAt: true,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total };
};

export const getAccountingSummary = async (options?: { businessId?: string | null }) => {
  const where: Prisma.TransactionWhereInput = options?.businessId ? { businessId: options.businessId } : {};

  const [income, expense, recent] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: "INCOME" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: 8,
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        category: true,
        description: true,
        reference: true,
        occurredAt: true,
      },
    }),
  ]);

  const incomeTotal = income._sum.amount ?? new Prisma.Decimal(0);
  const expenseTotal = expense._sum.amount ?? new Prisma.Decimal(0);
  const net = incomeTotal.minus(expenseTotal);

  const yearStart = new Date(YEAR_LABEL, 0, 1);
  const yearEnd = new Date(YEAR_LABEL + 1, 0, 1);

  const byTypeMonth = await prisma.transaction.groupBy({
    by: ["type", "occurredAt"],
    where: {
      ...where,
      occurredAt: { gte: yearStart, lt: yearEnd },
    },
    _sum: { amount: true },
  });

  const trendMap: Record<number, { income: number; expense: number }> = {};
  for (const row of byTypeMonth) {
    const month = row.occurredAt.getMonth();
    const bucket = trendMap[month] ?? { income: 0, expense: 0 };
    const value = Number(row._sum.amount ?? 0);
    if (row.type === "INCOME") {
      bucket.income += value;
    } else {
      bucket.expense += value;
    }
    trendMap[month] = bucket;
  }

  const monthlyTrend = MONTHLY_LABELS.map(({ month, label }) => ({
    month: label,
    income: trendMap[month]?.income ?? 0,
    expense: trendMap[month]?.expense ?? 0,
  }));

  return {
    totals: {
      income: Number(incomeTotal),
      expense: Number(expenseTotal),
      net: Number(net),
      incomeCount: income._count,
      expenseCount: expense._count,
    },
    recent,
    monthlyTrend,
  };
};
