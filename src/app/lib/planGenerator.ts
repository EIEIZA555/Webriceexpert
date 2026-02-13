import { addDays, format } from "date-fns";

export interface PlanTask {
  id: string;
  date: string; // ISO date
  day: number;
  stage: string;
  taskName: string;
  description: string;
  isCompleted: boolean;
}

export interface RiceVarietyConfig {
  id: string;
  name: string;
  lifecycleDays: number;
  stages: Array<{
    name: string;
    startDay: number;
    endDay: number;
    tasks: Array<{
      dayOffset: number;
      taskName: string;
      description: string;
    }>;
  }>;
}

/** Rice variety configurations with lifecycle stages and tasks */
export const RICE_VARIETIES: RiceVarietyConfig[] = [
  {
    id: "jasmine",
    name: "ข้าวหอมมะลิ",
    lifecycleDays: 120,
    stages: [
      {
        name: "ระยะต้นกล้า",
        startDay: 1,
        endDay: 15,
        tasks: [
          { dayOffset: 1, taskName: "เตรียมดินและหว่านเมล็ด", description: "ไถคราด และหว่านข้าวแห้งหรือปักดำ" },
          { dayOffset: 7, taskName: "ฉีดพ่นปุ๋ยทางใบ", description: "ปุ๋ยสูตร 21-21-21 อัตรา 50 กรัม/20 ลิตร" },
        ],
      },
      {
        name: "ระยะแตกกอ",
        startDay: 16,
        endDay: 45,
        tasks: [
          { dayOffset: 15, taskName: "ใส่ปุ๋ยสูตร A (หว่าน)", description: "ปุ๋ย 16-20-0 อัตรา 25 กก./ไร่" },
          { dayOffset: 30, taskName: "ระบายน้ำเพื่อให้รากได้รับออกซิเจน", description: "ระบายน้ำ 5-7 วัน เพื่อให้รากได้รับออกซิเจน" },
          { dayOffset: 40, taskName: "ใส่ปุ๋ยสูตร B", description: "ปุ๋ย 46-0-0 อัตรา 10 กก./ไร่" },
        ],
      },
      {
        name: "ระยะออกดอก",
        startDay: 46,
        endDay: 75,
        tasks: [
          { dayOffset: 50, taskName: "รักษาระดับน้ำ 5-10 ซม.", description: "อย่าให้ข้าวขาดน้ำช่วงตั้งท้อง" },
          { dayOffset: 65, taskName: "สำรวจโรคและแมลง", description: "ตรวจโรคไหม้ หนอน เพลี้ย" },
        ],
      },
      {
        name: "ระยะสุกแก่",
        startDay: 76,
        endDay: 120,
        tasks: [
          { dayOffset: 90, taskName: "ระบายน้ำก่อนเก็บเกี่ยว", description: "หยุดให้น้ำ 7-10 วันก่อนเกี่ยว" },
          { dayOffset: 115, taskName: "เตรียมเก็บเกี่ยว", description: "ตรวจความชื้นเมล็ด 25-28%" },
        ],
      },
    ],
  },
  {
    id: "rd43",
    name: "ข้าว RD43",
    lifecycleDays: 110,
    stages: [
      {
        name: "ระยะต้นกล้า",
        startDay: 1,
        endDay: 14,
        tasks: [
          { dayOffset: 1, taskName: "เตรียมดินและหว่าน", description: "ข้าว RD43 ทนแล้ง หว่านได้ทั้งนาหว่านและปักดำ" },
          { dayOffset: 7, taskName: "ปุ๋ยเร่งต้นกล้า", description: "ปุ๋ย 21-21-21 ทางใบ" },
        ],
      },
      {
        name: "ระยะแตกกอ",
        startDay: 15,
        endDay: 42,
        tasks: [
          { dayOffset: 14, taskName: "ใส่ปุ๋ยสูตร A", description: "ปุ๋ย 16-20-0 อัตรา 25 กก./ไร่" },
          { dayOffset: 28, taskName: "ระบายน้ำเพื่อ aeration", description: "ระบายน้ำ 5-7 วัน" },
        ],
      },
      {
        name: "ระยะออกดอก",
        startDay: 43,
        endDay: 70,
        tasks: [
          { dayOffset: 48, taskName: "รักษาระดับน้ำ", description: "ช่วงวิกฤติ - ห้ามขาดน้ำ" },
          { dayOffset: 60, taskName: "ตรวจโรคไหม้", description: "RD43 ต้านทานปานกลาง" },
        ],
      },
      {
        name: "ระยะสุกแก่",
        startDay: 71,
        endDay: 110,
        tasks: [
          { dayOffset: 85, taskName: "ระบายน้ำก่อนเก็บเกี่ยว", description: "หยุดให้น้ำ 7-10 วัน" },
          { dayOffset: 105, taskName: "เก็บเกี่ยว", description: "อายุประมาณ 110 วัน" },
        ],
      },
    ],
  },
  {
    id: "kk15",
    name: "ข้าวกข 15",
    lifecycleDays: 115,
    stages: [
      {
        name: "ระยะต้นกล้า",
        startDay: 1,
        endDay: 15,
        tasks: [
          { dayOffset: 1, taskName: "หว่านในพื้นที่น้ำท่วม", description: "กข15 ทนน้ำท่วมดี" },
          { dayOffset: 10, taskName: "ปุ๋ยเร่งกล้า", description: "ปุ๋ยทางใบ" },
        ],
      },
      {
        name: "ระยะแตกกอ",
        startDay: 16,
        endDay: 45,
        tasks: [
          { dayOffset: 15, taskName: "ใส่ปุ๋ย 16-20-0", description: "25 กก./ไร่" },
          { dayOffset: 35, taskName: "ระบายน้ำ aeration", description: "5-7 วัน" },
        ],
      },
      {
        name: "ระยะออกดอก",
        startDay: 46,
        endDay: 75,
        tasks: [
          { dayOffset: 55, taskName: "รักษาระดับน้ำ", description: "อย่าขาดน้ำ" },
          { dayOffset: 68, taskName: "ตรวจโรค", description: "สำรวจโรคและแมลง" },
        ],
      },
      {
        name: "ระยะสุกแก่",
        startDay: 76,
        endDay: 115,
        tasks: [
          { dayOffset: 92, taskName: "ระบายน้ำ", description: "หยุดให้น้ำก่อนเกี่ยว" },
          { dayOffset: 110, taskName: "เก็บเกี่ยว", description: "อายุประมาณ 115 วัน" },
        ],
      },
    ],
  },
  {
    id: "pathumthani",
    name: "ข้าวปทุมธานี",
    lifecycleDays: 100,
    stages: [
      {
        name: "ระยะต้นกล้า",
        startDay: 1,
        endDay: 12,
        tasks: [
          { dayOffset: 1, taskName: "หว่าน/ปักดำ", description: "ปทุมธานีโตเร็ว" },
          { dayOffset: 7, taskName: "ปุ๋ยเร่งกล้า", description: "ปุ๋ยทางใบ" },
        ],
      },
      {
        name: "ระยะแตกกอ",
        startDay: 13,
        endDay: 40,
        tasks: [
          { dayOffset: 12, taskName: "ใส่ปุ๋ย 16-20-0", description: "25 กก./ไร่" },
          { dayOffset: 28, taskName: "ระบายน้ำ aeration", description: "5-7 วัน" },
        ],
      },
      {
        name: "ระยะออกดอก",
        startDay: 41,
        endDay: 65,
        tasks: [
          { dayOffset: 48, taskName: "รักษาระดับน้ำ", description: "ช่วงตั้งท้อง" },
          { dayOffset: 58, taskName: "ตรวจโรคแมลง", description: "สำรวจแปลง" },
        ],
      },
      {
        name: "ระยะสุกแก่",
        startDay: 66,
        endDay: 100,
        tasks: [
          { dayOffset: 80, taskName: "ระบายน้ำ", description: "หยุดให้น้ำ" },
          { dayOffset: 95, taskName: "เก็บเกี่ยว", description: "อายุประมาณ 100 วัน" },
        ],
      },
    ],
  },
];

/**
 * Generate full planting plan timeline from variety and start date
 */
export function generatePlan(
  varietyId: string,
  startDate: string
): { tasks: PlanTask[]; varietyName: string; totalDays: number } {
  const variety = RICE_VARIETIES.find((v) => v.id === varietyId);
  if (!variety) {
    throw new Error(`Unknown variety: ${varietyId}`);
  }

  const start = new Date(startDate);
  const tasks: PlanTask[] = [];
  let taskId = 0;

  for (const stage of variety.stages) {
    for (const t of stage.tasks) {
      const taskDate = addDays(start, t.dayOffset);
      tasks.push({
        id: `task-${++taskId}`,
        date: format(taskDate, "yyyy-MM-dd"),
        day: t.dayOffset,
        stage: stage.name,
        taskName: t.taskName,
        description: t.description,
        isCompleted: false,
      });
    }
  }

  return {
    tasks,
    varietyName: variety.name,
    totalDays: variety.lifecycleDays,
  };
}

/**
 * Get current stage based on days since start
 */
export function getCurrentStage(
  varietyId: string,
  daysSinceStart: number
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
