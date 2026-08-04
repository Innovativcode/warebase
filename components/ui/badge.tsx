import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";

const badgeClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-none",
  secondary: "border border-border/70 bg-secondary text-secondary-foreground",
  outline: "border border-border/70 bg-background text-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
  info: "bg-info text-info-foreground",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em]",
        badgeClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
