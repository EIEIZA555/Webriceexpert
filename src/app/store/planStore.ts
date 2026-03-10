import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  generatePlan,
  getCurrentStage as getStageFromConfig,
  type PlanTask,
} from "../lib/planGenerator";

export interface PlantingPlan {
  id: string;
  varietyId: string;
  varietyName: string;
  startDate: string;
  plotName: string;
  landSize: string;
  totalDays: number;
  tasks: PlanTask[];
  createdAt: string;
}

interface PlanState {
  plans: PlantingPlan[];
  currentPlanId: string | null;
  /** current plan for convenience (derived from plans + currentPlanId) */
  plan: PlantingPlan | null;
  setCurrentPlanId: (id: string) => void;
  createPlan: (params: {
    varietyId: string;
    startDate: string;
    plotName: string;
    landSize: string;
  }) => void;
  toggleTask: (taskId: string) => void;
  getUpcomingTasks: (daysAhead?: number) => PlanTask[];
  getProgressPercent: () => number;
  getCurrentStage: () => string | null;
  getDaysSinceStart: () => number;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      currentPlanId: null,
      plan: null,

      setCurrentPlanId: (id) => {
        set((state) => {
          const target = state.plans.find((p) => p.id === id) ?? null;
          return {
            ...state,
            currentPlanId: target ? id : state.currentPlanId,
            plan: target ?? state.plan,
          };
        });
      },

      createPlan: ({ varietyId, startDate, plotName, landSize }) => {
        const { tasks, varietyName, totalDays } = generatePlan(
          varietyId,
          startDate,
        );

        const newPlan: PlantingPlan = {
          id: crypto.randomUUID(),
          varietyId,
          varietyName,
          startDate,
          plotName,
          landSize,
          totalDays,
          tasks,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const plans = [...state.plans, newPlan];
          return {
            ...state,
            plans,
            currentPlanId: newPlan.id,
            plan: newPlan,
          };
        });
      },

      toggleTask: (taskId) => {
        const { currentPlanId } = get();
        if (!currentPlanId) return;

        set((state) => {
          const plans = state.plans.map((plan) =>
            plan.id === currentPlanId
              ? {
                  ...plan,
                  tasks: plan.tasks.map((t) =>
                    t.id === taskId
                      ? { ...t, isCompleted: !t.isCompleted }
                      : t,
                  ),
                }
              : plan,
          );
          const plan = plans.find((p) => p.id === currentPlanId) ?? null;
          return { ...state, plans, plan };
        });
      },

      getUpcomingTasks: (daysAhead = 30) => {
        const { plan } = get();
        if (!plan) return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const future = new Date(today);
        future.setDate(future.getDate() + daysAhead);
        return plan.tasks
          .filter((t) => {
            const taskDate = new Date(t.date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate >= today && taskDate <= future;
          })
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getProgressPercent: () => {
        const { plan } = get();
        if (!plan) return 0;
        const days = get().getDaysSinceStart();
        return Math.min(100, Math.max(0, (days / plan.totalDays) * 100));
      },

      getCurrentStage: () => {
        const { plan } = get();
        if (!plan) return null;
        const days = get().getDaysSinceStart();
        const stage = getStageFromConfig(plan.varietyId, days);
        return stage ?? "เก็บเกี่ยวแล้ว";
      },

      getDaysSinceStart: () => {
        const { plan } = get();
        if (!plan) return 0;
        const start = new Date(plan.startDate);
        start.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.floor(
          (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        );
        return Math.max(0, diff);
      },
    }),
    { name: "rice-expert-plans" }
  )
);
