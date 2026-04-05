import type { PlantingMethodKey } from "./plantingMethod";
import type { SoilTypeKey } from "./planGenerator";

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
  /** ถ้ามีจาก backend — ใช้ใน RAG context */
  soilType?: SoilTypeKey;
}
