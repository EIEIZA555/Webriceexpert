import type { LucideIcon } from "lucide-react";
import {
  Droplets,
  Package,
  Sprout,
  Tractor,
  Wheat,
  Rows,
  Shovel,
  type LucideProps,
} from "lucide-react";

/** ไอคอนตามคีย์เวิร์ดในชื่องาน — ภาษาชาวบ้าน / กิจกรรมจริง */
export function TaskGlyph({
  taskName,
  className,
  ...props
}: { taskName: string } & LucideProps) {
  const Icon = pickTaskIcon(taskName);
  return <Icon className={className} strokeWidth={2} {...props} />;
}

export function pickTaskIcon(taskName: string): LucideIcon {
  const n = taskName.toLowerCase();
  if (n.includes("เก็บเกี่ยว")) return Wheat;
  if (n.includes("ปุ๋ย") || n.includes("สูตร")) return Package;
  if (n.includes("น้ำ") || n.includes("ตม") || n.includes("ชลประทาน")) return Droplets;
  if (n.includes("ไถ") || n.includes("กลบ")) return Tractor;
  if (n.includes("เทือก") || n.includes("เลน")) return Rows;
  if (n.includes("เพาะ") || n.includes("กล้า") || n.includes("งอก")) return Sprout;
  if (n.includes("ดำ") || n.includes("ถอน")) return Shovel;
  return Sprout;
}
