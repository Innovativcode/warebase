import { cn } from "@/lib/cn";

type WarebaseLoaderProps = {
  variant?: "default" | "compact";
  className?: string;
};

export function WarebaseLoader({ variant = "default", className }: WarebaseLoaderProps) {
  return (
    <div
      className={cn("warebase-loader", variant === "compact" && "warebase-loader--compact", className)}
      role="status"
      aria-label="Loading"
    >
      <span className="warebase-loader__bar" />
      <span className="warebase-loader__bar" />
      <span className="warebase-loader__bar" />
    </div>
  );
}

type InlineLoaderProps = {
  label?: string;
  className?: string;
};

export function InlineLoader({ label = "Loading…", className }: InlineLoaderProps) {
  return (
    <div className={cn("flex items-center gap-3 py-2 text-sm text-muted-foreground", className)}>
      <WarebaseLoader variant="compact" />
      <span>{label}</span>
    </div>
  );
}
