import type { PlantingMethodKey } from "./plantingMethod";

export type SoilTypeKey = "clay" | "loam" | "sandy";

export interface PlanTask {
  id: string;
  day: number;
  stage: string;
  taskName: string;
  description: string | null;
  date: string;
  isCompleted: boolean;
}

export interface PlanResources {
  seedKg: number;
  fertilizer1Kg: number;
  fertilizer1Formula: string;
  fertilizer2Kg: number;
  fertilizer2Formula: string;
  seedlingTrays: number | null;
}

export interface PlantingPlan {
  id: string;
  collectionName: string;
  varietyName: string;
  startDate: string;
  actualPlantingDate: string;
  areaRai: number;
  plotName: string | null;
  plantingMethod: PlantingMethodKey;
  soilType: SoilTypeKey;
  isPhotoperiodSensitive: boolean;
  tasks: PlanTask[];
  resources: PlanResources | null;
  createdAt: string;
}
