import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "@/db/prisma";
import { env } from "@/config/env";
import { ApiError } from "@/utils/http";
import { loginSchema, registerSchema } from "./auth.schemas";

export const registerUser = async (input: unknown) => {
  const payload = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });

  if (existing) {
    throw new ApiError(409, "An account with that email already exists");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: "STAFF",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return createAuthResult(user);
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

  return createAuthResult({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
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
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const createAuthResult = <T extends { id: string; name: string; email: string; role: string }>(user: T) => {
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] },
  );

  return { user, token };
};
