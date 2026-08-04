"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AuthShellProps = {
  children: ReactNode;
  visual: ReactNode;
  className?: string;
  asideClassName?: string;
};

export function AuthShell({ children, visual, className, asideClassName }: AuthShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen overflow-hidden bg-brand-mist",
        className,
      )}
    >
      <div className="grid min-h-screen xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <aside
          className={cn("hidden xl:flex xl:items-center xl:justify-end xl:px-6 xl:py-8", asideClassName)}
        >
          <div className="w-full max-w-[500px]">{visual}</div>
        </aside>

        <main className="flex items-center justify-start px-4 py-8 sm:px-6 lg:px-8 xl:px-4">
          <div className="w-full max-w-xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
