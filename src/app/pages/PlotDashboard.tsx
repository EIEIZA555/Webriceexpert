import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  Circle,
  CheckCircle2,
  Sprout,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { usePlans, type PlanTask } from "../contexts/PlansContext";
import { motion } from "motion/react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { addDaysToISODate } from "../lib/planGenerator";
import { getPlantingMethodLabel } from "../lib/plantingMethod";
import { TaskGlyph } from "../lib/taskIcons";

export default function PlotDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskView, setTaskView] = useState<"upcoming" | "all">("upcoming");

  const {
    plans,
    plan,
    loading,
    setCurrentPlanId,
    toggleTask,
    getDaysSinceStart,
    getUpcomingTasks,
    getCurrentStageName,
    getProgressPercent,
  } = usePlans();

  useEffect(() => {
    if (!id) return;
    setCurrentPlanId(id);
  }, [id, setCurrentPlanId]);

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  const activePlot = plan;
  if (!activePlot) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <Card className="p-10 rounded-2xl border border-slate-200 bg-white text-center">
          <p className="text-sm text-muted-foreground mb-4">ไม่พบแปลงที่เลือก</p>
          <Button onClick={() => navigate("/app/plots")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            ดูแปลงทั้งหมด
          </Button>
        </Card>
      </div>
    );
  }

  const daysSinceStart = getDaysSinceStart();
  const progressPercent = getProgressPercent();
  const currentStage = getCurrentStageName() ?? "เก็บเกี่ยวแล้ว";
  const upcomingTasks = getUpcomingTasks(30);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future30 = new Date(today);
  future30.setDate(future30.getDate() + 30);
  const hasTasksIn30Days = activePlot.tasks.some((t) => {
    const d = new Date(t.date);
    d.setHours(0, 0, 0, 0);
    return d >= today && d <= future30;
  });
  const upcomingLabel = hasTasksIn30Days ? "งานที่ต้องทำ" : "งานถัดไปที่ต้องทำ";

  // group tasks ตาม stage จาก backend
  const stageMap = new Map<string, { startDay: number; endDay: number; tasks: PlanTask[] }>();
  for (const t of activePlot.tasks) {
    if (!stageMap.has(t.stage)) {
      stageMap.set(t.stage, { startDay: t.day, endDay: t.day, tasks: [] });
    }
    const s = stageMap.get(t.stage)!;
    s.startDay = Math.min(s.startDay, t.day);
    s.endDay = Math.max(s.endDay, t.day);
    s.tasks.push(t);
  }
  const stages = Array.from(stageMap.entries()).map(([name, s]) => ({ name, ...s }));

  // แปลง daysSinceStart (นับจาก task แรก) → วันเทียบกับวันปลูก (day 0)
  const minTaskDay = activePlot.tasks.length > 0 ? Math.min(...activePlot.tasks.map(t => t.day)) : 0;
  const currentDayRelativeToPanting = daysSinceStart + minTaskDay;

  const currentSubLabel = stages.find(
    (s) => currentDayRelativeToPanting >= s.startDay && currentDayRelativeToPanting <= s.endDay
  )?.name ?? "-";

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header — เน้นชื่อแปลงเป็นหลัก */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/90">
            แดชบอร์ดแปลงนา
          </p>
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <MapPin className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">
                {activePlot.plotName?.trim() || "ไม่ระบุชื่อแปลง"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/90">{activePlot.varietyName}</span>
                <span className="mx-1.5 text-muted-foreground/70">•</span>
                <span>{getPlantingMethodLabel(activePlot.plantingMethod)}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/app/plots")}
            className="rounded-xl h-11 px-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ย้อนกลับ
          </Button>
        </div>
      </div>


      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">ระยะปัจจุบัน</h3>
            </div>
            <p className="text-xl font-semibold text-foreground mb-2">{currentStage ?? "-"}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ผ่านมาแล้ว {daysSinceStart} วัน • เริ่มปลูก{" "}
              {format(new Date(activePlot.startDate), "d MMM yyyy", { locale: th })}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activePlot.areaRai} ไร่
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center">
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
            <p className="font-medium text-foreground text-sm">ความคืบหน้าเทียบวันเก็บเกี่ยวเป้าหมาย</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {progressPercent < 100
                ? `อีก ${Math.round((100 - progressPercent) / 100 * (activePlot.tasks.length > 0 ? Math.max(...activePlot.tasks.map(t => t.day)) - Math.min(...activePlot.tasks.map(t => t.day)) : 0))} วันถึงเก็บเกี่ยว`
                : "ครบวงจรตามอายุพันธุ์"}
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-muted-foreground mb-1">งานที่กำลังจะมาถึง</p>
            <p className="text-3xl font-bold text-emerald-600 tracking-tight">
              {upcomingTasks.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {upcomingTasks.filter((t) => t.isCompleted).length}/{upcomingTasks.length} ทำเสร็จ
            </p>
          </Card>
        </div>

        {/* Resources */}
        {activePlot.resources && (
          <Card className="p-6 rounded-2xl border border-slate-100 bg-white">
            <h3 className="text-base font-semibold text-foreground mb-4">วัสดุที่ต้องเตรียม</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{activePlot.resources.seedKg}</p>
                <p className="text-xs text-muted-foreground mt-1">เมล็ดพันธุ์ (กก.)</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{activePlot.resources.fertilizer1Kg}</p>
                <p className="text-xs text-muted-foreground mt-1">ปุ๋ยครั้งที่ 1 (กก.)</p>
                <p className="text-xs font-mono text-amber-600 mt-0.5">{activePlot.resources.fertilizer1Formula}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{activePlot.resources.fertilizer2Kg}</p>
                <p className="text-xs text-muted-foreground mt-1">ปุ๋ยครั้งที่ 2 (กก.)</p>
                <p className="text-xs font-mono text-amber-600 mt-0.5">{activePlot.resources.fertilizer2Formula}</p>
              </div>
              {activePlot.resources.seedlingTrays != null && (
                <div className="bg-sky-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-sky-700">{activePlot.resources.seedlingTrays}</p>
                  <p className="text-xs text-muted-foreground mt-1">ถาดเพาะกล้า (ถาด)</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Smart Checklist */}
        <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-foreground">รายการงาน (Checklist)</h3>
                <Badge variant="secondary" className="w-fit bg-emerald-50 text-emerald-700 border-0 text-xs">
                  {upcomingTasks.filter((t) => t.isCompleted).length}/{upcomingTasks.length} ช่วงนี้เสร็จแล้ว
                </Badge>
              </div>
            </div>
            
            <div className="flex bg-slate-100/80 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setTaskView("upcoming")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  taskView === "upcoming"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                งานช่วงนี้ (30 วัน)
              </button>
              <button
                onClick={() => setTaskView("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  taskView === "all"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                งานทั้งหมด
              </button>
            </div>
          </div>

          {(taskView === "upcoming" ? upcomingTasks : activePlot.tasks).length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
              ไม่มีงานที่ต้องทำ หรือทำครบแล้ว
            </p>
          ) : (
            <div className={`space-y-2 ${taskView === "all" ? "max-h-[500px] overflow-y-auto pr-2 [scrollbar-gutter:stable]" : ""}`}>
              {(taskView === "upcoming" ? upcomingTasks : activePlot.tasks).map((task) => {
                const isOverdue = !task.isCompleted && new Date(task.date) < today;
                
                return (
                  <motion.div
                    key={task.id}
                    layout
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      task.isCompleted
                        ? "bg-emerald-50/40 border-emerald-100/60 opacity-80"
                        : isOverdue 
                        ? "bg-rose-50/50 border-rose-200"
                        : "bg-white border-slate-200 shadow-sm hover:border-emerald-300"
                    }`}
                  >
                    <TaskGlyph
                      taskName={task.taskName}
                      className={`w-5 h-5 shrink-0 mt-1 ${isOverdue ? "text-rose-600" : "text-emerald-700"}`}
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => toggleTask(activePlot.id, task.id)}
                      className={`shrink-0 mt-0.5 ${
                        task.isCompleted 
                          ? "text-emerald-500 hover:text-emerald-600" 
                          : isOverdue
                          ? "text-rose-400 hover:text-rose-600"
                          : "text-slate-300 hover:text-emerald-500"
                      }`}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${
                          task.isCompleted ? "line-through text-slate-500" : "text-slate-900"
                        }`}>
                          {task.taskName}
                        </p>
                        {isOverdue && <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200 bg-white">เลยกำหนด</Badge>}
                      </div>
                      <p className={`text-sm mt-0.5 ${isOverdue ? "text-rose-600" : "text-slate-500"}`}>
                        {format(new Date(task.date), "EEE d MMM yyyy", { locale: th })} • {task.stage}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{task.description}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Milestones */}
        <Card className="p-6 rounded-2xl border border-slate-100 bg-white">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">ระยะการเจริญเติบโต</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ช่วงวันของแต่ละระยะตามพันธุ์
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>{activePlot.varietyName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {stages.map((s) => {
              const isCurrent = currentDayRelativeToPanting >= s.startDay && currentDayRelativeToPanting <= s.endDay;
              const sStartISO = addDaysToISODate(activePlot.startDate, s.startDay);
              const sEndISO = addDaysToISODate(activePlot.startDate, s.endDay);
              const sTasks = s.tasks;

              return (
                <div
                  key={s.name}
                  className={`p-4 rounded-xl border transition-colors ${
                    isCurrent ? "bg-emerald-50/70 border-emerald-200" : "bg-slate-50/40 border-slate-100"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(`${sStartISO}T00:00:00`), "d MMM yyyy", { locale: th })}
                    {sStartISO !== sEndISO && ` – ${format(new Date(`${sEndISO}T00:00:00`), "d MMM yyyy", { locale: th })}`}
                  </p>
                  <p className="font-semibold mt-1 text-sm text-foreground">{s.name}</p>
                  {sTasks.map((t) => (
                    <div key={t.id} className="mt-2">
                      <p className="text-xs text-muted-foreground">งาน: {t.taskName}</p>
                      {t.description && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

      </motion.div>
    </div>
  );
}

