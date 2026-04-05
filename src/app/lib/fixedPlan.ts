/**
 * PRD-aligned Fixed Plan: stage breakpoints, milestones, fertilizer events,
 * constraints by stage, and helpers for RAG context (frontend-only; no API change).
 */

import type { PlanTask, PlantingPlan } from "./planTypes";
import { PLANTING_METHODS, type PlantingMethodKey } from "./plantingMethod";
import {
  RICE_VARIETIES,
  addDaysToISODate,
  getCurrentStage,
  getRD43FertilizerDescription,
  getStageByDay,
  type RiceVarietyConfig,
  type SoilTypeKey,
} from "./planGenerator";

function varietyListOrDefault(list?: RiceVarietyConfig[]): RiceVarietyConfig[] {
  return list && list.length > 0 ? list : RICE_VARIETIES;
}

/** 10 ระยะย่อยตาม PRD (3 ระยะหลัก → ระยะย่อย) */
export const CANONICAL_SUB_STAGE_KEYS = [
  "germination",
  "seedling",
  "tillering",
  "panicle_initiation",
  "booting",
  "heading",
  "milk",
  "dough",
  "maturity",
  "harvest_window",
] as const;

export type CanonicalSubStageKey = (typeof CANONICAL_SUB_STAGE_KEYS)[number];

export const CANONICAL_SUB_STAGE_LABELS: Record<CanonicalSubStageKey, string> = {
  germination: "ระยะงอก",
  seedling: "ระยะต้นกล้า",
  tillering: "ระยะแตกกอ",
  panicle_initiation: "ระยะรับท้อง (สร้างรวงอ่อน)",
  booting: "ระยะท้องแก่ (โผล่เหมย)",
  heading: "ระยะออกดอก",
  milk: "ระยะน้ำนม",
  dough: "ระยะสร้างแป้ง",
  maturity: "ระยะพลับพลึง / สุกแก่",
  harvest_window: "ช่วงเก็บเกี่ยว",
};

export interface FixedPlanDefinition {
  varietyId: string;
  totalDays: number;
  /** วันเริ่มต้นแต่ละระยะย่อย (DAS) ตามลำดับ CANONICAL_SUB_STAGE_KEYS */
  subStageStartDays: number[];
  milestones: Array<{ name: string; day: number }>;
  fertilizerEvents: Array<{ day: number; round: 1 | 2; note: string }>;
  constraintsByStage: Record<string, string[]>;
  sourceReferences: string[];
}

const DEFAULT_SOURCES = ["RICE_EXPERT_PRD.md", "Rice_Farming_Summary.md"];

function subStageEndDays(totalDays: number, starts: number[]): number[] {
  const ends: number[] = [];
  for (let i = 0; i < starts.length; i++) {
    const next = i < starts.length - 1 ? starts[i + 1] - 1 : totalDays;
    ends.push(Math.min(totalDays, Math.max(starts[i], next)));
  }
  return ends;
}

/** Fixed breakpoints สำหรับ RD43 (95 วัน) — อิง fixed plan ที่มีในระบบ */
function rd43SubStageStarts(): number[] {
  return [0, 3, 21, 46, 56, 66, 73, 81, 89, 93];
}

/** แปลงพันธุ์อื่น: ยืดสัดส่วนจากช่วงหลักในรายการพันธุ์ ให้ครบ 10 ช่วง */
function genericSubStageStarts(
  varietyId: string,
  totalDays: number,
  varietyList: RiceVarietyConfig[],
): number[] {
  const v = varietyList.find((x) => x.id === varietyId);
  if (!v) return [0, 1, 2, 3, 4, 5, 6, 7, 8, Math.max(9, totalDays - 1)];

  const [a, b, c, d] = v.stages;
  const s0 = 0;
  const s1 = Math.min(a.endDay, totalDays);
  const s2 = Math.min(b.startDay, totalDays);
  const s3 = Math.min(c.startDay, totalDays);
  const s4 = Math.min(d.startDay, totalDays);
  const harvest = totalDays;

  return [
    s0,
    Math.min(2, totalDays),
    Math.min(s1, totalDays),
    Math.min(s2, totalDays),
    Math.min(Math.floor((s2 + s3) / 2), totalDays),
    Math.min(s3, totalDays),
    Math.min(Math.floor((s3 + s4) / 2), totalDays),
    Math.min(s4, totalDays),
    Math.min(s4 + Math.max(1, Math.floor((harvest - s4) * 0.6)), totalDays),
    Math.min(Math.max(0, harvest - 2), totalDays),
  ];
}

export function getFixedPlanDefinition(
  varietyId: string,
  varietyListArg?: RiceVarietyConfig[],
): FixedPlanDefinition {
  const varietyList = varietyListOrDefault(varietyListArg);
  const v = varietyList.find((x) => x.id === varietyId);
  const totalDays = v?.lifecycleDays ?? 120;

  const subStageStartDays =
    varietyId === "rd43"
      ? rd43SubStageStarts()
      : genericSubStageStarts(varietyId, totalDays, varietyList);

  const ends = subStageEndDays(totalDays, subStageStartDays);

  const constraintsByStage: Record<string, string[]> = {
    [CANONICAL_SUB_STAGE_LABELS.heading]: [
      "ห้ามขาดน้ำเด็ดขาดช่วงออกดอก (ข้อกำหนดจากคู่มือ)",
    ],
    [CANONICAL_SUB_STAGE_LABELS.booting]: [
      "รักษาระดับน้ำให้สม่ำเสมอในช่วงรวงดันกาบ",
    ],
    [CANONICAL_SUB_STAGE_LABELS.maturity]: [
      "ระบายน้ำก่อนเก็บเกี่ยวตามแนวทางคู่มือ (ถ้ามีในคู่มือ)",
    ],
  };

  const milestones =
    v?.stages.map((st) => ({
      name: st.name,
      day: st.startDay,
    })) ?? [];

  const fertilizerEvents: FixedPlanDefinition["fertilizerEvents"] = [];

  if (varietyId === "rd43") {
    fertilizerEvents.push(
      { day: 21, round: 1, note: "ใส่ปุ๋ยรอบ 1 (ช่วงแตกกอ)" },
      { day: 46, round: 2, note: "ใส่ปุ๋ยรอบ 2 (ช่วงสร้างรวงอ่อน)" },
    );
  } else if (v) {
    const r1 = Math.min(v.stages[1]?.startDay ?? 20, totalDays - 10);
    const r2 = Math.min(v.stages[2]?.startDay ?? 45, totalDays - 5);
    fertilizerEvents.push(
      { day: r1, round: 1, note: "ใส่ปุ๋ยรอบ 1 (เร่งต้น) — ตาม Fixed Plan พันธุ์นี้" },
      { day: r2, round: 2, note: "ใส่ปุ๋ยรอบ 2 (รับรวง) — ตาม Fixed Plan พันธุ์นี้" },
    );
  }

  return {
    varietyId,
    totalDays,
    subStageStartDays,
    milestones,
    fertilizerEvents,
    constraintsByStage,
    sourceReferences: DEFAULT_SOURCES,
  };
}

export function getSubStageLabelAtDAS(
  varietyId: string,
  das: number,
  varietyListArg?: RiceVarietyConfig[],
): string {
  const def = getFixedPlanDefinition(varietyId, varietyListArg);
  const ends = subStageEndDays(def.totalDays, def.subStageStartDays);
  for (let i = 0; i < CANONICAL_SUB_STAGE_KEYS.length; i++) {
    const start = def.subStageStartDays[i];
    const end = ends[i];
    if (das >= start && das <= end) {
      const key = CANONICAL_SUB_STAGE_KEYS[i];
      return CANONICAL_SUB_STAGE_LABELS[key];
    }
  }
  return das > def.totalDays ? "หลังเก็บเกี่ยว" : CANONICAL_SUB_STAGE_LABELS.germination;
}

export function listSubStagesWithDAS(
  varietyId: string,
  varietyListArg?: RiceVarietyConfig[],
): Array<{
  key: CanonicalSubStageKey;
  label: string;
  startDay: number;
  endDay: number;
}> {
  const def = getFixedPlanDefinition(varietyId, varietyListArg);
  const ends = subStageEndDays(def.totalDays, def.subStageStartDays);
  return CANONICAL_SUB_STAGE_KEYS.map((key, i) => ({
    key,
    label: CANONICAL_SUB_STAGE_LABELS[key],
    startDay: def.subStageStartDays[i],
    endDay: ends[i],
  }));
}

function safeRandomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return `${prefix}_${(crypto as any).randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/** สูตรปุ๋ยตามพันธุ์ + ดิน (ฝั่ง client; อ้างอิง KB ภายในโปรเจกต์) */
export function getFertilizerRulesText(varietyId: string, soilType: SoilTypeKey): string {
  if (varietyId === "rd43") {
    return [
      `ปุ๋ยเร่งต้น รอบ 1 (DAS 21): ${getRD43FertilizerDescription(soilType, 1)}`,
      `ปุ๋ยสูตรรับรวง รอบ 2 (DAS 46): ${getRD43FertilizerDescription(soilType, 2)}`,
    ].join("\n");
  }
  if (soilType === "clay") {
    return "ช่วงเร่งต้น: ดินเหนียว • สูตร 16-20-0\nปุ๋ยสูตรรับรวง: 15-15-15 หรือ 0-0-60";
  }
  if (soilType === "sand") {
    return "ช่วงเร่งต้น: ดินทราย • 16-16-8 หรือ 46-0-0\nปุ๋ยสูตรรับรวง: 15-15-15 หรือ 0-0-60";
  }
  return "ดินร่วน: ไม่มีสูตรปุ๋ยละเอียดตามชนิดดินใน KB นี้ — ตอบจากคู่มือเท่านั้น ห้ามเดา";
}

export function buildFixedPlanSnapshotText(
  plan: PlantingPlan,
  das: number,
  varietyListArg?: RiceVarietyConfig[],
): string {
  const def = getFixedPlanDefinition(plan.varietyId, varietyListArg);
  const milestonesDated = def.milestones.map((m) => ({
    name: m.name,
    day: m.day,
    dateISO: addDaysToISODate(plan.startDate, m.day),
  }));
  const subStages = listSubStagesWithDAS(plan.varietyId, varietyListArg).map((s) => ({
    ...s,
    startDate: addDaysToISODate(plan.startDate, s.startDay),
    endDate: addDaysToISODate(plan.startDate, s.endDay),
  }));
  const currentSub = getSubStageLabelAtDAS(plan.varietyId, das, varietyListArg);
  const vl = varietyListOrDefault(varietyListArg);
  const currentMain = getCurrentStage(plan.varietyId, das, vl) ?? "-";

  return JSON.stringify(
    {
      totalDays: def.totalDays,
      plantingDate: plan.startDate,
      dasToday: das,
      currentMainStage: currentMain,
      currentSubStage: currentSub,
      milestones: milestonesDated,
      subStages: subStages,
      fertilizerEvents: def.fertilizerEvents,
      constraintsByStage: def.constraintsByStage,
      sourceReferences: def.sourceReferences,
      plantingMethod: plan.plantingMethod,
    },
    null,
    0,
  );
}

export function buildRagContextPack(
  plan: PlantingPlan & { soilType?: SoilTypeKey },
  das: number,
  varietyListArg?: RiceVarietyConfig[],
): string {
  const def = getFixedPlanDefinition(plan.varietyId, varietyListArg);
  const soil = plan.soilType ?? "loam";
  const fertilizerRules = getFertilizerRulesText(plan.varietyId, soil);
  const rd15Note =
    plan.varietyId === "kk15"
      ? "RD15/กข15: พันธุ์คู่แฝดจากหอมมะลิ 105 โดยรังสีแกมมา — ห้ามอ้างว่าเป็นพันธุ์ผสมจากสุพรรณบุรี"
      : null;

  const lines = [
    "---CONTEXT_PACK (อ้างอิงคู่มือ/RAG เท่านั้น; ห้ามสร้างแผนใหม่)---",
    `activePlotId: ${plan.id}`,
    `plotName: ${plan.plotName ?? ""}`,
    `varietyId: ${plan.varietyId}`,
    `varietyName: ${plan.varietyName}`,
    `plantingDate: ${plan.startDate}`,
    `soilType: ${soil}`,
    `plantingMethod: ${plan.plantingMethod}`,
    `วันที่นับเป็น DAS 0: ${PLANTING_METHODS.find((m) => m.key === plan.plantingMethod)?.label ?? "-"}`,
    `DAS: ${das}`,
    "",
    "fertilizerRules (จาก fixed plan / KB ภายในแอป):",
    fertilizerRules,
    "",
    "fixedPlanSnapshot (JSON):",
    buildFixedPlanSnapshotText(plan, das, varietyListArg),
    "",
    "policy: ต้อง cite แหล่งจาก KB; ถ้าไม่มีในคู่มือให้ตอบว่าไม่มีข้อมูลในคู่มือ",
    rd15Note ? `rd15OriginNote: ${rd15Note}` : "",
    "---END_CONTEXT_PACK---",
    "",
  ].filter(Boolean);

  return lines.join("\n");
}

export function generateFixedPlanTasks(params: {
  varietyId: string;
  startDate: string;
  soilType: SoilTypeKey;
  plantingMethod: PlantingMethodKey;
  varietyList?: RiceVarietyConfig[];
}): PlanTask[] {
  const { varietyId, startDate, soilType, plantingMethod } = params;
  const vl = varietyListOrDefault(params.varietyList);
  const def = getFixedPlanDefinition(varietyId, vl);
  const tasks: PlanTask[] = [];

  const stageAt = (day: number) => getStageByDay(varietyId, day, vl);

  const push = (
    day: number,
    taskName: string,
    description: string | null,
    stageLabel: string,
  ) => {
    tasks.push({
      id: safeRandomId("task"),
      day,
      stage: stageLabel,
      taskName,
      description,
      date: addDaysToISODate(startDate, day),
      isCompleted: false,
    });
  };

  /** งานตามวิธีปลูก — DAS 0 = วันที่ผู้ใช้เลือก */
  if (plantingMethod === "transplant") {
    push(
      -18,
      "การเพาะกล้า",
      "ช่วงประมาณ 1–20 วันก่อนวันปักดำ — ดูแลความชื้น ปุ๋ยเพาะกล้า ตามคู่มือ",
      "ก่อนปักดำ",
    );
    push(-3, "เตรียมถอนกล้า", "ลดน้ำแปลงเพาะก่อนถอน 1–2 วัน", "ก่อนปักดำ");
    push(
      0,
      "การถอนกล้าและปักดำ",
      "วันนี้คือ DAS 0 = วันปักดำในแปลงนา (เริ่มนับตามไทม์ไลน์)",
      stageAt(0) ?? "ระยะต้นกล้า",
    );
  } else if (plantingMethod === "broadcast") {
    push(
      -1,
      "การแช่และบ่มเมล็ดพันธุ์",
      "แช่ประมาณ 24 ชม. บ่ม 24–48 ชม. ตามคู่มือ",
      "ก่อนหว่าน",
    );
    push(
      0,
      "การทำเทือกและหว่านน้ำตม",
      "จัดเลน/น้ำตม แล้วหว่าน — DAS 0 = วันหว่านเมล็ดลงนา",
      stageAt(0) ?? "ระยะต้นกล้า",
    );
  } else {
    push(-2, "การไถกลบ / ไถแปร", "เตรียมดินแห้งก่อนหว่านหรือหยอด", "ก่อนหว่าน");
    push(
      0,
      "การหว่านเมล็ด / หยอด",
      "DAS 0 = วันหว่านหรือหยอดเมล็ด",
      stageAt(0) ?? "ระยะต้นกล้า",
    );
    push(
      2,
      "การให้น้ำหลังหว่าน",
      "รดหรือย่นน้ำเพื่อกระตุ้นการงอก",
      stageAt(2) ?? "ระยะต้นกล้า",
    );
  }

  if (varietyId === "rd43") {
    const dayAfterPlant =
      plantingMethod === "transplant"
        ? "ตรวจกล้าหลังปักดำ / การตั้งตัว"
        : "ตรวจการงอก ต้นกล้าแรก";
    push(1, dayAfterPlant, null, stageAt(1) ?? "ระยะกล้า");
    push(10, "ตรวจระดับน้ำตื้น (คุมวัชพืช)", null, stageAt(10) ?? "ระยะกล้า");
    push(
      21,
      "ใส่ปุ๋ยเร่งต้น (รอบ 1)",
      getRD43FertilizerDescription(soilType, 1),
      stageAt(21) ?? "ระยะแตกกอ",
    );
    push(35, "พิจารณาแกล้งข้าว (AWD) ตามความเหมาะสม", null, stageAt(35) ?? "ระยะแตกกอ");
    push(
      46,
      "ใส่ปุ๋ยสูตรรับรวง (รอบ 2)",
      getRD43FertilizerDescription(soilType, 2),
      stageAt(46) ?? "ระยะรับท้อง",
    );
    push(60, "ตรวจรวง/น้ำหนักช่อ — เตรียมช่วงออกดอก", null, stageAt(60) ?? "ระยะรับท้อง");
    push(
      66,
      "เร่งรักษาระดับน้ำช่วงออกดอก (ห้ามขาดน้ำ)",
      def.constraintsByStage[CANONICAL_SUB_STAGE_LABELS.heading]?.[0] ?? null,
      stageAt(66) ?? "ระยะออกดอกและสุกแก่",
    );
    push(85, "เตรียมเก็บเกี่ยว / ตรวจความชื้นเมล็ด", null, stageAt(85) ?? "ระยะออกดอกและสุกแก่");
    push(95, "เก็บเกี่ยว (ตาม fixed plan RD43)", "เก็บเกี่ยว DAS 95", stageAt(95) ?? "ระยะออกดอกและสุกแก่");
  } else {
    const v = vl.find((x) => x.id === varietyId);
    const harvestDay = v?.lifecycleDays ?? 120;
    const fe = def.fertilizerEvents;
    for (const e of fe) {
      push(
        e.day,
        e.round === 1 ? "ใส่ปุ๋ยเร่งต้น (รอบ 1)" : "ใส่ปุ๋ยสูตรรับรวง (รอบ 2)",
        getFertilizerRulesText(varietyId, soilType),
        stageAt(e.day) ?? "ตามระยะ",
      );
    }
    push(
      Math.floor(harvestDay * 0.55),
      "ตรวจน้ำช่วงรับท้อง — ห้ามให้ขาดน้ำก่อนออกดอก",
      null,
      stageAt(Math.floor(harvestDay * 0.55)) ?? "ระยะออกดอก",
    );
    push(
      harvestDay,
      "เก็บเกี่ยว (ตาม fixed plan พันธุ์นี้)",
      `เก็บเกี่ยว DAS ${harvestDay}`,
      stageAt(harvestDay) ?? "เก็บเกี่ยว",
    );
  }

  tasks.sort((a, b) => a.day - b.day);

  const seen = new Set<string>();
  return tasks.filter((t) => {
    const k = `${t.day}:${t.taskName}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
