import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { prisma } from "@/db/prisma";
import { ApiError } from "@/utils/http";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
    isSuperAdmin: boolean;
  };
};

export const requireAuth = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[env.COOKIE_NAME];

  if (!token) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; name: string; email: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, isSuperAdmin: true },
    });

    if (!user || !user.isActive) {
      next(new ApiError(401, "Invalid or expired session"));
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired session"));
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
};
