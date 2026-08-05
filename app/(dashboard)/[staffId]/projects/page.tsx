"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProjectsClientPage } from "@/components/projects/projects-client-page";
import { ProjectDialog } from "@/components/forms/project-dialog";
import { apiFetch } from "@/lib/api";
import { useProjects } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import type { ProjectRecord } from "@/lib/types";

export default function ProjectsPage() {
  const projects = useProjects();
  const users = useUsers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);

  const handleDelete = async (project: ProjectRecord) => {
    try {
      await apiFetch(`/projects/${project.id}`, { method: "DELETE" });
      toast.success("Project deleted");
      projects.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete project");
    }
  };

  return (
    <>
      <ProjectsClientPage
        projects={projects.data?.data ?? null}
        loading={projects.loading}
        error={projects.error}
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
        onEdit={(project) => {
          setEditing(project);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />
      <ProjectDialog
        open={open}
        mode={editing ? "edit" : "create"}
        project={editing}
        users={users.data?.data ?? null}
        onOpenChange={setOpen}
        onSaved={projects.refetch}
      />
    </>
  );
}
