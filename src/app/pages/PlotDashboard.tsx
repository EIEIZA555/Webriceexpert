import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  Circle,
  CheckCircle2,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { usePlans } from "../contexts/PlansContext";
import { motion } from "motion/react";
import { formatBE } from "../lib/dateUtils";
import { th } from "date-fns/locale";
import { getPlantingMethodLabel } from "../lib/plantingMethod";
import { TaskGlyph } from "../lib/taskIcons";
import LoadingScreen from "../components/LoadingScreen";

export default function PlotDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskView, setTaskView] = useState<"today" | "all">("today");

  const {
    plan,
    loading,
    setCurrentPlanId,
    toggleTask,
    getDaysSinceStart,
    getCurrentStageName,
    getProgressPercent,
  } = usePlans();

  useEffect(() => {
    if (!id) return;
    setCurrentPlanId(id);
  }, [id, setCurrentPlanId]);

  if (loading) return <LoadingScreen />;

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayTasks = activePlot.tasks.filter((t) => t.date === todayISO);
  const nextDate = todayTasks.length === 0
    ? activePlot.tasks
        .filter((t) => !t.isCompleted && t.date > todayISO)
        .sort((a, b) => a.date.localeCompare(b.date))[0]?.date
    : undefined;
  const nextTasks = nextDate
    ? activePlot.tasks.filter((t) => t.date === nextDate)
    : [];

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
              {formatBE(new Date(activePlot.startDate), "d MMM yyyy", { locale: th })}
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
            <p className="text-sm text-muted-foreground mb-1">งานวันนี้</p>
            <p className="text-3xl font-bold text-emerald-600 tracking-tight">
              {todayTasks.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {todayTasks.filter((t) => t.isCompleted).length}/{todayTasks.length} ทำเสร็จ
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
                <h3 className="text-base font-semibold text-foreground">รายการงาน</h3>
                {taskView === "today" && (
                  <p className="text-xs text-muted-foreground">{formatBE(today, "EEE d MMM yyyy", { locale: th })}</p>
                )}
                {taskView === "all" && (
                  <Badge variant="secondary" className="w-fit bg-emerald-50 text-emerald-700 border-0 text-xs">
                    {activePlot.tasks.filter((t) => t.isCompleted).length}/{activePlot.tasks.length} เสร็จแล้ว
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex bg-slate-100/80 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setTaskView("today")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  taskView === "today"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                งานวันนี้
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

          {(taskView === "today" ? todayTasks : activePlot.tasks).length === 0 ? (
            taskView === "today" && nextTasks.length > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2 px-1">
                  ไม่มีงานวันนี้ — งานถัดไป {formatBE(new Date(`${nextDate}T00:00:00`), "EEE d MMM yyyy", { locale: th })}
                </p>
                <div className="space-y-2">
                  {nextTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        task.isCompleted
                          ? "bg-emerald-50/40 border-emerald-100/60 opacity-80"
                          : "bg-white border-slate-200 shadow-sm hover:border-emerald-300"
                      }`}
                    >
                      <TaskGlyph taskName={task.taskName} className="w-5 h-5 shrink-0 mt-1 text-emerald-700" aria-hidden />
                      <button
                        type="button"
                        onClick={() => toggleTask(activePlot.id, task.id)}
                        className={`shrink-0 mt-0.5 ${task.isCompleted ? "text-emerald-500 hover:text-emerald-600" : "text-slate-300 hover:text-emerald-500"}`}
                      >
                        {task.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.isCompleted ? "line-through text-slate-500" : "text-slate-900"}`}>
                          {task.taskName}
                        </p>
                        <p className="text-sm mt-0.5 text-slate-500">{task.stage}</p>
                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{task.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                {taskView === "today" ? "ไม่มีงานที่กำหนดไว้และยังไม่มีงานถัดไป" : "ไม่มีงานในแผน"}
              </p>
            )
          ) : (
            <div className={`space-y-2 ${taskView === "all" ? "max-h-[500px] overflow-y-auto pr-2 [scrollbar-gutter:stable]" : ""}`}>
              {(taskView === "today" ? todayTasks : activePlot.tasks).map((task) => {
                const isOverdue = !task.isCompleted && new Date(`${task.date}T00:00:00`) < today;
                
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
                        {formatBE(new Date(task.date), "EEE d MMM yyyy", { locale: th })} • {task.stage}
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

      </motion.div>
    </div>
  );
}

