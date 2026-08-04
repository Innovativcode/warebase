import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(59,130,246,0.12)] hover:bg-primary/90",
  secondary: "border border-border/70 bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80",
  outline: "border border-border/70 bg-background text-foreground shadow-none hover:bg-muted",
  ghost: "bg-transparent shadow-none hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  soft: "border border-primary/15 bg-primary/10 text-primary shadow-none hover:bg-primary/15",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
  icon: "h-11 w-11",
};

export type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

export function Button({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium tracking-normal transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
