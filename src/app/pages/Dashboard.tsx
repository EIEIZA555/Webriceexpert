import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Sprout,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react";
import { usePlans } from "../hooks/usePlans";
import { motion } from "motion/react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { getCurrentStage } from "../lib/planGenerator";
import { RICE_VARIETIES } from "../lib/planGenerator";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    plans,
    plan,
    loading,
    toggleTask,
    getDaysSinceStart,
    getTotalDays,
    getProgressPercent,
    getCurrentStageName,
    getUpcomingTasks,
  } = usePlans();

  const progressPercent = getProgressPercent();
  const currentStage = getCurrentStageName();
  const daysSinceStart = getDaysSinceStart();
  const totalDays = getTotalDays();
  const upcomingTasks = getUpcomingTasks(30);

  const totalPlots = plans.length;
  const totalArea = plans.reduce((sum, p) => sum + p.areaRai, 0);
  const readyCount = plans.reduce((count, p) => {
    const start = new Date(p.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
    const total = RICE_VARIETIES.find((v) => v.id === p.varietyId)?.lifecycleDays ?? 120;
    return diff >= total - 7 ? count + 1 : count;
  }, 0);

  const computeProgress = (startDate: string, varietyId: string) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
    const total = RICE_VARIETIES.find((v) => v.id === varietyId)?.lifecycleDays ?? 120;
    return { days: Math.max(0, diff), pct: Math.min(100, Math.max(0, (diff / total) * 100)) };
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            แดชบอร์ด
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            ภาพรวมการจัดการแปลงนา
          </p>
        </div>
        <Button
          onClick={() => navigate("/create-plan")}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <Plus className="w-5 h-5 mr-2" />
          สร้างแผนใหม่
        </Button>
      </div>

      {/* Plan Overview */}
      {plan ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Current Stage */}
            <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">ระยะปัจจุบัน</h3>
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">
                {currentStage ?? "-"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                วันที่ {daysSinceStart} • เริ่มปลูก{" "}
                {format(new Date(plan.startDate), "d MMM yyyy", { locale: th })}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {plan.plotName} • {plan.areaRai} ไร่ • {plan.varietyName}
              </p>
            </Card>

            {/* Circular Progress */}
            <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow flex flex-col items-center justify-center">
              <div className="relative w-28 h-28 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgb(241 245 249)"
                    strokeWidth="3"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgb(5 150 105)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progressPercent / 100 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
              </div>
              <p className="font-medium text-foreground text-sm">ความคืบหน้าฤดูกาล</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalDays - daysSinceStart > 0
                  ? `อีก ${totalDays - daysSinceStart} วัน`
                  : "ครบวงจร"}
              </p>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow flex flex-col justify-center">
              <p className="text-sm text-muted-foreground mb-1">งานที่ต้องทำ</p>
              <p className="text-3xl font-bold text-emerald-600 tracking-tight">
                {upcomingTasks.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">รายการใน 30 วันถัดไป</p>
            </Card>
          </div>

          {/* Smart Checklist */}
          <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold text-foreground">
                งานที่ต้องทำ (30 วันถัดไป)
              </h3>
              <Badge
                variant="secondary"
                className="w-fit bg-emerald-50 text-emerald-700 border-0 text-sm"
              >
                {upcomingTasks.filter((t) => t.isCompleted).length}/{upcomingTasks.length} ทำเสร็จ
              </Badge>
            </div>
            {upcomingTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                ไม่มีงานที่ต้องทำใน 30 วันถัดไป หรือทำครบแล้ว
              </p>
            ) : (
              <ul className="space-y-2">
                {upcomingTasks.map((task) => (
                  <motion.li
                    key={task.id}
                    layout
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      task.isCompleted
                        ? "bg-emerald-50/60 border-emerald-100/80"
                        : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(plan.id, task.id)}
                      className="shrink-0 mt-0.5 text-emerald-600 hover:text-emerald-700"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.isCompleted ? "line-through text-muted-foreground" : "text-emerald-900"}`}>
                        {task.taskName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(task.date), "EEE d MMM yyyy", { locale: th })} • {task.stage}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Card className="p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <Sprout className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">ยังไม่มีแผนการปลูก</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              สร้างแผนการปลูกข้าวเพื่อดูไทม์ไลน์ งานที่ต้องทำ และความคืบหน้าระยะของข้าว
            </p>
            <Button
              onClick={() => navigate("/create-plan")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              สร้างแผนการปลูก
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-muted-foreground mb-1">แปลงนาทั้งหมด</p>
          <p className="text-3xl font-semibold mb-2">{totalPlots}</p>
          <div className="inline-block px-2 py-1 rounded text-xs bg-emerald-50 text-emerald-700">รวมทุกแปลงที่สร้าง</div>
        </Card>
        <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-muted-foreground mb-1">พื้นที่รวม</p>
          <p className="text-3xl font-semibold mb-2">
            {totalArea.toFixed(1)} <span className="text-base font-normal">ไร่</span>
          </p>
          <div className="inline-block px-2 py-1 rounded text-xs bg-sky-50 text-sky-700">จากข้อมูลทุกแปลง</div>
        </Card>
        <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-muted-foreground mb-1">แปลงใกล้เก็บเกี่ยว</p>
          <p className="text-3xl font-semibold mb-2">{readyCount}</p>
          <div className="inline-block px-2 py-1 rounded text-xs bg-amber-50 text-amber-700">เหลือไม่เกิน 7 วัน</div>
        </Card>
      </div>

      {/* Plots Grid */}
      <div className="mb-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="text-base font-semibold text-foreground">แปลงนาทั้งหมด</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate("/plots")} className="text-primary">
          ดูทั้งหมด
        </Button>
      </div>
      {plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีแปลงนาในระบบ สร้างแผนใหม่เพื่อเริ่มต้น</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.slice(0, 2).map((p) => {
            const { days, pct } = computeProgress(p.startDate, p.varietyId);
            const stage = getCurrentStage(p.varietyId, days) ?? "ติดตามแผน";
            return (
              <Card
                key={p.id}
                className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all cursor-pointer hover:border-slate-200"
                onClick={() => navigate("/plots")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Sprout className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-lg">{p.plotName || "ไม่ระบุชื่อแปลง"}</h4>
                      <p className="text-sm text-muted-foreground">{p.varietyName}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">
                    {stage}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">พื้นที่:</span>
                    <span>{p.areaRai} ไร่</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">วันที่ปลูก:</span>
                    <span>{format(new Date(p.startDate), "d MMM yyyy", { locale: th })}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">ความคืบหน้า:</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
