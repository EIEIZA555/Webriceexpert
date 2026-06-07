import type { RiceVariety } from "../../lib/types";

export type Variety = RiceVariety;

export const FIELD_ORDER = [
  "name",
  "collection_name",
  "is_photoperiod_sensitive",
  "supported_methods",
  "harvest_age_days",
  "tillering_day",
  "panicle_initiation_day",
  "heading_day",
  "fert1_rate",
  "fert2_rate",
  "fert2_formula",
] as const;

export const emptyVarietyForm = (): Partial<RiceVariety> => ({
  name: "",
  collection_name: "",
  harvest_age_days: undefined,
  is_photoperiod_sensitive: undefined,
  supported_methods: [],
  description: "",
  reference_url: "",
  tillering_day: undefined,
  panicle_initiation_day: undefined,
  heading_day: undefined,
  fert1_rate: undefined,
  fert2_rate: undefined,
  fert2_formula: "",
  fert1_note: "",
  fert2_note: "",
});
