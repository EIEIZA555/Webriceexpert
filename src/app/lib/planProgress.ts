import type { PlanTask } from "./planTypes";

export interface PlanProgress {
  days: number;
  pct: number;
  total: number;
  stage: string;
}

type TaskWithDate = Pick<PlanTask, "date">;
type TaskWithDay = Pick<PlanTask, "day">;
type TaskForProgress = Pick<PlanTask, "day" | "date" | "stage">;

export function getFirstTaskDate(tasks: TaskWithDate[]): string | null {
  if (!tasks.length) return null;
  return tasks.reduce(
    (min, t) => (t.date < min ? t.date : min),
    tasks[0].date,
  );
}

export function getDaysSinceStartFromTasks(tasks: TaskWithDate[]): number {
  const firstDate = getFirstTaskDate(tasks);
  if (!firstDate) return 0;
  const start = new Date(`${firstDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
}

export function getTotalDaysFromTasks(tasks: TaskWithDay[]): number {
  if (!tasks.length) return 0;
  const minDay = Math.min(...tasks.map((t) => t.day));
  const maxDay = Math.max(...tasks.map((t) => t.day));
  return maxDay - minDay;
}

export function getProgressPercentFromTasks(tasks: TaskForProgress[]): number {
  const total = getTotalDaysFromTasks(tasks);
  if (!total) return 0;
  return Math.min(
    100,
    Math.max(0, (getDaysSinceStartFromTasks(tasks) / total) * 100),
  );
}

export function getCurrentStageNameFromTasks(
  tasks: TaskForProgress[],
  daysSinceStart?: number,
): string | null {
  if (!tasks.length) return null;
  const das = daysSinceStart ?? getDaysSinceStartFromTasks(tasks);
  const minDay = Math.min(...tasks.map((t) => t.day));
  const currentDay = das + minDay;
  const sorted = [...tasks].sort(
    (a, b) => Math.abs(a.day - currentDay) - Math.abs(b.day - currentDay),
  );
  return sorted[0]?.stage ?? "เก็บเกี่ยวแล้ว";
}

export function computePlanProgress(tasks: TaskForProgress[]): PlanProgress {
  if (!tasks.length) return { days: 0, pct: 0, total: 0, stage: "-" };
  const days = getDaysSinceStartFromTasks(tasks);
  const total = getTotalDaysFromTasks(tasks);
  const pct = getProgressPercentFromTasks(tasks);
  const stage = getCurrentStageNameFromTasks(tasks, days) ?? "-";
  return { days, pct, total, stage };
}
