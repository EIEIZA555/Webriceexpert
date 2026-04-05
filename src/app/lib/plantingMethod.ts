export type PlantingMethodKey = "transplant" | "broadcast" | "throw";

/** วันที่เริ่มแผน (เช่น วันเพาะกล้า) → วันปลูกจริง (day 0) ตามวิธีปลูก — ต้องสอดคล้องกับ PlansContext.createPlan */
export const PLANTING_DAY_OFFSET_FROM_PLAN_START: Record<PlantingMethodKey, number> = {
  transplant: 25,
  broadcast: 7,
  throw: 15,
};

/** แปลงวันเริ่มในแบบฟอร์มเป็นวันปลูกจริง (ISO yyyy-mm-dd) */
export function plantingDateFromPlanStartDate(planStartISO: string, method: PlantingMethodKey): string {
  const offset = PLANTING_DAY_OFFSET_FROM_PLAN_START[method];
  const [y, m, d] = planStartISO.split("-").map(Number);
  const planting = new Date(y, m - 1, d + offset);
  return `${planting.getFullYear()}-${String(planting.getMonth() + 1).padStart(2, "0")}-${String(planting.getDate()).padStart(2, "0")}`;
}

export const PLANTING_METHODS: Array<{
  key: PlantingMethodKey;
  label: string;
  description: string;
}> = [
  {
    key: "transplant",
    label: "นาดำ",
    description: "เพาะกล้า 25 วัน แล้วปักดำลงแปลง",
  },
  {
    key: "broadcast",
    label: "นาหว่าน",
    description: "หว่านเมล็ดงอกลงนาโดยตรง",
  },
  {
    key: "throw",
    label: "นาโยน",
    description: "เพาะกล้าในถาด 15 วัน แล้วโยนลงแปลง",
  },
];

export function getPlantingMethodLabel(key: PlantingMethodKey | undefined): string {
  if (!key) return "ไม่ระบุ";
  return PLANTING_METHODS.find((m) => m.key === key)?.label ?? key;
}
