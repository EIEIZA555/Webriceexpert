import type { PlantingMethodKey } from "../../lib/plantingMethod";

export interface CreatePlanVarietyOption {
  id: string;
  name: string;
  supported_methods: string[];
  is_photoperiod_sensitive: boolean;
}

export interface CreatePlanFormData {
  variety: string;
  plantDate: string;
  landSize: string;
  plotName: string;
  plantingMethod: PlantingMethodKey | "";
  soilType: "clay" | "loam" | "sandy";
}
