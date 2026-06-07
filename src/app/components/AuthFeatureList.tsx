import type { LucideIcon } from "lucide-react";
import { Bot, CalendarDays, BarChart2, BookOpen } from "lucide-react";

const FEATURES: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: Bot, label: "ถาม-ตอบด้วย AI", desc: "ถามเรื่องโรค ปุ๋ย การดูแลข้าวได้ทันที" },
  { icon: CalendarDays, label: "วางแผนการปลูก", desc: "สร้างแผนงานและปฏิทินดูแลแปลงนา" },
  { icon: BarChart2, label: "ติดตามแปลงนา", desc: "ดูความคืบหน้าและงานที่ต้องทำ" },
  { icon: BookOpen, label: "คลังความรู้", desc: "เอกสารวิชาการข้าวพร้อมอ้างอิง" },
];

export function AuthFeatureList({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isDark = variant === "dark";
  return (
    <div className="space-y-4">
      {FEATURES.map(({ icon: Icon, label, desc }) => (
        <div key={label} className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isDark ? "bg-white/20" : "bg-gray-50 border border-border"
            }`}
          >
            <Icon className={`w-4 h-4 ${isDark ? "text-white" : "text-primary"}`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${isDark ? "text-white" : ""}`}>{label}</p>
            <p className={`text-xs ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
              {desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
