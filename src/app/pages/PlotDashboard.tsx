import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  ArrowLeft,
  MapPin,
  Pencil,
  Copy,
  Printer,
} from "lucide-react";
import { usePlans } from "../contexts/PlansContext";
import { motion } from "motion/react";
import { formatDateShort, formatDateWithWeekday, todayAtMidnight, toISODate } from "../lib/dateUtils";
import { EmptyState } from "../components/EmptyState";
import { getPlantingMethodLabel } from "../lib/plantingMethod";
import { TaskRow } from "../components/TaskRow";
import LoadingScreen from "../components/LoadingScreen";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { SoilTypeKey } from "../lib/planTypes";
import { PlanStartDatePicker } from "../components/PlanStartDatePicker";

export default function PlotDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskView, setTaskView] = useState<"today" | "all">("today");

  const {
    plan,
    loading,
    setCurrentPlanId,
    toggleTask,
    updatePlan,
    clonePlan,
    getDaysSinceStart,
    getCurrentStageName,
    getProgressPercent,
  } = usePlans();

  const [editOpen, setEditOpen] = useState(false);
  const [editPlotName, setEditPlotName] = useState("");
  const [editAreaRai, setEditAreaRai] = useState("");
  const [editSoilType, setEditSoilType] = useState<SoilTypeKey>("clay");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneStartDate, setCloneStartDate] = useState("");
  const [clonePlotName, setClonePlotName] = useState("");
  const [cloneSaving, setCloneSaving] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [cloneCalendarOpen, setCloneCalendarOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setCurrentPlanId(id);
  }, [id, setCurrentPlanId]);

  if (loading) return <LoadingScreen />;

  const activePlot = plan;
  if (!activePlot) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <EmptyState
          message="ไม่พบแปลงที่เลือก"
          action={
            <Button onClick={() => navigate("/app/plots")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              ดูแปลงทั้งหมด
            </Button>
          }
          className="border border-slate-200 bg-white border-solid"
        />
      </div>
    );
  }

  const daysSinceStart = getDaysSinceStart();
  const progressPercent = getProgressPercent();
  const currentStage = getCurrentStageName() ?? "เก็บเกี่ยวแล้ว";

  const today = todayAtMidnight();
  const todayISO = toISODate(today);
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
        <div className="flex gap-2 shrink-0 print:hidden">
          <Button
            variant="outline"
            onClick={() => {
              setTaskView("all");
              setTimeout(() => window.print(), 150);
            }}
            className="rounded-xl h-11 px-4"
          >
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setEditPlotName(activePlot.plotName ?? "");
              setEditAreaRai(String(activePlot.areaRai));
              setEditSoilType(activePlot.soilType);
              setEditError(null);
              setEditOpen(true);
            }}
            className="rounded-xl h-11 px-4"
          >
            <Pencil className="w-4 h-4 mr-2" />
            แก้ไข
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCloneStartDate("");
              setClonePlotName(activePlot.plotName ? `${activePlot.plotName} (สำเนา)` : "");
              setCloneError(null);
              setCloneOpen(true);
            }}
            className="rounded-xl h-11 px-4"
          >
            <Copy className="w-4 h-4 mr-2" />
            โคลน
          </Button>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขแผน</DialogTitle>
            <DialogDescription>
              แก้ชื่อแปลง พื้นที่ หรือประเภทดิน — ระบบจะคำนวณเมล็ด/ปุ๋ยใหม่
              ส่วนรายการงานและความคืบหน้าเดิมจะยังอยู่
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-plot-name">ชื่อแปลง</Label>
              <Input
                id="edit-plot-name"
                value={editPlotName}
                onChange={(e) => setEditPlotName(e.target.value)}
                placeholder="เช่น แปลงข้างบ้าน"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-area-rai">พื้นที่ (ไร่)</Label>
              <Input
                id="edit-area-rai"
                type="number"
                step="0.1"
                min="0.1"
                value={editAreaRai}
                onChange={(e) => setEditAreaRai(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-soil-type">ประเภทดิน</Label>
              <select
                id="edit-soil-type"
                value={editSoilType}
                onChange={(e) => setEditSoilType(e.target.value as SoilTypeKey)}
                className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="clay">ดินเหนียว</option>
                <option value="loam">ดินร่วน</option>
                <option value="sandy">ดินทราย</option>
              </select>
            </div>
            {editError && <p className="text-sm text-red-600">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
              ยกเลิก
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={editSaving}
              onClick={async () => {
                const area = parseFloat(editAreaRai);
                if (!Number.isFinite(area) || area <= 0) {
                  setEditError("กรุณาระบุพื้นที่ที่ถูกต้อง");
                  return;
                }
                setEditSaving(true);
                setEditError(null);
                try {
                  await updatePlan(activePlot.id, {
                    plotName: editPlotName.trim() || undefined,
                    areaRai: area,
                    soilType: editSoilType,
                  });
                  setEditOpen(false);
                } catch (e) {
                  setEditError((e as Error).message);
                } finally {
                  setEditSaving(false);
                }
              }}
            >
              {editSaving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>โคลนแผน</DialogTitle>
            <DialogDescription>
              สร้างแผนใหม่โดยใช้พันธุ์/วิธีปลูก/พื้นที่/ดินเดิม —
              ระบบจะสร้างรายการงานใหม่จากวันเริ่มที่เลือก
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="clone-start-date">วันเริ่ม (Day 0)</Label>
              <PlanStartDatePicker
                value={cloneStartDate}
                onChange={setCloneStartDate}
                open={cloneCalendarOpen}
                onOpenChange={setCloneCalendarOpen}
                disabled={(date) => {
                  if (date < todayAtMidnight()) return true;
                  if (activePlot.isPhotoperiodSensitive) {
                    const m = date.getMonth() + 1;
                    return m < 6 || m > 7;
                  }
                  return false;
                }}
              />
              {activePlot.isPhotoperiodSensitive && (
                <p className="text-xs text-amber-600">
                  ข้าวไวแสง — ต้องเริ่มในเดือน มิ.ย. หรือ ก.ค.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clone-plot-name">ชื่อแปลงใหม่</Label>
              <Input
                id="clone-plot-name"
                value={clonePlotName}
                onChange={(e) => setClonePlotName(e.target.value)}
                placeholder="เว้นว่างได้"
              />
            </div>
            {cloneError && <p className="text-sm text-red-600">{cloneError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneOpen(false)} disabled={cloneSaving}>
              ยกเลิก
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={cloneSaving || !cloneStartDate}
              onClick={async () => {
                setCloneSaving(true);
                setCloneError(null);
                try {
                  const newPlan = await clonePlan(activePlot.id, {
                    startDate: cloneStartDate,
                    plotName: clonePlotName.trim() || undefined,
                  });
                  setCloneOpen(false);
                  navigate(`/app/plots/${newPlan.id}`);
                } catch (e) {
                  setCloneError((e as Error).message);
                } finally {
                  setCloneSaving(false);
                }
              }}
            >
              {cloneSaving ? "กำลังโคลน..." : "สร้างแผนใหม่"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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
              ผ่านมาแล้ว {daysSinceStart} วัน • เริ่มงาน{" "}
              {formatDateShort(activePlot.startDate)}
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
                <p className="text-xs text-muted-foreground mt-1">ปุ๋ยช่วงแตกกอ (กก.)</p>
                <p className="text-xs font-mono text-amber-600 mt-0.5">{activePlot.resources.fertilizer1Formula}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{activePlot.resources.fertilizer2Kg}</p>
                <p className="text-xs text-muted-foreground mt-1">ปุ๋ยช่วงกำเนิดช่อดอก (กก.)</p>
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
                  <p className="text-xs text-muted-foreground">{formatDateWithWeekday(today)}</p>
                )}
                {taskView === "all" && (
                  <Badge variant="secondary" className="w-fit bg-emerald-50 text-emerald-700 border-0 text-xs">
                    {activePlot.tasks.filter((t) => t.isCompleted).length}/{activePlot.tasks.length} เสร็จแล้ว
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex bg-slate-100/80 p-1 rounded-xl shrink-0 print:hidden">
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
                  ไม่มีงานวันนี้ — งานถัดไป {nextDate ? formatDateWithWeekday(nextDate) : "-"}
                </p>
                <div className="space-y-2">
                  {nextTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(activePlot.id, task.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                message={
                  taskView === "today"
                    ? "ไม่มีงานที่กำหนดไว้และยังไม่มีงานถัดไป"
                    : "ไม่มีงานในแผน"
                }
                className="border border-slate-100 bg-slate-50/50 border-solid py-8"
              />
            )
          ) : (
            <div className={`space-y-2 ${taskView === "all" ? "max-h-[500px] overflow-y-auto pr-2 [scrollbar-gutter:stable] print:max-h-none print:overflow-visible print:pr-0" : ""}`}>
              {(taskView === "today" ? todayTasks : activePlot.tasks).map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(activePlot.id, task.id)}
                />
              ))}
            </div>
          )}
        </Card>

      </motion.div>
    </div>
  );
}
