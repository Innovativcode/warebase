import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
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
