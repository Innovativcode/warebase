"use client";

import { useCallback } from "react";
import { DashboardClientPage } from "@/components/dashboard/dashboard-client-page";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { useRealtimeEvent } from "@/hooks/use-realtime";

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardSummary();

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  useRealtimeEvent("dashboard:updated", refresh);
  useRealtimeEvent("stock:moved", refresh);
  useRealtimeEvent("purchase-order:created", refresh);
  useRealtimeEvent("purchase-order:updated", refresh);
  useRealtimeEvent("purchase-order:deleted", refresh);
  useRealtimeEvent("approval:created", refresh);
  useRealtimeEvent("approval:reviewed", refresh);

  return <DashboardClientPage summary={data?.data ?? null} loading={loading} error={error} />;
}
