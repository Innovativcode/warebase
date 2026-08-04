import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "success" | "warning" | "info" | "danger";
  icon?: ReactNode;
  iconClassName?: string;
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(0_0%_100%)_72%,hsl(268_45%_98.5%)_100%)]",
  success: "bg-[linear-gradient(135deg,hsl(0_0%_100%)_0%,hsl(138_36%_97.5%)_72%,hsl(150_30%_96.5%)_100%)]",
  warning: "bg-[linear-gradient(135deg,hsl(0_0%_100%)_0%,hsl(48_42%_97.4%)_72%,hsl(40_35%_96.6%)_100%)]",
  info: "bg-[linear-gradient(135deg,hsl(0_0%_100%)_0%,hsl(205_40%_97.4%)_72%,hsl(212_35%_96.7%)_100%)]",
  danger: "bg-[linear-gradient(135deg,hsl(0_0%_100%)_0%,hsl(350_35%_97.4%)_72%,hsl(345_30%_96.6%)_100%)]",
};

export function StatCard({ label, value, hint, tone = "default", icon, iconClassName }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/70", toneClasses[tone])}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
            <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          </div>
          {icon ? (
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background shadow-none",
                iconClassName,
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>
        {hint ? <p className="text-sm leading-5 text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
