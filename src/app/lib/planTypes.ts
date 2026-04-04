import type { PlantingMethodKey } from "./plantingMethod";

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
  plantingMethod: PlantingMethodKey;
  tasks: PlanTask[];
  createdAt: string;
}
