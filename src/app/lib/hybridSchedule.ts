import { differenceInCalendarDays } from "date-fns";
import type { PlantingPlan } from "./planTypes";
import type { RiceVarietyRecord, ScheduleMode } from "./riceVarietyTypes";
import { addDaysToISODate, getCurrentStage, type RiceVarietyConfig } from "./planGenerator";

export type { ScheduleMode } from "./riceVarietyTypes";

function parseMonthDay(md: string): { month: number; day: number } {
  const [m, d] = md.split("-").map((x) => Number(x));
  return { month: m, day: d };
}

/**
 * วันเก็บเกี่ยวเป้าหมาย: ถ้าวันปลูกเลยวัน MM-DD ของปีนั้นแล้ว → ใช้ปีถัดไป
 */
export function resolveHarvestDateForSeason(plantingISO: string, harvestMonthDay: string): string {
  const plant = new Date(`${plantingISO.slice(0, 10)}T12:00:00`);
  const y = plant.getFullYear();
  const { month, day } = parseMonthDay(harvestMonthDay);
  let harvest = new Date(y, month - 1, day, 12, 0, 0, 0);
  if (plant.getTime() > harvest.getTime()) {
    harvest = new Date(y + 1, month - 1, day, 12, 0, 0, 0);
  }
  const yyyy = harvest.getFullYear();
  const mm = String(harvest.getMonth() + 1).padStart(2, "0");
  const dd = String(harvest.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function daysSincePlantingCalendar(plan: PlantingPlan): number {
  const start = new Date(`${plan.startDate.slice(0, 10)}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.max(0, differenceInCalendarDays(today, start));
}

export function daysUntilHarvest(harvestISO: string): number {
  const h = new Date(`${harvestISO.slice(0, 10)}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  h.setHours(0, 0, 0, 0);
  return differenceInCalendarDays(h, today);
}

/** ปลูกช้าเกินไปสำหรับพันธุ์ FIXED_DATE (หน้าต่ำกว่าเกณฑ์วันจากปลูกถึงเก็บเกี่ยว) */
export function shouldWarnLatePlantingFixed(
  plantingISO: string,
  harvestISO: string,
  minDaysCropWindow = 90,
): boolean {
  const w = differenceInCalendarDays(
    new Date(`${harvestISO.slice(0, 10)}T12:00:00`),
    new Date(`${plantingISO.slice(0, 10)}T12:00:00`),
  );
  return w < minDaysCropWindow;
}

export interface HybridScheduleResult {
  mode: ScheduleMode;
  /** progress 0–100 เทียบกับวันเก็บเกี่ยวเป้าหมาย */
  progressPercent: number;
  /** ข้อความบรรทัดเดียวสำหรับการ์ดแปลง */
  plotSummaryLine: string;
  /** วันเก็บเกี่ยว ISO (FIXED_DATE เท่านั้น) */
  harvestDateISO?: string;
  /** เหลือกี่วันถึงเก็บเกี่ยว (อาจติดลบถ้าเลยแล้ว) */
  daysToHarvest?: number;
  /** วันรวมจากปลูกถึงเก็บเกี่ยว */
  totalCycleDays: number;
  /** วันที่นับจากวันปลูก (ปฏิทิน) */
  daysSincePlant: number;
  showFixedWarning: boolean;
}

export function computeHybridSchedule(
  plan: PlantingPlan,
  record: RiceVarietyRecord | undefined,
  varietyConfigs: RiceVarietyConfig[],
): HybridScheduleResult {
  const mode: ScheduleMode = record?.scheduleMode ?? "DAS_BASED";
  const daysSincePlant = daysSincePlantingCalendar(plan);

  if (mode === "FIXED_DATE" && record?.harvestMonthDay && record.fixedMilestones?.length) {
    const harvestISO = resolveHarvestDateForSeason(plan.startDate, record.harvestMonthDay);
    const totalCycleDays = Math.max(
      1,
      differenceInCalendarDays(
        new Date(`${harvestISO}T12:00:00`),
        new Date(`${plan.startDate.slice(0, 10)}T12:00:00`),
      ),
    );
    const dth = daysUntilHarvest(harvestISO);
    const pct = Math.min(
      100,
      Math.max(0, (daysSincePlant / totalCycleDays) * 100),
    );
    const harvestLabel = formatThaiShort(harvestISO);
    const plotSummaryLine =
      dth > 0
        ? `เหลืออีก ${dth} วัน ถึงวันเก็บเกี่ยว (${harvestLabel})`
        : dth === 0
          ? `วันเก็บเกี่ยวเป้าหมาย: ${harvestLabel}`
          : `เลยวันเก็บเกี่ยวเป้าหมาย (${harvestLabel}) แล้ว ${-dth} วัน`;
    return {
      mode,
      progressPercent: pct,
      plotSummaryLine,
      harvestDateISO: harvestISO,
      daysToHarvest: dth,
      totalCycleDays,
      daysSincePlant,
      showFixedWarning: shouldWarnLatePlantingFixed(plan.startDate, harvestISO),
    };
  }

  const cfg = varietyConfigs.find((v) => v.id === plan.varietyId);
  const total = cfg?.lifecycleDays ?? 120;
  const pct = Math.min(100, Math.max(0, (daysSincePlant / total) * 100));
  const left = Math.max(0, total - daysSincePlant);
  const plotSummaryLine = `อายุข้าว ${daysSincePlant} วัน / เหลืออีก ${left} วันเก็บเกี่ยว`;
  return {
    mode: "DAS_BASED",
    progressPercent: pct,
    plotSummaryLine,
    totalCycleDays: total,
    daysSincePlant,
    showFixedWarning: false,
  };
}

function formatThaiShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  return `${d} ${months[m - 1]}`;
}

/** milestone สำหรับปฏิทิน (DAS_BASED) — วันเริ่มแต่ละระยะ + วันเก็บเกี่ยวตามอายุพันธุ์ */
export function getDasMilestoneEvents(
  plan: PlantingPlan,
  cfg: RiceVarietyConfig | undefined,
): Array<{ name: string; dateISO: string }> {
  if (!cfg?.stages?.length) return [];
  const out: Array<{ name: string; dateISO: string }> = [];
  for (const s of cfg.stages) {
    out.push({
      name: `${s.name} (เริ่มระยะ)`,
      dateISO: addDaysToISODate(plan.startDate, s.startDay),
    });
  }
  out.push({
    name: "เก็บเกี่ยว (เป้าหมาย)",
    dateISO: addDaysToISODate(plan.startDate, cfg.lifecycleDays),
  });
  return out;
}

/** milestone สำหรับปฏิทิน (FIXED_DATE) */
export function getFixedMilestoneEvents(
  plan: PlantingPlan,
  record: RiceVarietyRecord,
): Array<{ name: string; dateISO: string }> {
  if (record.scheduleMode !== "FIXED_DATE" || !record.harvestMonthDay || !record.fixedMilestones?.length) {
    return [];
  }
  const harvest = resolveHarvestDateForSeason(plan.startDate, record.harvestMonthDay);
  return record.fixedMilestones.map((m) => ({
    name: m.name,
    dateISO: addDaysToISODate(harvest, -m.daysBeforeHarvest),
  }));
}

/** ระยะปัจจุบัน — FIXED ใช้ช่วงวันที่ milestone */
export function getCurrentStageHybrid(
  plan: PlantingPlan,
  record: RiceVarietyRecord | undefined,
  daysSinceStartForTasks: number,
  varietyConfigs: RiceVarietyConfig[],
): string | null {
  const mode = record?.scheduleMode ?? "DAS_BASED";
  if (mode !== "FIXED_DATE" || !record?.harvestMonthDay || !record.fixedMilestones?.length) {
    return getCurrentStage(plan.varietyId, daysSinceStartForTasks, varietyConfigs);
  }

  const harvest = resolveHarvestDateForSeason(plan.startDate, record.harvestMonthDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const points = record.fixedMilestones
    .map((m) => ({
      name: m.name,
      date: new Date(`${addDaysToISODate(harvest, -m.daysBeforeHarvest)}T12:00:00`),
      daysBefore: m.daysBeforeHarvest,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const harvestDate = new Date(`${harvest}T12:00:00`);
  if (today.getTime() >= harvestDate.getTime()) {
    return points.find((p) => p.daysBefore === 0)?.name ?? "เก็บเกี่ยว";
  }

  for (let i = 0; i < points.length; i++) {
    const cur = points[i].date;
    const next = points[i + 1]?.date ?? harvestDate;
    if (today >= cur && today < next) {
      return points[i].name;
    }
  }
  if (today < points[0].date) {
    return `ก่อน${points[0].name}`;
  }
  return points[points.length - 1]?.name ?? null;
}
