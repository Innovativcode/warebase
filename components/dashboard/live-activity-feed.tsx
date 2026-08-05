"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Ban,
  Coins,
  Flag,
  PackageCheck,
  ScanSearch,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import { subscribeRealtime } from "@/lib/realtime";
import { listActivities } from "@/lib/api";
import type { ActivityRecord, ActivityType } from "@/lib/types";

const ACTIVITY_TONES: Record<ActivityType, { label: string; icon: typeof Activity; className: string }> = {
  SCAN: { label: "Scan", icon: ScanSearch, className: "border-teal-200 bg-teal-50 text-teal-700" },
  FLAG: { label: "Flagged", icon: Flag, className: "border-amber-200 bg-amber-50 text-amber-700" },
  BLOCK: { label: "Blocked", icon: Ban, className: "border-rose-200 bg-rose-50 text-rose-700" },
  UNBLOCK: { label: "Unblocked", icon: Ban, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  RESTOCK: { label: "Restock", icon: Truck, className: "border-sky-200 bg-sky-50 text-sky-700" },
  STOCK_IN: { label: "Stock in", icon: ArrowDownToLine, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  STOCK_OUT: { label: "Stock out", icon: ArrowUpFromLine, className: "border-rose-200 bg-rose-50 text-rose-700" },
  APPROVAL: { label: "Approval", icon: ShieldCheck, className: "border-violet-200 bg-violet-50 text-violet-700" },
  FINANCE: { label: "Finance", icon: Coins, className: "border-green-200 bg-green-50 text-green-700" },
  USER: { label: "User", icon: UserRound, className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  SYSTEM: { label: "System", icon: Wrench, className: "border-slate-200 bg-slate-50 text-slate-700" },
};

const REFRESH_INTERVAL_MS = 15_000;

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await listActivities({ limit: 25 });
      setActivities(result.data ?? []);
    } catch {
      setActivities((current) => current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    timerRef.current = setInterval(() => {
      void load();
    }, REFRESH_INTERVAL_MS);

    const unsubscribe = subscribeRealtime("activity:new", () => {
      setLive(true);
      void load();
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      unsubscribe();
    };
  }, [load]);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Live activity feed</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Scans, flags, blocks, finance and system events as they happen.</p>
        </div>
        <Badge variant={live ? "success" : "secondary"} className={live ? "gap-1.5" : "gap-1.5"}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          {live ? "Live" : "Connected"}
        </Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length ? (
          <div className="space-y-0">
            {activities.map((activity, index) => {
              const tone = ACTIVITY_TONES[activity.type] ?? ACTIVITY_TONES.SYSTEM;
              const Icon = tone.icon;
              return (
                <div key={activity.id} className="relative pl-12">
                  {index < activities.length - 1 ? <span className="absolute left-[1.35rem] top-12 h-full w-px bg-border/70" /> : null}
                  <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-none">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${tone.className}`}>
                      <Icon size={16} />
                    </span>
                  </div>
                  <div className="pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{activity.message}</span>
                      <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{tone.label}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {activity.actorName ? (
                        <span className="inline-flex items-center gap-1">
                          <UserRound className="h-3.5 w-3.5" />
                          {activity.actorName}
                          {activity.actorRole ? <span className="text-muted-foreground/70">· {activity.actorRole.toLowerCase()}</span> : null}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5" />
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No activity yet"
            description="Scans, stock events and governance actions will stream in here."
            icon={<PackageCheck className="h-6 w-6" />}
          />
        )}
      </CardContent>
    </Card>
  );
}
