import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

const REALTIME_PATH = "/api/socketio";

export type RealtimeSocketData = {
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
};

let io: SocketIOServer | null = null;

export const initRealtime = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    path: REALTIME_PATH,
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const header = socket.handshake.headers.cookie ?? "";
    const cookie = header
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${env.COOKIE_NAME}=`));

    if (!cookie) {
      next(new Error("Unauthorized"));
      return;
    }

    const token = cookie.slice(env.COOKIE_NAME.length + 1);

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string; name: string; email: string };
      socket.data.user = { id: payload.id, role: payload.role, name: payload.name, email: payload.email };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket.data as RealtimeSocketData).user;
    socket.join(`user:${user.id}`);
    socket.join("operations");

    if (user.role === "ADMIN" || user.role === "MANAGER") {
      socket.join("governance");
    }
  });

  return io;
};

export const getIO = () => io;

export const emitRealtime = (event: string, payload?: unknown) => {
  if (!io) {
    return;
  }
  io.to("operations").emit(event, payload ?? {});
};

export const emitToUser = (userId: string, event: string, payload?: unknown) => {
  if (!io) {
    return;
  }
  io.to(`user:${userId}`).emit(event, payload ?? {});
};

export const emitToGovernance = (event: string, payload?: unknown) => {
  if (!io) {
    return;
  }
  io.to("governance").emit(event, payload ?? {});
};
