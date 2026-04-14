import { format } from "date-fns";
import type { Locale } from "date-fns";

/**
 * format date เหมือน date-fns format() แต่แปลงปีเป็น พ.ศ. (+543)
 */
export function formatBE(date: Date, pattern: string, options?: { locale?: Locale }): string {
  const ceYear = date.getFullYear();
  const beYear = ceYear + 543;
  const formatted = format(date, pattern, options);
  return formatted.replace(String(ceYear), String(beYear));
}
