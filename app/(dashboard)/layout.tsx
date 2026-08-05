import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SupportChat } from "@/components/support/support-chat";
import { WarebaseBootScreen } from "@/components/loader/boot-screen";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <SupportChat />
      <WarebaseBootScreen />
    </AppShell>
  );
}
