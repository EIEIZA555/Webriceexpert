export type PlantingMethodKey = "transplanting" | "wet_seeded" | "dry_seeded";

export const PLANTING_METHODS: Array<{
  key: PlantingMethodKey;
  label: string;
  description: string;
  dasZeroMeaning: string;
}> = [
  {
    key: "transplanting",
    label: "นาปักดำ",
    description: "เพาะกล้าแล้วนำไปปักในแปลง — DAS 0 = วันปักดำ",
    dasZeroMeaning: "วันที่ปักดำ (เริ่มนับวันต้นในแปลงนา)",
  },
  {
    key: "wet_seeded",
    label: "นาหว่านน้ำตม",
    description: "ทำเทือกแล้วหว่านในนา — DAS 0 = วันหว่านเมล็ดลงนา",
    dasZeroMeaning: "วันที่หว่านเมล็ดลงนา (น้ำตม)",
  },
  {
    key: "dry_seeded",
    label: "นาหว่านแห้ง / หยอด",
    description: "เตรียมดินแห้งแล้วหว่านหรือหยอด — DAS 0 = วันหว่าน/หยอด",
    dasZeroMeaning: "วันที่หว่านหรือหยอดเมล็ด",
  },
];

export function getPlantingMethodLabel(key: PlantingMethodKey | undefined): string {
  if (!key) return "ไม่ระบุ";
  return PLANTING_METHODS.find((m) => m.key === key)?.label ?? key;
}
