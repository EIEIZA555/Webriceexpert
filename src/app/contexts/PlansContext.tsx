import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { RICE_VARIETIES, SoilTypeKey, getCurrentStage } from "../lib/planGenerator";
import { generateFixedPlanTasks } from "../lib/fixedPlan";
import type { PlanTask, PlantingPlan } from "../lib/planTypes";
import type { PlantingMethodKey } from "../lib/plantingMethod";

export type { PlanTask, PlantingPlan } from "../lib/planTypes";
export type { PlantingMethodKey } from "../lib/plantingMethod";

const CURRENT_PLAN_KEY = "rice_expert_current_plan_id";
const PLANS_KEY = "rice_expert_plans_v1";

function safeRandomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return `${prefix}_${(crypto as any).randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
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
    soilType: SoilTypeKey;
    plantingMethod: PlantingMethodKey;
  }) => Promise<PlantingPlan>;
  toggleTask: (planId: string, taskId: string) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  getDaysSinceStart: () => number;
  getTotalDays: () => number;
  getProgressPercent: () => number;
  getCurrentStageName: () => string | null;
  getUpcomingTasks: (daysAhead?: number) => PlanTask[];
}

const PlansContext = createContext<PlansContextValue | null>(null);

export function PlansProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<PlantingPlan[]>([]);
  const [currentPlanId, setCurrentPlanIdState] = useState<string | null>(
    () => localStorage.getItem(CURRENT_PLAN_KEY),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const raw = localStorage.getItem(PLANS_KEY);
      const parsed = raw ? (JSON.parse(raw) as (PlantingPlan & { plantingMethod?: PlantingMethodKey })[]) : [];
      const neededMigrate = parsed.some((p) => !p.plantingMethod);
      const normalized = parsed.map((p) => {
        const soilType = p.soilType ?? "loam";
        const plantingMethod: PlantingMethodKey = p.plantingMethod ?? "wet_seeded";
        const hadMethod = Boolean(p.plantingMethod);
        const completionKey = new Map(
          p.tasks.map((t) => [`${t.day}:${t.taskName}`, t.isCompleted] as const),
        );
        const tasks = hadMethod
          ? p.tasks
          : generateFixedPlanTasks({
              varietyId: p.varietyId,
              startDate: p.startDate,
              soilType,
              plantingMethod,
            }).map((t) => ({
              ...t,
              isCompleted: completionKey.get(`${t.day}:${t.taskName}`) ?? false,
            }));
        return {
          ...p,
          soilType,
          plantingMethod,
          tasks,
        };
      });
      setPlans(normalized);
      if (neededMigrate && normalized.length > 0) {
        localStorage.setItem(PLANS_KEY, JSON.stringify(normalized));
      }
      setCurrentPlanIdState((prev) => {
        if (prev && normalized.find((p) => p.id === prev)) return prev;
        const first = normalized[0]?.id ?? null;
        if (first) localStorage.setItem(CURRENT_PLAN_KEY, first);
        return first;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

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
      soilType: SoilTypeKey;
      plantingMethod: PlantingMethodKey;
    }) => {
      const variety = RICE_VARIETIES.find((v) => v.id === params.varietyId)!;
      const newPlan: PlantingPlan = {
        id: safeRandomId("plan"),
        varietyId: params.varietyId,
        varietyName: variety.name,
        startDate: params.startDate,
        areaRai: parseFloat(params.landSize),
        plotName: params.plotName || null,
        soilType: params.soilType,
        plantingMethod: params.plantingMethod,
        tasks: generateFixedPlanTasks({
          varietyId: params.varietyId,
          startDate: params.startDate,
          soilType: params.soilType,
          plantingMethod: params.plantingMethod,
        }),
        createdAt: new Date().toISOString(),
      };

      setPlans((prev) => {
        const next = [...prev, newPlan];
        localStorage.setItem(PLANS_KEY, JSON.stringify(next));
        return next;
      });
      setCurrentPlanId(newPlan.id);
      return newPlan;
    },
    [setCurrentPlanId],
  );

  const toggleTask = useCallback(async (planId: string, taskId: string) => {
    setPlans((prev) => {
      const next = prev.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t,
          ),
        };
      });
      localStorage.setItem(PLANS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePlan = useCallback(async (planId: string) => {
    setPlans((prev) => {
      const remaining = prev.filter((p) => p.id !== planId);
      localStorage.setItem(PLANS_KEY, JSON.stringify(remaining));
      if (currentPlanId === planId) {
        const next = remaining[0]?.id ?? null;
        if (next) localStorage.setItem(CURRENT_PLAN_KEY, next);
        else localStorage.removeItem(CURRENT_PLAN_KEY);
        setCurrentPlanIdState(next);
      }
      return remaining;
    });
  }, [currentPlanId]);

  const plan = plans.find((p) => p.id === currentPlanId) ?? null;

  const getDaysSinceStart = () => {
    if (!plan) return 0;
    const start = new Date(plan.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
  };

  const getTotalDays = () => {
    if (!plan) return 0;
    return RICE_VARIETIES.find((v) => v.id === plan.varietyId)?.lifecycleDays ?? 120;
  };

  const getProgressPercent = () => {
    const total = getTotalDays();
    if (!total) return 0;
    return Math.min(100, Math.max(0, (getDaysSinceStart() / total) * 100));
  };

  const getCurrentStageName = () => {
    if (!plan) return null;
    return getCurrentStage(plan.varietyId, getDaysSinceStart()) ?? "เก็บเกี่ยวแล้ว";
  };

  const getUpcomingTasks = (daysAhead = 30) => {
    if (!plan) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = new Date(today);
    future.setDate(future.getDate() + daysAhead);
    return plan.tasks
      .filter((t) => {
        const d = new Date(t.date);
        d.setHours(0, 0, 0, 0);
        return d >= today && d <= future;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <PlansContext.Provider value={{
      plans, plan, loading, error, currentPlanId,
      setCurrentPlanId, createPlan, toggleTask, deletePlan,
      getDaysSinceStart, getTotalDays, getProgressPercent,
      getCurrentStageName, getUpcomingTasks,
    }}>
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error("usePlans must be used within PlansProvider");
  return ctx;
}
