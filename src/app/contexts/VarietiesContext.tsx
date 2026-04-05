import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { RiceVarietyConfig } from "../lib/planGenerator";
import { getSeedDefaultVarieties } from "../lib/defaultVarieties";
import type { RiceVarietyRecord } from "../lib/riceVarietyTypes";
import { recordToConfig } from "../lib/riceVarietyTypes";
import { validateRiceVarietyRecord } from "../lib/varietyValidation";
import { apiFetch } from "../lib/api";

const STORAGE_KEY = "rice_expert_varieties_v1";

interface BackendVarietyRow {
  id: string;
  collection_name: string;
  name: string;
}

function normalizeFromStorage(parsed: unknown): RiceVarietyRecord[] {
  const seeds = getSeedDefaultVarieties();
  if (!Array.isArray(parsed)) return seeds;

  const byId = new Map<string, RiceVarietyRecord>();

  for (const item of parsed as RiceVarietyRecord[]) {
    if (!item?.id) continue;
    const seed = seeds.find((s) => s.id === item.id);
    if (seed) {
      byId.set(item.id, {
        ...seed,
        ...item,
        isDefault: true,
        scheduleMode: item.scheduleMode ?? seed.scheduleMode ?? "DAS_BASED",
      });
    } else {
      byId.set(item.id, {
        ...item,
        isDefault: false,
        scheduleMode: item.scheduleMode ?? "DAS_BASED",
      });
    }
  }

  for (const s of seeds) {
    if (!byId.has(s.id)) byId.set(s.id, s);
  }

  return Array.from(byId.values());
}

function loadInitial(): RiceVarietyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedDefaultVarieties();
    return normalizeFromStorage(JSON.parse(raw));
  } catch {
    return getSeedDefaultVarieties();
  }
}

function persist(list: RiceVarietyRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

interface VarietiesContextValue {
  varieties: RiceVarietyRecord[];
  /** สำหรับ getCurrentStage / fixedPlan */
  varietyConfigs: RiceVarietyConfig[];
  getRecord: (id: string) => RiceVarietyRecord | undefined;
  addVariety: (r: Omit<RiceVarietyRecord, "isDefault" | "backendSynced">) => string | null;
  updateVariety: (id: string, patch: Partial<RiceVarietyRecord>) => string | null;
  deleteVariety: (id: string) => string | null;
  refreshBackendSync: () => void;
}

const VarietiesContext = createContext<VarietiesContextValue | null>(null);

export function VarietiesProvider({ children }: { children: React.ReactNode }) {
  const [varieties, setVarieties] = useState<RiceVarietyRecord[]>(loadInitial);

  const varietyConfigs = useMemo(
    () => varieties.map(recordToConfig),
    [varieties],
  );

  const refreshBackendSync = useCallback(() => {
    apiFetch<BackendVarietyRow[]>("/varieties/", {}, false)
      .then((rows) => {
        const synced = new Set(rows.map((r) => r.collection_name));
        setVarieties((prev) =>
          prev.map((v) => ({ ...v, backendSynced: synced.has(v.id) })),
        );
      })
      .catch(() => {
        setVarieties((prev) => prev.map((v) => ({ ...v, backendSynced: false })));
      });
  }, []);

  useEffect(() => {
    refreshBackendSync();
  }, [refreshBackendSync]);

  useEffect(() => {
    persist(varieties);
  }, [varieties]);

  const getRecord = useCallback(
    (id: string) => varieties.find((v) => v.id === id),
    [varieties],
  );

  const addVariety = useCallback(
    (r: Omit<RiceVarietyRecord, "isDefault" | "backendSynced">) => {
      const rec: RiceVarietyRecord = {
        ...r,
        isDefault: false,
        backendSynced: false,
      };
      if (varieties.some((x) => x.id === rec.id)) return "มีรหัสพันธุ์นี้แล้ว";
      const err = validateRiceVarietyRecord(rec);
      if (err) return err;
      setVarieties((prev) => [...prev, rec]);
      return null;
    },
    [varieties],
  );

  const updateVariety = useCallback((id: string, patch: Partial<RiceVarietyRecord>): string | null => {
    const cur = varieties.find((v) => v.id === id);
    if (!cur) return "ไม่พบพันธุ์";
    const next: RiceVarietyRecord = { ...cur, ...patch, id: cur.id, isDefault: cur.isDefault };
    const err = validateRiceVarietyRecord(next);
    if (err) return err;
    setVarieties((prev) => prev.map((v) => (v.id === id ? next : v)));
    return null;
  }, [varieties]);

  const deleteVariety = useCallback((id: string) => {
    const cur = varieties.find((v) => v.id === id);
    if (!cur) return "ไม่พบพันธุ์";
    if (cur.isDefault) return "ไม่สามารถลบพันธุ์เริ่มต้น 4 ชนิดได้";
    setVarieties((prev) => prev.filter((v) => v.id !== id));
    return null;
  }, [varieties]);

  const value = useMemo<VarietiesContextValue>(
    () => ({
      varieties,
      varietyConfigs,
      getRecord,
      addVariety,
      updateVariety,
      deleteVariety,
      refreshBackendSync,
    }),
    [
      varieties,
      varietyConfigs,
      getRecord,
      addVariety,
      updateVariety,
      deleteVariety,
      refreshBackendSync,
    ],
  );

  return (
    <VarietiesContext.Provider value={value}>{children}</VarietiesContext.Provider>
  );
}

export function useVarieties() {
  const ctx = useContext(VarietiesContext);
  if (!ctx) throw new Error("useVarieties must be used within VarietiesProvider");
  return ctx;
}
