"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export function WarebaseIcon({ className }: { className?: string }) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22345C" />
          <stop offset="100%" stopColor="#151F38" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill={`url(#${gradientId})`} />
      <rect x="26" y="82" width="68" height="9" rx="4.5" fill="#E8A23D" />
      <rect x="30" y="58" width="13" height="24" rx="2.5" fill="#AEB9C4" />
      <rect x="48" y="46" width="13" height="36" rx="2.5" fill="#EEF2F5" />
      <rect x="66" y="32" width="13" height="50" rx="2.5" fill="#F0B15C" />
      <rect x="69" y="37" width="7" height="3" rx="1.5" fill="#151F38" />
    </svg>
  );
}

type WarebaseLogoProps = {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showTagline?: boolean;
};

export function WarebaseLogo({
  className,
  iconClassName,
  wordmarkClassName,
  showTagline = true,
}: WarebaseLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <WarebaseIcon className={cn("h-11 w-11 shrink-0", iconClassName)} />
      <div className="min-w-0 text-left">
        <p className={cn("font-display text-lg font-medium leading-none tracking-tight text-[#22262B]", wordmarkClassName)}>
          Ware<span className="font-bold text-[#1B2A4A]">Base</span>
        </p>
        {showTagline ? (
          <p className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#5B6B79]">
            Every item, in its place
          </p>
        ) : null}
      </div>
    </div>
  );
}
