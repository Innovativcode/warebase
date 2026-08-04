import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { requirePermission } from "@/middleware/permissions";
import { getUsers, patchUser, postUser } from "./users.controller";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.get("/", requirePermission("users:manage"), getUsers);
usersRouter.post("/", requirePermission("users:manage"), postUser);
usersRouter.patch("/:id", requirePermission("users:manage"), patchUser);
