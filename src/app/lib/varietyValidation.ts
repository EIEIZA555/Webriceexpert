import type { RiceVarietyRecord } from "./riceVarietyTypes";

/** คืน null ถ้าผ่าน หรือข้อความ error ภาษาไทย */
export function validateRiceVarietyRecord(r: RiceVarietyRecord): string | null {
  if (!r.name.trim()) return "กรุณากรอกชื่อพันธุ์ข้าว";
  if (!r.id.trim()) return "กรุณาระบุรหัสพันธุ์ (slug)";
  if (!/^[a-z0-9_-]+$/i.test(r.id.trim())) {
    return "รหัสพันธุ์ใช้ได้เฉพาะ a–z, 0–9, _ และ -";
  }

  const mode = r.scheduleMode ?? "DAS_BASED";
  if (mode === "FIXED_DATE") {
    if (!r.harvestMonthDay || !/^\d{2}-\d{2}$/.test(r.harvestMonthDay.trim())) {
      return "โหมดวันคงที่: ระบุวันเก็บเกี่ยวเป็น MM-DD (เช่น 11-25)";
    }
    const [mm, dd] = r.harvestMonthDay.split("-").map(Number);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return "รูปแบบวันเก็บเกี่ยวไม่ถูกต้อง";
    if (!r.fixedMilestones?.length) return "โหมดวันคงที่: ต้องมี milestone อย่างน้อย 1 รายการ";
    if (!r.fixedMilestones.some((m) => m.daysBeforeHarvest === 0)) {
      return "ต้องมี milestone วันเก็บเกี่ยว (วันก่อนเก็บ = 0)";
    }
    for (const m of r.fixedMilestones) {
      if (!m.name.trim()) return "ทุก milestone ต้องมีชื่อ";
      if (m.daysBeforeHarvest < 0) return "วันก่อนเก็บเกี่ยวต้องไม่ติดลบ";
    }
    return null;
  }

  if (r.totalDays < 1 || r.totalDays > 365) return "อายุเก็บเกี่ยวควรอยู่ระหว่าง 1–365 วัน";
  if (!r.stages.length) return "ต้องมีอย่างน้อย 1 ระยะ (milestone)";

  const sorted = [...r.stages].sort((a, b) => a.startDay - b.startDay);
  if (sorted[0].startDay !== 0) return "ระยะแรกต้องเริ่มที่ DAS 0";

  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    if (!s.name.trim()) return `ระยะที่ ${i + 1}: ต้องมีชื่อ`;
    if (s.startDay > s.endDay) return `ระยะ "${s.name}": วันเริ่มต้องไม่มากกว่าวันสิ้นสุด`;
    if (s.endDay > r.totalDays) {
      return `ระยะ "${s.name}": วันสิ้นสุด (${s.endDay}) ต้องไม่เกินอายุเก็บเกี่ยว (${r.totalDays})`;
    }
    if (s.startDay < 0) return `ระยะ "${s.name}": DAS ต้องไม่ติดลบ`;
    if (i > 0) {
      const prev = sorted[i - 1];
      if (s.startDay <= prev.endDay) {
        return `ระยะ "${s.name}" ทับซ้อนหรือสลับลำดับกับระยะก่อนหน้า — ให้เริ่มหลัง DAS ${prev.endDay}`;
      }
    }
  }

  const last = sorted[sorted.length - 1];
  if (last.endDay !== r.totalDays) {
    return `ระยะสุดท้ายต้องจบที่ DAS ${r.totalDays} ให้ตรงกับอายุเก็บเกี่ยว (ตอนนี้จบที่ ${last.endDay})`;
  }

  return null;
}
