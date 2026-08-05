export class ApiClientError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload && "error" in payload
      ? String((payload as { error?: { message?: string } }).error?.message ?? "Request failed")
      : response.statusText || "Request failed";
    throw new ApiClientError(message, response.status, payload);
  }

  return payload as T;
}

import type {
  AccountingSummary,
  ActivityRecord,
  ApiResult,
  ProductRecord,
  PurchaseOrderRecord,
  ReceiveInput,
  RestockInput,
  StockLevelRecord,
  TransactionInput,
  TransactionRecord,
} from "./types";

export function fetchStockLevels() {
  return apiFetch<ApiResult<StockLevelRecord[]>>("/inventory/stock");
}

export function restockProduct(input: RestockInput) {
  return apiFetch<ApiResult<PurchaseOrderRecord>>("/inventory/restock", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function receivePurchaseOrder(id: string, input: ReceiveInput = {}) {
  return apiFetch<ApiResult<PurchaseOrderRecord>>(`/inventory/purchase-orders/${id}/receive`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchAccountingSummary() {
  return apiFetch<ApiResult<AccountingSummary>>("/accounting/summary");
}

export function listTransactions(options: { type?: "INCOME" | "EXPENSE"; limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams();
  if (options.type) params.set("type", options.type);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset));
  const query = params.toString();
  return apiFetch<ApiResult<{ items: TransactionRecord[]; total: number }>>(
    `/accounting/transactions${query ? `?${query}` : ""}`,
  );
}

export function createTransaction(input: TransactionInput) {
  return apiFetch<ApiResult<TransactionRecord>>("/accounting/transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listActivities(options: { limit?: number } = {}) {
  const query = options.limit ? `?limit=${options.limit}` : "";
  return apiFetch<ApiResult<ActivityRecord[]>>(`/activities${query}`);
}

export function flagProduct(id: string, reason?: string) {
  return apiFetch<ApiResult<ProductRecord>>(`/products/${id}/flag`, {
    method: "POST",
    body: JSON.stringify({ reason: reason ?? null }),
  });
}

export function blockProduct(id: string) {
  return apiFetch<ApiResult<ProductRecord>>(`/products/${id}/block`, {
    method: "POST",
  });
}

export function unblockProduct(id: string) {
  return apiFetch<ApiResult<ProductRecord>>(`/products/${id}/unblock`, {
    method: "POST",
  });
}
