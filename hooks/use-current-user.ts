import { useCallback, useSyncExternalStore } from "react";
import { ApiClientError, apiFetch } from "@/lib/api";
import type { ApiResult, UserRecord } from "@/lib/types";

type CurrentUserState = {
  data: ApiResult<UserRecord> | null;
  loading: boolean;
  error: string | null;
};

let state: CurrentUserState = { data: null, loading: true, error: null };
let inFlight: Promise<void> | null = null;

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const load = () => {
  if (!inFlight) {
    inFlight = (async () => {
      try {
        const result = await apiFetch<ApiResult<UserRecord>>("/auth/me");
        state = { data: result, loading: false, error: null };
      } catch (err) {
        const message = err instanceof ApiClientError ? err.message : "Failed to load resource";
        state = { data: null, loading: false, error: message };
      } finally {
        inFlight = null;
        emit();
      }
    })();
  }
  return inFlight;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (state.data === null && state.error === null) {
    void load();
  }
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

const getServerSnapshot = () => ({ data: null, loading: true, error: null });

export function useCurrentUser() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const refetch = useCallback(() => {
    inFlight = null;
    void load();
  }, []);

  return { ...snapshot, refetch };
}
