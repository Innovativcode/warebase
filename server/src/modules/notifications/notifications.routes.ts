import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { getNotifications, patchNotificationRead, postNotificationsReadAll } from "./notifications.controller";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get("/", getNotifications);
notificationsRouter.patch("/:id/read", patchNotificationRead);
notificationsRouter.post("/read-all", postNotificationsReadAll);
