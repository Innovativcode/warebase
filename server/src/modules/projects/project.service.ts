import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";
import { isApprover } from "@/middleware/permissions";
import { projectSchema } from "./project.schemas";

export type ProjectActor = {
  id: string;
  role: string;
};

export const listProjects = async () =>
  prisma.project.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true } },
    },
  });

export const getProjectById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
};

export const createProject = async (actor: ProjectActor, input: unknown) => {
  const payload = projectSchema.parse(input);
  const ownerUserId = isApprover(actor.role) ? payload.ownerUserId ?? undefined : actor.id;

  return prisma.project.create({
    data: {
      code: payload.code,
      name: payload.name,
      description: payload.description ?? undefined,
      status: payload.status,
      startDate: payload.startDate ?? undefined,
      dueDate: payload.dueDate ?? undefined,
      ownerUserId,
    },
  });
};

export const updateProject = async (id: string, actor: ProjectActor, input: unknown) => {
  const payload = projectSchema.partial().parse(input);
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Project not found");
  }

  const ownerUserId = payload.ownerUserId === undefined ? undefined : isApprover(actor.role) ? payload.ownerUserId : existing.ownerUserId;

  return prisma.project.update({
    where: { id },
    data: {
      ...payload,
      ownerUserId,
      description: payload.description === null ? null : payload.description ?? undefined,
      startDate: payload.startDate === null ? null : payload.startDate ?? undefined,
      dueDate: payload.dueDate === null ? null : payload.dueDate ?? undefined,
    },
  });
};

export const deleteProject = async (id: string) => {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Project not found");
  }

  await prisma.project.delete({ where: { id } });
};
