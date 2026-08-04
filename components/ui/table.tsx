import { cn } from "@/lib/cn";
import type { HTMLAttributes, TableHTMLAttributes } from "react";

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        "w-full caption-bottom rounded-[1.2rem] border border-border/70 bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(0_0%_100%)_80%,hsl(265_45%_99%)_100%)] text-sm shadow-[0_1px_4px_rgba(15,23,42,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b [&_tr]:border-border/70", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-border/70 bg-transparent transition-colors hover:bg-muted/45", className)} {...props} />;
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle text-[0.62rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-border/70 px-4 py-4 align-middle last:border-b-0", className)} {...props} />;
}
