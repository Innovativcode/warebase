"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LottiePlayer } from "@/components/media/lottie-player";
import { cn } from "@/lib/cn";

type PageHeroPanelProps = {
  badge?: string;
  title: string;
  description: string;
  note: string;
  animationData: object;
  action?: ReactNode;
  reverse?: boolean;
  className?: string;
  animationClassName?: string;
  footer?: ReactNode;
};

export function PageHeroPanel({
  badge,
  title,
  description,
  note,
  animationData,
  action,
  reverse,
  className,
  animationClassName,
  footer,
}: PageHeroPanelProps) {
  return (
    <Card className={cn("mb-6", className)}>
      <CardContent className={cn("grid gap-5 lg:items-center", reverse ? "lg:grid-cols-[0.95fr_1.05fr]" : "lg:grid-cols-[1.05fr_0.95fr]")}>
        <div className={cn("space-y-3", reverse && "lg:order-2")}>
          {badge ? (
            <Badge variant="outline" className="w-fit border-border bg-muted/40 text-[0.62rem] text-muted-foreground">
              {badge}
            </Badge>
          ) : null}
          <div className="space-y-2">
            <h3 className="text-[1.35rem] font-semibold tracking-tight text-foreground sm:text-[1.55rem]">{title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{note}</p>
          {action ? <div className="pt-1">{action}</div> : null}
          {footer ? <div className="pt-1">{footer}</div> : null}
        </div>
        <div className={cn("rounded-[0.9rem] border border-border bg-background p-4", reverse && "lg:order-1", animationClassName)}>
          <LottiePlayer animationData={animationData} className="h-[250px] w-full" preserveAspectRatio="xMidYMid meet" />
        </div>
      </CardContent>
    </Card>
  );
}
