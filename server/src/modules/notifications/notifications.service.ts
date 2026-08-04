import { prisma } from "@/db/prisma";

export const listNotifications = async (userId: string, limit = 8) => {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        body: true,
        href: true,
        isRead: true,
        createdAt: true,
        readAt: true,
      },
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return { items, unreadCount };
};

export const markNotificationRead = async (userId: string, id: string) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const markAllNotificationsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};
