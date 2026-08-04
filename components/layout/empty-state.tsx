import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border/70 bg-background">
      <CardContent className="flex flex-col items-start gap-4 p-8 sm:p-10">
        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground/75 shadow-none">
            {icon}
          </div>
        ) : null}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <Button onClick={onAction} variant="soft">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
