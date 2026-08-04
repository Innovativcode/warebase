import { prisma } from "@/db/prisma";

export const recordAuditLog = async (input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata as never,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
};

export const listAuditLogs = async () =>
  prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      actorId: true,
      action: true,
      entity: true,
      entityId: true,
      metadata: true,
      createdAt: true,
    },
  });

