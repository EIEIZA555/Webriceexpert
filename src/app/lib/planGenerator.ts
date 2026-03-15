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
    lifecycleDays: 110,
    stages: [
      { name: "ระยะต้นกล้า",  startDay: 0,  endDay: 14  },
      { name: "ระยะแตกกอ",   startDay: 15, endDay: 42  },
      { name: "ระยะออกดอก",  startDay: 43, endDay: 70  },
      { name: "ระยะสุกแก่",   startDay: 71, endDay: 110 },
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
