import { PageHeroPanel } from "@/components/layout/page-hero-panel";
import { EmptyState } from "@/components/layout/empty-state";
import { DeleteConfirmButton } from "@/components/layout/delete-confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pencil, Plus, Workflow, User2, ListTodo, Rocket, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectRecord } from "@/lib/types";
import { InlineLoader } from "@/components/loader/warebase-loader";
import automationAnimation from "@/assets/lottie/automation.json";

type ProjectsClientPageProps = {
  projects: ProjectRecord[] | null;
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onEdit: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
};

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info" | "secondary"> = {
  PLANNED: "secondary",
  ACTIVE: "success",
  BLOCKED: "danger",
  COMPLETED: "info",
  ARCHIVED: "default",
};

export function ProjectsClientPage({ projects, loading, error, onCreate, onEdit, onDelete }: ProjectsClientPageProps) {
  const columns: Column<ProjectRecord>[] = [
    {
      key: "name",
      label: "Project",
      sortable: true,
      render: (project) => (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-border/70 bg-background text-muted-foreground/80">
            <Workflow className="h-[18px] w-[18px] stroke-[1.9]" />
          </span>
          <div>
            <div className="font-medium text-foreground">{project.name}</div>
            <div className="text-xs text-muted-foreground">{project.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      sortable: true,
      render: (project) => (
        <div className="flex items-center gap-2">
          <User2 className="h-4 w-4 text-muted-foreground/70" />
          <span>{project.owner?.name ?? "Unassigned"}</span>
        </div>
      ),
    },
    {
      key: "_count",
      label: "Tasks",
      sortable: true,
      render: (project) => (
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-muted-foreground/70" />
          <span className="tabular-nums">{project._count.tasks}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (project) => (
        <Badge variant={statusTone[project.status] ?? "secondary"}>
          <span className="inline-flex items-center gap-1.5">
            {project.status === "ACTIVE" ? (
              <Rocket className="h-3.5 w-3.5" />
            ) : project.status === "BLOCKED" ? (
              <CircleDashed className="h-3.5 w-3.5" />
            ) : null}
            {project.status}
          </span>
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (project) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <DeleteConfirmButton itemName={project.name} onConfirm={() => onDelete(project)} buttonLabel="Delete" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeroPanel
        badge="Program work"
        title="Projects"
        description="Plan and monitor project-level work without losing operational inventory context."
        note="Projects stay aligned with the inventory system when ownership, status, and throughput are easy to scan."
        animationData={automationAnimation}
        reverse
        action={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Project board</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoader label="Loading projects…" />
          ) : error ? (
            <EmptyState title="Unable to load projects" description={error} icon={<Workflow className="h-6 w-6" />} />
          ) : projects?.length ? (
            <DataTable
              data={projects}
              columns={columns}
              keyExtractor={(project) => project.id}
              emptyMessage="No projects created"
            />
          ) : (
            <EmptyState
              title="No projects created"
              description="Project records will be shown here as soon as they are created in the system."
              icon={<Workflow className="h-6 w-6" />}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
