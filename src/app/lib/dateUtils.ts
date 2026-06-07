import { format } from "date-fns";
import type { Locale } from "date-fns";
import { th } from "date-fns/locale";

export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const DEFAULT_LOCALE = th;

/** แปลง ISO date string (yyyy-MM-dd) เป็น Date แบบ local midnight */
export function fromISODate(value: string | null | undefined): Date | undefined {
  return value ? new Date(`${value.slice(0, 10)}T00:00:00`) : undefined;
}

/** แปลง Date เป็น ISO date string (yyyy-MM-dd) */
export function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** หัวข้อเดือนในปฏิทิน เช่น "มิถุนายน 2569" */
export function formatCaptionBE(date: Date): string {
  return `${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`;
}

/**
 * format date เหมือน date-fns format() แต่แปลงปีเป็น พ.ศ. (+543)
 */
export function formatBE(date: Date, pattern: string, options?: { locale?: Locale }): string {
  const ceYear = date.getFullYear();
  const beYear = ceYear + 543;
  const formatted = format(date, pattern, { locale: DEFAULT_LOCALE, ...options });
  return formatted.replace(String(ceYear), String(beYear));
}

/** รูปแบบมาตรฐานสำหรับแสดงวันที่สั้น เช่น "7 มิ.ย. 2569" */
export function formatDateShort(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? fromISODate(isoOrDate)! : isoOrDate;
  return formatBE(date, "d MMM yyyy");
}

/** รูปแบบมาตรฐานสำหรับแสดงวันที่เต็ม เช่น "7 มิถุนายน 2569" */
export function formatDateLong(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? fromISODate(isoOrDate)! : isoOrDate;
  return formatBE(date, "d MMMM yyyy");
}

/** รูปแบบมาตรฐานพร้อมวันในสัปดาห์ เช่น "อา. 7 มิ.ย. 2569" */
export function formatDateWithWeekday(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? fromISODate(isoOrDate)! : isoOrDate;
  return formatBE(date, "EEE d MMM yyyy");
}

/** วันนี้เวลา 00:00:00 local */
export function todayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** true ถ้า ISO date อยู่ก่อนวันนี้ */
export function isBeforeToday(isoDate: string): boolean {
  const date = fromISODate(isoDate);
  if (!date) return false;
  return date < todayAtMidnight();
}
