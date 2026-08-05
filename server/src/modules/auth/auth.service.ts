import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "@/db/prisma";
import { env } from "@/config/env";
import { ApiError } from "@/utils/http";
import { loginSchema, registerSchema, updateMeSchema } from "./auth.schemas";
import { getUserPermissions } from "@/middleware/permissions";
import { createUniquePublicIdentifier } from "@/utils/public-identifier";

export const registerUser = async (input: unknown) => {
  const payload = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });

  if (existing) {
    throw new ApiError(409, "An account with that email already exists");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const publicIdentifier = await createUniquePublicIdentifier(payload.name);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: "STAFF",
      publicIdentifier,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isSuperAdmin: true,
      avatarUrl: true,
      publicIdentifier: true,
      createdAt: true,
    },
  });

  const permissions = await getUserPermissions(user.id, user.role);

  return createAuthResult({ ...user, permissions });
};

export const loginUser = async (input: unknown) => {
  const payload = loginSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const permissions = await getUserPermissions(user.id, user.role);

  return createAuthResult({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    isSuperAdmin: user.isSuperAdmin,
    avatarUrl: user.avatarUrl,
    publicIdentifier: user.publicIdentifier,
    permissions,
    createdAt: user.createdAt,
  });
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isSuperAdmin: true,
      avatarUrl: true,
      publicIdentifier: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let publicIdentifier = user.publicIdentifier;

  if (!publicIdentifier) {
    publicIdentifier = await createUniquePublicIdentifier(user.name);
    await prisma.user.update({
      where: { id: user.id },
      data: { publicIdentifier },
    });
  }

  const permissions = await getUserPermissions(user.id, user.role);

  return { ...user, publicIdentifier, permissions };
};

export const updateOwnProfile = async (userId: string, input: unknown) => {
  const payload = updateMeSchema.parse(input);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.avatarUrl !== undefined ? { avatarUrl: payload.avatarUrl } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isSuperAdmin: true,
      avatarUrl: true,
      publicIdentifier: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const permissions = await getUserPermissions(user.id, user.role);

  return { ...user, permissions };
};

const createAuthResult = <T extends { id: string; name: string; email: string; role: string }>(user: T) => {
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] },
  );

  return { user, token };
};
