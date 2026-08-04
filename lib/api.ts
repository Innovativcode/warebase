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

import type { ApiResult, PurchaseOrderRecord, ReceiveInput, RestockInput, StockLevelRecord } from "./types";

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
