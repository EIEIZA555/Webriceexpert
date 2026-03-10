import { addDays, format } from "date-fns";

type RiceCategory =
  | { kind: "photoperiod"; subtype: "khao_do" } // ข้าวดอ / ข้าวไวแสง นาปี
  | { kind: "nonPhotoperiod"; ageClass: "light" | "medium" | "heavy" }; // ข้าวเบา/กลาง/หนัก นาปรัง

export interface HarvestDateResult {
  harvestDate: string; // ISO date yyyy-MM-dd
  note: string;
}

/**
 * คำนวณวันเก็บเกี่ยวตาม PRD_RiceExpert_V2:
 * - ข้าวดอ (ไวแสง): ไม่ใช้อายุวัน แต่ยึด "ช่วงตะวันอ้อมข้าว" -> เกี่ยวช่วง ต.ค.–พ.ย.
 * - ข้าวเบา/กลาง/หนัก (ไม่ไวแสง): ใช้สูตร วันที่ปลูก + อายุข้าว = วันเก็บเกี่ยว
 */
export function calculateHarvestDate(
  plantingDateISO: string,
  category: RiceCategory,
): HarvestDateResult {
  const planting = new Date(plantingDateISO);
  if (Number.isNaN(planting.getTime())) {
    throw new Error("plantingDateISO ต้องเป็นวันที่รูปแบบ yyyy-MM-dd");
  }

  if (category.kind === "photoperiod") {
    // ข้าวดอ / ข้าวไวแสง นาปี: ห้ามปลูกนอกฤดู และไม่ใช้อายุข้าวมานับวัน
    const year = planting.getFullYear();
    const month = planting.getMonth() + 1; // 1–12

    // สมมติฤดูนาปีที่เหมาะสมสำหรับข้าวดอ = เม.ย.–ก.ค.
    const isMainSeason = month >= 4 && month <= 7;
    if (!isMainSeason) {
      throw new Error(
        "ข้าวดอ (ไวแสง) ปลูกนอกฤดูนาปี – ระบบไม่ควรอนุญาตตาม PRD",
      );
    }

    // Fix วันเก็บเกี่ยวกลางช่วง ต.ค.–พ.ย. เช่น 15 พ.ย. ปีเดียวกัน
    const harvest = new Date(year, 10, 15); // 0-based: 10 = พ.ย.
    const harvestDateISO = format(harvest, "yyyy-MM-dd");

    return {
      harvestDate: harvestDateISO,
      note:
        "คำนวณแบบข้าวดอ (ไวแสง): ยึดช่วงตะวันอ้อมข้าว/แสงสั้น -> เกี่ยวประมาณเดือน ต.ค.–พ.ย.",
    };
  }

  // ข้าวเบา/กลาง/หนัก (ไม่ไวแสง / นาปรัง): ใช้อายุข้าวแบบ Dynamic Aging
  const ageDaysByClass: Record<"light" | "medium" | "heavy", number> = {
    light: 95, // ข้าวเบา อายุสั้น (อิงจาก กข43 ~95 วัน)
    medium: 110,
    heavy: 130,
  };

  const lifecycleDays = ageDaysByClass[category.ageClass];
  const harvest = addDays(planting, lifecycleDays);
  const harvestDateISO = format(harvest, "yyyy-MM-dd");

  return {
    harvestDate: harvestDateISO,
    note: `คำนวณแบบข้าว${mapAgeClassToThai(category.ageClass)} (ไม่ไวแสง): วันที่ปลูก + อายุข้าว ${lifecycleDays} วัน`,
  };
}

function mapAgeClassToThai(age: "light" | "medium" | "heavy"): string {
  switch (age) {
    case "light":
      return "เบา";
    case "medium":
      return "กลาง";
    case "heavy":
      return "หนัก";
  }
}

