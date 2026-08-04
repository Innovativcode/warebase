"use client";

import { io, type Socket } from "socket.io-client";

type Handler = (payload: unknown) => void;

let socket: Socket | null = null;
const listeners = new Map<string, Set<Handler>>();

export function getSocket(): Socket | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    socket = io({
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });

    socket.on("connect", () => {
      window.dispatchEvent(new CustomEvent("realtime:connect"));
    });

    socket.on("disconnect", (reason) => {
      window.dispatchEvent(new CustomEvent("realtime:disconnect", { detail: reason }));
    });

    socket.onAny((event, payload) => {
      const handlers = listeners.get(event);
      if (!handlers) {
        return;
      }
      for (const handler of Array.from(handlers)) {
        try {
          handler(payload);
        } catch {
          // A single handler must not break the event loop.
        }
      }
    });
  }

  return socket;
}

export function subscribeRealtime(event: string, handler: Handler): () => void {
  const s = getSocket();
  if (!s) {
    return () => {};
  }

  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event)?.add(handler);

  return () => {
    listeners.get(event)?.delete(handler);
  };
}
