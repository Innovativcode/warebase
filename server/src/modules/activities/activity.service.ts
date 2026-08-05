import { prisma } from "@/db/prisma";
import { emitRealtime } from "@/realtime";
import type { ActivityType } from "@prisma/client";

type RecordActivityInput = {
  type: ActivityType;
  message: string;
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  businessId?: string | null;
  metadata?: unknown;
};

export const recordActivity = async (input: RecordActivityInput) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        type: input.type,
        message: input.message,
        actorName: input.actorName ?? null,
        actorRole: input.actorRole ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        businessId: input.businessId ?? null,
        metadata: input.metadata as never,
      },
    });

    emitRealtime("activity:new", activity);
  } catch (error) {
    console.error("Failed to record activity:", error);
  }
};

export const resolveActor = async (userId?: string) => {
  if (!userId) {
    return { actorName: null, actorRole: null, businessId: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true, businessId: true },
  });

  if (!user) {
    return { actorName: null, actorRole: null, businessId: null };
  }

  return {
    actorName: user.name,
    actorRole: user.role,
    businessId: user.businessId,
  };
};

export const listActivities = async (options?: { limit?: number; businessId?: string | null }) => {
  return prisma.activity.findMany({
    where: options?.businessId ? { businessId: options.businessId } : undefined,
    orderBy: { createdAt: "desc" },
    take: Math.min(options?.limit ?? 50, 100),
    select: {
      id: true,
      type: true,
      message: true,
      actorName: true,
      actorRole: true,
      targetType: true,
      targetId: true,
      metadata: true,
      createdAt: true,
    },
  });
};
