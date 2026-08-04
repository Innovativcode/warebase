import type { ReactNode } from "react";
import { SupportChat } from "@/components/support/support-chat";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SupportChat />
    </>
  );
}
