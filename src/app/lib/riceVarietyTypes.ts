import type { RiceVarietyConfig } from "./planGenerator";

/** DAS จากวันปลูก | วันเก็บเกี่ยวคงที่แล้วย้อน milestone */
export type ScheduleMode = "DAS_BASED" | "FIXED_DATE";

/** milestone แบบ FIXED_DATE — ย้อนจากวันเก็บเกี่ยว */
export interface FixedMilestoneDef {
  name: string;
  daysBeforeHarvest: number;
}

/** นาปี / นาปรัง */
export type RiceSeasonType = "napee" | "naprang";

export const RICE_SEASON_LABELS: Record<RiceSeasonType, string> = {
  napee: "นาปี",
  naprang: "นาปรัง",
};

export interface RiceVarietyStageRow {
  name: string;
  startDay: number;
  endDay: number;
}

/** บันทึกพันธุ์ข้าว (localStorage + ผสมกับ backend) */
export interface RiceVarietyRecord {
  /** รหัสเดียวกับ collection_name / varietyId ในแผน */
  id: string;
  name: string;
  seasonType: RiceSeasonType;
  /** true = ไวต่อช่วงแสง (ข้าวไวแสง) */
  photoperiodSensitive: boolean;
  totalDays: number;
  stages: RiceVarietyStageRow[];
  isDefault: boolean;
  /** มีแถวใน GET /varieties/ ที่ collection_name ตรงกัน — ใช้สร้างแผนผ่าน API ได้ */
  backendSynced?: boolean;
  scheduleMode: ScheduleMode;
  /** FIXED_DATE: วัน-เดือนเก็บเกี่ยวคงที่ เช่น 11-25 */
  harvestMonthDay?: string;
  /** FIXED_DATE: milestone เรียงตาม daysBeforeHarvest มาก→น้อย */
  fixedMilestones?: FixedMilestoneDef[];
}

export function recordToConfig(r: RiceVarietyRecord): RiceVarietyConfig {
  return {
    id: r.id,
    name: r.name,
    lifecycleDays: r.totalDays,
    stages: r.stages.map((s) => ({
      name: s.name,
      startDay: s.startDay,
      endDay: s.endDay,
    })),
  };
}
