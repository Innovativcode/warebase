import bcrypt from "bcryptjs";
import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";
import { ROLE_RANK, getUserPermissions } from "@/middleware/permissions";
import { userCreateSchema, userPatchSchema } from "./users.schemas";

const MANAGER_CREATABLE_ROLES = ["STAFF", "VIEWER"];

const generatePublicIdentifier = (name: string): string => {
  const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const random = Math.random().toString(36).substring(2, 8);
  return `${sanitized}-${random}`;
};

export type UserActor = {
  id: string;
  role: string;
};

export const listUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const usersWithPermissions = await Promise.all(
    users.map(async (user: { id: string; role: string; name: string; email: string; isActive: boolean; createdAt: Date; updatedAt: Date }) => {
      const permissions = await getUserPermissions(user.id, user.role);
      return { ...user, permissions };
    })
  );

  return usersWithPermissions;
};

export const createUser = async (actor: UserActor, input: unknown) => {
  const payload = userCreateSchema.parse(input);

  if (actor.role !== "ADMIN" && !MANAGER_CREATABLE_ROLES.includes(payload.role)) {
    throw new ApiError(403, "Only an admin can create accounts with that role");
  }

  const existing = await prisma.user.findUnique({ where: { email: payload.email } });

  if (existing) {
    throw new ApiError(409, "An account with that email already exists");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const publicIdentifier = generatePublicIdentifier(payload.name);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role,
      isActive: payload.isActive,
      avatarUrl: payload.avatarUrl ?? undefined,
      publicIdentifier,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const permissions = await getUserPermissions(user.id, user.role);

  return { ...user, permissions };
};

export const updateUser = async (actor: UserActor, id: string, input: unknown) => {
  const payload = userPatchSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "User not found");
  }

  const actorRank = ROLE_RANK[actor.role] ?? 0;
  const targetRank = ROLE_RANK[existing.role] ?? 0;

  if (existing.id === actor.id) {
    if (payload.role !== undefined && payload.role !== existing.role) {
      throw new ApiError(403, "You cannot change your own role");
    }
    if (payload.isActive !== undefined && payload.isActive !== existing.isActive) {
      throw new ApiError(403, "You cannot deactivate your own account");
    }
  }

  if (actor.role !== "ADMIN") {
    if (targetRank >= ROLE_RANK["MANAGER"]) {
      throw new ApiError(403, "You do not have permission to manage that user");
    }
    if (payload.role !== undefined && ROLE_RANK[payload.role] >= ROLE_RANK["MANAGER"]) {
      throw new ApiError(403, "Only an admin can grant manager or admin roles");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...payload,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const permissions = await getUserPermissions(updatedUser.id, updatedUser.role);

  return { ...updatedUser, permissions };
};
