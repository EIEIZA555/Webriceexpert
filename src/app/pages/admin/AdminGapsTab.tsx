import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { EmptyState } from "../../components/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import { apiFetch } from "../../lib/api";
import type { GapItem } from "../../lib/types";

export default function AdminGapsTab() {
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<GapItem[]>("/admin/gaps", {}, true)
      .then(setGaps)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">ช่องว่างความรู้ ({gaps.length})</h3>
        <p className="text-xs text-muted-foreground mt-1">
          คำถามที่ระบบตอบไม่ได้เพราะไม่มีเอกสารอ้างอิง —
          ใช้เป็นแนวทางว่าควรอัปโหลดเอกสารเรื่องอะไรเพิ่ม
        </p>
      </div>
      {loading ? (
        <LoadingScreen />
      ) : gaps.length === 0 ? (
        <EmptyState message="ยังไม่มีช่องว่างความรู้ — AI ตอบได้ครบทุกคำถาม 🎉" />
      ) : (
        <Card className="rounded-xl overflow-hidden shadow-sm border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium w-10">#</th>
                  <th className="px-6 py-4 font-medium">คำถาม</th>
                  <th className="px-6 py-4 font-medium w-28 text-center">จำนวนครั้ง</th>
                  <th className="px-6 py-4 font-medium w-40">ถามล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {gaps.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{i + 1}</td>
                    <td className="px-6 py-4 text-slate-900">{item.question}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                        {item.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {item.last_asked_at?.slice(0, 10) ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
