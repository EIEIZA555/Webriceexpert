import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generatePlan, getCurrentStage as getStageFromConfig, type PlanTask } from "../lib/planGenerator";

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
  createPlan: (params: {
    varietyId: string;
    startDate: string;
    plotName: string;
    landSize: string;
  }) => void;
  setCurrentPlan: (planId: string | null) => void;
  toggleTask: (taskId: string) => void;
  getCurrentPlan: () => PlantingPlan | null;
  getUpcomingTasks: (daysAhead?: number) => PlanTask[];
  getProgressPercent: (plan?: PlantingPlan | null) => number;
  getCurrentStage: (plan?: PlantingPlan | null) => string | null;
  getDaysSinceStart: (plan?: PlantingPlan | null) => number;
  getStats: () => { totalPlots: number; totalArea: string; readyToHarvest: number };
}

function createPlanId() {
  return `plot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      currentPlanId: null,

      createPlan: ({ varietyId, startDate, plotName, landSize }) => {
        const { tasks, varietyName, totalDays } = generatePlan(varietyId, startDate);
        const id = createPlanId();
        const newPlan: PlantingPlan = {
          id,
          varietyId,
          varietyName,
          startDate,
          plotName,
          landSize,
          totalDays,
          tasks,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          plans: [...s.plans, newPlan],
          currentPlanId: id,
        }));
      },

      setCurrentPlan: (planId) => set({ currentPlanId: planId }),

      toggleTask: (taskId) => {
        const { plans, currentPlanId } = get();
        const plan = plans.find((p) => p.id === currentPlanId);
        if (!plan) return;
        const updatedTasks = plan.tasks.map((t) =>
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        set({
          plans: plans.map((p) =>
            p.id === currentPlanId ? { ...p, tasks: updatedTasks } : p
          ),
        });
      },

      getCurrentPlan: () => {
        const { plans, currentPlanId } = get();
        if (!currentPlanId) return plans[0] ?? null;
        return plans.find((p) => p.id === currentPlanId) ?? plans[0] ?? null;
      },

      getUpcomingTasks: (daysAhead = 30) => {
        const plan = get().getCurrentPlan();
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

      getProgressPercent: (plan) => {
        const p = plan ?? get().getCurrentPlan();
        if (!p) return 0;
        const days = get().getDaysSinceStart(p);
        return Math.min(100, Math.max(0, (days / p.totalDays) * 100));
      },

      getCurrentStage: (plan) => {
        const p = plan ?? get().getCurrentPlan();
        if (!p) return null;
        const days = get().getDaysSinceStart(p);
        const stage = getStageFromConfig(p.varietyId, days);
        return stage ?? "เก็บเกี่ยวแล้ว";
      },

      getDaysSinceStart: (plan) => {
        const p = plan ?? get().getCurrentPlan();
        if (!p) return 0;
        const start = new Date(p.startDate);
        start.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
      },

      getStats: () => {
        const { plans } = get();
        const totalPlots = plans.length;
        const totalArea = plans
          .reduce((sum, p) => sum + parseFloat(p.landSize) || 0, 0)
          .toFixed(1);
        const readyToHarvest = plans.filter((p) => {
          const days = get().getDaysSinceStart(p);
          return days >= p.totalDays;
        }).length;
        return { totalPlots, totalArea, readyToHarvest };
      },
    }),
    { name: "rice-expert-plans" }
  )
);
