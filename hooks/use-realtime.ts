"use client";

import { useEffect, useRef } from "react";
import { subscribeRealtime } from "@/lib/realtime";

export function useRealtimeEvent(event: string, handler: (payload: unknown) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return subscribeRealtime(event, (payload) => handlerRef.current(payload));
  }, [event]);
}
