import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { PlanTask, PlantingPlan, PlanResources, SoilTypeKey } from "../lib/planTypes";
import { type PlantingMethodKey } from "../lib/plantingMethod";
import { apiFetch, getAuthToken } from "../lib/api";

export type { PlanTask, PlantingPlan, PlanResources } from "../lib/planTypes";
export type { PlantingMethodKey } from "../lib/plantingMethod";

const CURRENT_PLAN_KEY = "rice_expert_current_plan_id";

// Backend response types (snake_case)
interface BackendTask {
  id: string;
  day: number;
  stage: string;
  task_name: string;
  description: string | null;
  date: string;
  is_completed: boolean;
}

interface BackendPlan {
  id: string;
  variety_id: string;
  variety_name: string;
  start_date: string;
  actual_planting_date: string;
  area_rai: number;
  plot_name: string | null;
  planting_method: string;
  soil_type: string;
  is_photoperiod_sensitive: boolean;
  tasks: BackendTask[];
  resources: { seed_kg: number; fertilizer1_kg: number; fertilizer1_formula: string; fertilizer2_kg: number; fertilizer2_formula: string; seedling_trays: number | null } | null;
  created_at: string;
}

interface BackendVariety {
  id: string;
  collection_name: string;
  name: string;
  harvest_age_days: number;
  is_photoperiod_sensitive: boolean;
  supported_methods: string[];
  description: string;
  reference_url: string | null;
}

function mapTask(t: BackendTask): PlanTask {
  return {
    id: t.id,
    day: t.day,
    stage: t.stage,
    taskName: t.task_name,
    description: t.description,
    date: t.date,
    isCompleted: t.is_completed,
  };
}

function mapPlan(p: BackendPlan, uuidToCollection: Map<string, string>): PlantingPlan {
  return {
    id: p.id,
    varietyId: uuidToCollection.get(p.variety_id) ?? p.variety_id,
    varietyName: p.variety_name,
    startDate: p.start_date,
    actualPlantingDate: p.actual_planting_date,
    areaRai: p.area_rai,
    plotName: p.plot_name,
    plantingMethod: p.planting_method as PlantingMethodKey,
    soilType: (p.soil_type ?? "clay") as SoilTypeKey,
    isPhotoperiodSensitive: p.is_photoperiod_sensitive,
    tasks: p.tasks.map(mapTask),
    resources: p.resources ? {
      seedKg: p.resources.seed_kg,
      fertilizer1Kg: p.resources.fertilizer1_kg,
      fertilizer1Formula: p.resources.fertilizer1_formula,
      fertilizer2Kg: p.resources.fertilizer2_kg,
      fertilizer2Formula: p.resources.fertilizer2_formula,
      seedlingTrays: p.resources.seedling_trays,
    } : null,
    createdAt: p.created_at,
  };
}

interface PlansContextValue {
  plans: PlantingPlan[];
  plan: PlantingPlan | null;
  loading: boolean;
  error: string | null;
  currentPlanId: string | null;
  setCurrentPlanId: (id: string) => void;
  createPlan: (params: {
    varietyId: string;
    startDate: string;
    plotName: string;
    landSize: string;
    plantingMethod: PlantingMethodKey;
    soilType: string;
  }) => Promise<PlantingPlan>;
  toggleTask: (planId: string, taskId: string) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  getDaysSinceStart: () => number;
  getTotalDays: () => number;
  getProgressPercent: () => number;
  getCurrentStageName: () => string | null;
  getUpcomingTasks: (daysAhead?: number) => PlanTask[];
  /** มีพันธุ์นี้ใน backend (สร้างแผนได้) */
  isVarietyRegisteredOnBackend: (collectionName: string) => boolean;
  /** รีเฟรช collectionToUUID map จาก backend */
  refreshVarieties: () => Promise<{ uuidMap: Map<string, string>; colMap: Map<string, string> }>;
}

const PlansContext = createContext<PlansContextValue | null>(null);

export function PlansProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<PlantingPlan[]>([]);
  const [uuidToCollection, setUuidToCollection] = useState<Map<string, string>>(new Map());
  const [collectionToUUID, setCollectionToUUID] = useState<Map<string, string>>(new Map());
  const [currentPlanId, setCurrentPlanIdState] = useState<string | null>(
    () => localStorage.getItem(CURRENT_PLAN_KEY),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshVarieties = useCallback(async (): Promise<{ uuidMap: Map<string, string>; colMap: Map<string, string> }> => {
    const varieties = await apiFetch<BackendVariety[]>("/varieties/");
    const uuidMap = new Map<string, string>();
    const colMap = new Map<string, string>();
    varieties.forEach((v) => {
      uuidMap.set(v.id, v.collection_name);
      colMap.set(v.collection_name, v.id);
    });
    setUuidToCollection(uuidMap);
    setCollectionToUUID(colMap);
    return { uuidMap, colMap };
  }, []);

  const fetchPlans = useCallback(async () => {
    if (!getAuthToken()) {
      setPlans([]);
      setLoading(false);
      return;
    }
    try {
      const { uuidMap } = await refreshVarieties();

      const backendPlans = await apiFetch<BackendPlan[]>("/plans/", {}, true);
      const mapped = backendPlans.map((p) => mapPlan(p, uuidMap));
      setPlans(mapped);

      setCurrentPlanIdState((prev) => {
        if (prev && mapped.find((p) => p.id === prev)) return prev;
        const first = mapped[0]?.id ?? null;
        if (first) localStorage.setItem(CURRENT_PLAN_KEY, first);
        else localStorage.removeItem(CURRENT_PLAN_KEY);
        return first;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [refreshVarieties]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const setCurrentPlanId = useCallback((id: string) => {
    localStorage.setItem(CURRENT_PLAN_KEY, id);
    setCurrentPlanIdState(id);
  }, []);

  const createPlan = useCallback(
    async (params: {
      varietyId: string;
      startDate: string;
      plotName: string;
      landSize: string;
      plantingMethod: PlantingMethodKey;
      soilType: string;
    }) => {
      // Fetch fresh varieties เพื่อหลีกเลี่ยง stale closure
      const { uuidMap, colMap } = await refreshVarieties();
      const varietyUUID = colMap.get(params.varietyId);
      if (!varietyUUID) throw new Error(`ไม่พบพันธุ์ข้าว: ${params.varietyId}`);

      const backendPlan = await apiFetch<BackendPlan>(
        "/plans/",
        {
          method: "POST",
          body: JSON.stringify({
            variety_id: varietyUUID,
            start_date: params.startDate,
            area_rai: parseFloat(params.landSize),
            plot_name: params.plotName || null,
            planting_method: params.plantingMethod,
            soil_type: params.soilType,
          }),
        },
        true,
      );

      const newPlan = mapPlan(backendPlan, uuidMap);
      setPlans((prev) => [...prev, newPlan]);
      setCurrentPlanId(newPlan.id);
      return newPlan;
    },
    [refreshVarieties, setCurrentPlanId],
  );

  const toggleTask = useCallback(async (planId: string, taskId: string) => {
    const updated = await apiFetch<BackendTask>(
      `/plans/${planId}/tasks/${taskId}/toggle`,
      { method: "PATCH" },
      true,
    );
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        return { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? mapTask(updated) : t)) };
      }),
    );
  }, []);

  const deletePlan = useCallback(
    async (planId: string) => {
      await apiFetch<void>(`/plans/${planId}`, { method: "DELETE" }, true);
      setPlans((prev) => {
        const remaining = prev.filter((p) => p.id !== planId);
        if (currentPlanId === planId) {
          const next = remaining[0]?.id ?? null;
          if (next) localStorage.setItem(CURRENT_PLAN_KEY, next);
          else localStorage.removeItem(CURRENT_PLAN_KEY);
          setCurrentPlanIdState(next);
        }
        return remaining;
      });
    },
    [currentPlanId],
  );

  const plan = plans.find((p) => p.id === currentPlanId) ?? null;

  const getDaysSinceStart = () => {
    if (!plan || plan.tasks.length === 0) return 0;
    // นับจาก task แรกสุด (อาจเป็นวันก่อนปลูก เช่น เตรียมกล้า)
    const firstTaskDate = plan.tasks.reduce((min, t) =>
      t.date < min ? t.date : min, plan.tasks[0].date
    );
    const start = new Date(`${firstTaskDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
  };

  const getTotalDays = () => {
    if (!plan || plan.tasks.length === 0) return 0;
    const minDay = Math.min(...plan.tasks.map((t) => t.day));
    const maxDay = Math.max(...plan.tasks.map((t) => t.day));
    return maxDay - minDay;
  };

  const getProgressPercent = () => {
    const total = getTotalDays();
    if (!total) return 0;
    return Math.min(100, Math.max(0, (getDaysSinceStart() / total) * 100));
  };

  const getCurrentStageName = () => {
    if (!plan || !plan.tasks.length) return null;
    const das = getDaysSinceStart();
    const minDay = Math.min(...plan.tasks.map(t => t.day));
    const currentDay = das + minDay;
    const sorted = [...plan.tasks].sort((a, b) => Math.abs(a.day - currentDay) - Math.abs(b.day - currentDay));
    return sorted[0]?.stage ?? "เก็บเกี่ยวแล้ว";
  };

  const isVarietyRegisteredOnBackend = useCallback(
    (collectionName: string) => collectionToUUID.has(collectionName),
    [collectionToUUID],
  );

  const getUpcomingTasks = (daysAhead = 30) => {
    if (!plan) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = new Date(today);
    future.setDate(future.getDate() + daysAhead);
    const inWindow = plan.tasks
      .filter((t) => {
        const d = new Date(t.date);
        d.setHours(0, 0, 0, 0);
        return d >= today && d <= future;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    if (inWindow.length > 0) return inWindow;
    // ถ้าแผนยังไม่เริ่ม หรือไม่มีงานใน window — แสดง 5 งานถัดไปที่ใกล้ที่สุด
    return plan.tasks
      .filter((t) => {
        const d = new Date(t.date);
        d.setHours(0, 0, 0, 0);
        return d >= today;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  };

  return (
    <PlansContext.Provider
      value={{
        plans,
        plan,
        loading,
        error,
        currentPlanId,
        setCurrentPlanId,
        createPlan,
        toggleTask,
        deletePlan,
        getDaysSinceStart,
        getTotalDays,
        getProgressPercent,
        getCurrentStageName,
        getUpcomingTasks,
        isVarietyRegisteredOnBackend,
        refreshVarieties,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error("usePlans must be used within PlansProvider");
  return ctx;
}
