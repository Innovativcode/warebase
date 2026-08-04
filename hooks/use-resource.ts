import { useEffect, useState } from "react";
import { ApiClientError, apiFetch } from "@/lib/api";

type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useResource<T>(path: string, init?: RequestInit): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFetch<T>(path, init);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof ApiClientError ? err.message : "Failed to load resource";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [path, init, refreshIndex]);

  return {
    data,
    loading,
    error,
    refetch: () => setRefreshIndex((value) => value + 1),
  };
}

