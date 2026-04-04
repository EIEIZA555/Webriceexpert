import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  Circle,
  CheckCircle2,
  Sprout,
  ArrowLeft,
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

  const {
    plans,
    plan,
    loading,
    setCurrentPlanId,
    toggleTask,
    getDaysSinceStart,
    getTotalDays,
    getProgressPercent,
    getCurrentStageName,
    getUpcomingTasks,
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
  const totalDays = getTotalDays();
  const progressPercent = getProgressPercent();
  const currentStage = getCurrentStageName();
  const upcomingTasks = getUpcomingTasks(30);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            แดชบอร์ดแปลงนา
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activePlot.plotName || "ไม่ระบุชื่อแปลง"} • {activePlot.varietyName} •{" "}
            {getPlantingMethodLabel(activePlot.plantingMethod)}
          </p>
        </div>
        <div className="flex gap-2">
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
              วันที่ {daysSinceStart} • เริ่มปลูก{" "}
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
            <p className="font-medium text-foreground text-sm">ความคืบหน้าระยะตามวงจร</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalDays - daysSinceStart > 0 ? `อีก ${totalDays - daysSinceStart} วัน` : "ครบวงจร"}
            </p>
          </Card>

          <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-muted-foreground mb-1">งานที่ต้องทำ (30 วัน)</p>
            <p className="text-3xl font-bold text-emerald-600 tracking-tight">
              {upcomingTasks.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {upcomingTasks.filter((t) => t.isCompleted).length}/{upcomingTasks.length} ทำเสร็จ
            </p>
          </Card>
        </div>

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
                    {s.startDay < 0
                      ? `ก่อนเอาข้าวลงนา ${Math.abs(s.startDay)} วัน`
                      : s.startDay === 0
                      ? "วันเอาข้าวลงนา"
                      : `หลังเอาข้าวลงนา ${s.startDay} วัน`}
                  </p>
                  <p className="font-semibold mt-1 text-sm text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(`${sStartISO}T00:00:00`), "d MMM yyyy", { locale: th })} –{" "}
                    {format(new Date(`${sEndISO}T00:00:00`), "d MMM yyyy", { locale: th })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    งานที่กำหนด: {sTasks.length > 0 ? sTasks.map((t) => t.taskName).join(", ") : "-"}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Smart Checklist */}
        <Card className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h3 className="text-base font-semibold text-foreground">งานที่ต้องทำ (30 วันข้างหน้า)</h3>
            <Badge variant="secondary" className="w-fit bg-emerald-50 text-emerald-700 border-0 text-sm">
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
                  <TaskGlyph
                    taskName={task.taskName}
                    className="w-5 h-5 text-emerald-700 shrink-0 mt-1"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={() => toggleTask(activePlot.id, task.id)}
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

        {/* Optional growth progress bar (visual) */}
        <Card className="p-6 rounded-2xl border border-slate-100 bg-white">
          <p className="text-sm text-muted-foreground mb-2">ความคืบหน้า</p>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>ผ่านไปแล้ว {daysSinceStart} วัน</span>
            <span>ระยะเวลาแผนทั้งหมด {totalDays} วัน</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </Card>
      </motion.div>
    </div>
  );
}

