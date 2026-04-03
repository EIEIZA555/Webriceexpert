export interface RiceVarietyConfig {
  id: string;
  name: string;
  lifecycleDays: number;
  stages: Array<{
    name: string;
    startDay: number;
    endDay: number;
  }>;
}

export type SoilTypeKey = "clay" | "loam" | "sand";

export const SOIL_TYPES: Array<{ key: SoilTypeKey; label: string }> = [
  { key: "clay", label: "ดินเหนียว" },
  { key: "loam", label: "ดินร่วน" },
  { key: "sand", label: "ดินทราย" },
];

function getDateOnlyISO(isoOrDateString: string): string {
  // Expect `YYYY-MM-DD` from input type="date".
  // If backend ever supplies a full ISO string, this extracts the date portion.
  return isoOrDateString.slice(0, 10);
}

export function addDaysToISODate(dateISO: string, dayOffset: number): string {
  const iso = getDateOnlyISO(dateISO);
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  // Use local timezone to avoid day-shift in UI.
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + dayOffset);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const RICE_VARIETIES: RiceVarietyConfig[] = [
  {
    id: "jasmine",
    name: "ข้าวหอมมะลิ",
    lifecycleDays: 120,
    stages: [
      { name: "ระยะต้นกล้า",  startDay: 0,  endDay: 15  },
      { name: "ระยะแตกกอ",   startDay: 16, endDay: 45  },
      { name: "ระยะออกดอก",  startDay: 46, endDay: 75  },
      { name: "ระยะสุกแก่",   startDay: 76, endDay: 120 },
    ],
  },
  {
    id: "rd43",
    name: "ข้าว RD43",
    lifecycleDays: 95,
    stages: [
      // Fixed-plan (DAS): 0-20 seedling, 21-45 tillering (fertilizer round 1),
      // 46-65 panicle initiation (fertilizer round 2), 66-95 flowering + ripening (harvest at day 95)
      { name: "ระยะกล้า", startDay: 0, endDay: 20 },
      { name: "ระยะแตกกอ", startDay: 21, endDay: 45 },
      { name: "ระยะสร้างรวงอ่อน", startDay: 46, endDay: 65 },
      { name: "ระยะออกดอกและสุกแก่", startDay: 66, endDay: 95 },
    ],
  },
  {
    id: "kk15",
    name: "ข้าวกข 15",
    lifecycleDays: 115,
    stages: [
      { name: "ระยะต้นกล้า",  startDay: 0,  endDay: 15  },
      { name: "ระยะแตกกอ",   startDay: 16, endDay: 45  },
      { name: "ระยะออกดอก",  startDay: 46, endDay: 75  },
      { name: "ระยะสุกแก่",   startDay: 76, endDay: 115 },
    ],
  },
  {
    id: "pathumthani",
    name: "ข้าวปทุมธานี",
    lifecycleDays: 100,
    stages: [
      { name: "ระยะต้นกล้า",  startDay: 0,  endDay: 12  },
      { name: "ระยะแตกกอ",   startDay: 13, endDay: 40  },
      { name: "ระยะออกดอก",  startDay: 41, endDay: 65  },
      { name: "ระยะสุกแก่",   startDay: 66, endDay: 100 },
    ],
  },
];

export function getCurrentStage(
  varietyId: string,
  daysSinceStart: number,
): string | null {
  const variety = RICE_VARIETIES.find((v) => v.id === varietyId);
  if (!variety) return null;
  for (const stage of variety.stages) {
    if (daysSinceStart >= stage.startDay && daysSinceStart <= stage.endDay) {
      return stage.name;
    }
  }
  return null;
}

export function getStageByDay(varietyId: string, day: number): string | null {
  return getCurrentStage(varietyId, day);
}

export function getRD43FertilizerDescription(soilType: SoilTypeKey, round: 1 | 2): string {
  // Source: `Rice_Farming_Summary.md` + `RICE_EXPERT_PRD.md` (internal knowledge base).
  // Note: In this repo we have explicit fertilizer guidance for clay and sand.
  // If the KB doesn't provide loam-specific fertilizer for that round, we return a no-data message
  // to comply with anti-hallucination.
  if (round === 1) {
    switch (soilType) {
      case "clay":
        return "ใส่ปุ๋ยรอบที่ 1 (เร่งต้น) • ดินเหนียว • สูตร: 16-20-0";
      case "sand":
        return "ใส่ปุ๋ยรอบที่ 1 (เร่งต้น) • ดินทราย • สูตร: 16-16-8 หรือ 46-0-0";
      case "loam":
        return "ใส่ปุ๋ยรอบที่ 1 (เร่งต้น) • ดินร่วน • ไม่มีข้อมูลสูตรปุ๋ยสำหรับดินร่วนใน KB นี้";
      default:
        return "ใส่ปุ๋ยรอบที่ 1 • ไม่มีข้อมูลสูตรปุ๋ยสำหรับชนิดดินนี้ใน KB";
    }
  }

  // round === 2
  return `ใส่ปุ๋ยรอบที่ 2 (รับรวง) • ทุกชนิดดิน (ตาม KB) • สูตร: 15-15-15 หรือ 0-0-60`;
}
