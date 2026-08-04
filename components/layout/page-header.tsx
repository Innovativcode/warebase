import { ReactNode } from "react";
type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)] md:flex-row md:items-end md:justify-between sm:p-6">
      <div className="space-y-2">
        {eyebrow ? (
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-primary/80">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-[1.55rem] font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-5 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
