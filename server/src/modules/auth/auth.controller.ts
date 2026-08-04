import type { Request, Response } from "express";
import { env } from "@/config/env";
import { ApiError, asyncHandler } from "@/utils/http";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";
import type { AuthenticatedRequest } from "@/middleware/auth";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res
    .cookie(env.COOKIE_NAME, result.token, cookieOptions)
    .status(201)
    .json({ success: true, data: result.user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.cookie(env.COOKIE_NAME, result.token, cookieOptions).status(200).json({
    success: true,
    data: result.user,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: 0 }).json({ success: true });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await getCurrentUser(req.user.id);
  res.json({ success: true, data: user });
});

