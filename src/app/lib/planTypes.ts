import type { SoilTypeKey } from "./planGenerator";
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
  soilType: SoilTypeKey;
  /** วิธีปลูก — กำหนดงานก่อน/หลัง DAS 0 และความหมายของวันเริ่มนับ */
  plantingMethod: PlantingMethodKey;
  tasks: PlanTask[];
  createdAt: string;
}
