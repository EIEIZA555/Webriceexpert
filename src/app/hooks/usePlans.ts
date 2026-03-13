import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { RICE_VARIETIES, getCurrentStage } from "../lib/planGenerator";

export interface PlanTask {
  id: string;
  day: number;
  stage: string;
  taskName: string;
  description: string | null;
  date: string;
  isCompleted: boolean;
}

export interface PlantingPlan {
  id: string;
  varietyId: string;
  varietyName: string;
  startDate: string;
  areaRai: number;
  plotName: string | null;
  tasks: PlanTask[];
  createdAt: string;
}

interface ApiTask {
  id: string;
  day: number;
  stage: string;
  task_name: string;
  description: string | null;
  date: string;
  is_completed: boolean;
}

interface ApiPlan {
  id: string;
  variety_id: string;
  variety_name: string;
  start_date: string;
  area_rai: number;
  plot_name: string | null;
  tasks: ApiTask[];
  created_at: string;
}

function mapTask(t: ApiTask): PlanTask {
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

function mapPlan(p: ApiPlan): PlantingPlan {
  return {
    id: p.id,
    varietyId: p.variety_id,
    varietyName: p.variety_name,
    startDate: p.start_date,
    areaRai: p.area_rai,
    plotName: p.plot_name,
    tasks: p.tasks.map(mapTask),
    createdAt: p.created_at,
  };
}

const CURRENT_PLAN_KEY = "rice_expert_current_plan_id";

export function usePlans() {
  const [plans, setPlans] = useState<PlantingPlan[]>([]);
  const [currentPlanId, setCurrentPlanIdState] = useState<string | null>(
    () => localStorage.getItem(CURRENT_PLAN_KEY),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const data = await apiFetch<ApiPlan[]>("/plans/", {}, true);
      const mapped = data.map(mapPlan);
      setPlans(mapped);
      // ถ้า currentPlanId ไม่มีในรายการ → ใช้อันแรก
      setCurrentPlanIdState((prev) => {
        if (prev && mapped.find((p) => p.id === prev)) return prev;
        const first = mapped[0]?.id ?? null;
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
    }) => {
      const variety = RICE_VARIETIES.find((v) => v.id === params.varietyId)!;

      const body = {
        variety_id: params.varietyId,
        variety_name: variety.name,
        start_date: params.startDate,
        area_rai: parseFloat(params.landSize),
        plot_name: params.plotName,
      };

      const data = await apiFetch<ApiPlan>("/plans/", {
        method: "POST",
        body: JSON.stringify(body),
      }, true);

      const newPlan = mapPlan(data);
      setPlans((prev) => [...prev, newPlan]);
      setCurrentPlanId(newPlan.id);
      return newPlan;
    },
    [setCurrentPlanId],
  );

  const toggleTask = useCallback(async (planId: string, taskId: string) => {
    const data = await apiFetch<ApiTask>(
      `/plans/${planId}/tasks/${taskId}/toggle`,
      { method: "PATCH" },
      true,
    );
    const updated = mapTask(data);
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? updated : t)) }
          : p,
      ),
    );
  }, []);

  const deletePlan = useCallback(async (planId: string) => {
    await apiFetch(`/plans/${planId}`, { method: "DELETE" }, true);
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
  }, [currentPlanId]);

  // derived
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

  return {
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
  };
}
