"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useCurrentUser } from "@/hooks/use-current-user";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const params = useParams<{ staffId?: string }>();
  const { data, loading } = useCurrentUser();

  const staffId = params.staffId;

  useEffect(() => {
    if (loading) return;
    const mine = data?.data?.publicIdentifier;
    if (!mine) return;
    if (staffId && staffId !== mine) {
      router.replace(`/${mine}/dashboard`);
    }
  }, [loading, data, staffId, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen gap-4 p-4">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <Topbar />
          <div className="min-w-0 flex-1">
            <div className="w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
