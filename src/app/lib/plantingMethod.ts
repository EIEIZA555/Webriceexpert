export type PlantingMethodKey = "transplant" | "broadcast" | "throw";

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
