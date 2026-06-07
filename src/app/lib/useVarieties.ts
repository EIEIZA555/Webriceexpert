import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./api";
import type { RiceVariety } from "./types";

/** @deprecated ใช้ RiceVariety จาก lib/types แทน */
export type VarietyItem = RiceVariety;

export function useVarieties(requireAuth = false) {
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<RiceVariety[]>("/varieties/", {}, requireAuth);
      setVarieties(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [requireAuth]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { varieties, loading, error, reload, setVarieties };
}
