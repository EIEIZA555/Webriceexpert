import type { PlantingPlan } from "./planTypes";
import { getPlantingMethodLabel } from "./plantingMethod";

interface PlanContextHelpers {
  getDaysSinceStart: () => number;
  getCurrentStageName: () => string | null;
  getUpcomingTasks: (days: number) => PlantingPlan["tasks"];
}

export function buildPlanChatContext(
  plan: PlantingPlan,
  helpers: PlanContextHelpers,
): string {
  const das = helpers.getDaysSinceStart();
  const stage = helpers.getCurrentStageName() ?? "ไม่ระบุระยะ";
  const today = new Date().toISOString().slice(0, 10);

  const todayTasks = plan.tasks.filter((t) => t.date.slice(0, 10) === today);
  const todayText =
    todayTasks.length > 0
      ? todayTasks.map((t) => `- ${t.taskName}: ${t.description}`).join("\n")
      : "ไม่มีงานวันนี้";

  const upcomingTasks = helpers.getUpcomingTasks(7).filter(
    (t) => t.date.slice(0, 10) !== today,
  );
  const upcomingText =
    upcomingTasks.length > 0
      ? upcomingTasks
          .map((t) => `- ${t.taskName} (${t.date}): ${t.description}`)
          .join("\n")
      : "ไม่มีงานใน 7 วันข้างหน้า";

  return (
    `[บริบทแปลงนาของผู้ใช้]\n` +
    `พันธุ์: ${plan.varietyName}\n` +
    `ลักษณะพันธุ์: ${plan.isPhotoperiodSensitive ? "ไวต่อช่วงแสง" : "ไม่ไวต่อช่วงแสง"}\n` +
    `วิธีปลูก: ${getPlantingMethodLabel(plan.plantingMethod)}\n` +
    `พื้นที่: ${plan.areaRai} ไร่\n` +
    `ประเภทดิน: ${plan.soilType}\n` +
    `วันที่เริ่มแผน: ${plan.startDate}\n` +
    `ผ่านมาแล้ว: ${das} วัน\n` +
    `ระยะปัจจุบัน: ${stage}\n` +
    `งานวันนี้:\n${todayText}\n` +
    `งานใน 7 วันข้างหน้า:\n${upcomingText}`
  );
}
