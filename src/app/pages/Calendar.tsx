import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { usePlans, type PlanTask } from "../contexts/PlansContext";
import { DayPicker, type DayContentProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { addDaysToISODate, RICE_VARIETIES } from "../lib/planGenerator";
import { getSubStageLabelAtDAS } from "../lib/fixedPlan";
import { TaskGlyph } from "../lib/taskIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";

type CalendarView = "milestone" | "timeline";

export default function Calendar() {
  const { plan, plans, loading, setCurrentPlanId, getDaysSinceStart, getCurrentStageName } =
    usePlans();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<CalendarView>("milestone");

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  if (!plan || plans.length === 0) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1">ปฏิทิน</h2>
          <p className="text-muted-foreground text-sm">
            เลือกหรือสร้างแผนการปลูกก่อน จากนั้นจะเห็นปฏิทินงานของแปลงนั้นที่นี่
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
          <CalendarDays className="w-16 h-16 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">ยังไม่มีแผนที่เลือก</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            ไปที่หน้า &quot;แปลงนา&quot; เพื่อสร้างและเลือกแผนการปลูก แล้วเปิดแปลงเพื่อดูรายละเอียด
          </p>
        </div>
      </div>
    );
  }

  const tasksByDate = groupTasksByDate(plan.tasks);
  const taskDates = Array.from(tasksByDate.keys()).map((iso) => new Date(iso));
  const taskDateSet = new Set(Array.from(tasksByDate.keys()));
  const daysSinceStart = getDaysSinceStart();
  const currentStage = getCurrentStageName();
  const currentSubStage = getSubStageLabelAtDAS(plan.varietyId, daysSinceStart);
  const stages = RICE_VARIETIES.find((v) => v.id === plan.varietyId)?.stages ?? [];

  const selectedKey = selectedDay != null ? format(selectedDay, "yyyy-MM-dd") : undefined;
  const tasksForSelected = (selectedKey && tasksByDate.get(selectedKey)) ?? [];
  const sortedTimeline = [...plan.tasks].sort((a, b) => a.day - b.day);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold mb-1">ปฏิทิน</h2>
            <p className="text-muted-foreground text-sm">
              งานและ milestone ของแปลงที่เลือก (activePlotId) เท่านั้น
            </p>
          </div>
          {plans.length > 1 && (
            <div className="w-full sm:w-72">
              <label className="text-xs text-muted-foreground mb-1 block">เลือกแปลงนา</label>
              <Select value={plan.id} onValueChange={setCurrentPlanId}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="เลือกแปลง" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.plotName || "ไม่ระบุชื่อ"} • {p.varietyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-foreground">
            <span className="font-medium">{plan.plotName || "ไม่ระบุชื่อแปลง"}</span>
            {" "}• {plan.varietyName}
          </p>
          <ToggleGroup
            type="single"
            variant="outline"
            value={view}
            onValueChange={(v) => v && setView(v as CalendarView)}
            className="justify-start sm:justify-end"
          >
            <ToggleGroupItem value="milestone" aria-label="Milestone" className="text-xs sm:text-sm px-3">
              Milestone
            </ToggleGroupItem>
            <ToggleGroupItem value="timeline" aria-label="Timeline" className="text-xs sm:text-sm px-3">
              ไทม์ไลน์ (Fixed Plan)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
          <DayPicker
            mode="single"
            locale={th}
            selected={selectedDay}
            onSelect={setSelectedDay}
            modifiers={{ hasTask: taskDates }}
            modifiersClassNames={{
              hasTask: "bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200",
            }}
            components={{
              DayContent: (props: DayContentProps) => {
                const key = format(props.date, "yyyy-MM-dd");
                const hasTask = taskDateSet.has(key);
                return (
                  <div className="flex flex-col items-center justify-center">
                    <span>{props.date.getDate()}</span>
                    {hasTask && <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </div>
                );
              },
            }}
            className="rdp-custom text-sm"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            จุดสีเขียวใต้ตัวเลข แสดงว่าวันนั้นมีงานในแผนนี้
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-1">งานในวันที่เลือก</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {selectedDay
              ? format(selectedDay, "EEE d MMM yyyy", { locale: th })
              : "ยังไม่ได้เลือกวันที่"}
          </p>

          {tasksForSelected.length === 0 ? (
            <p className="text-sm text-muted-foreground">ไม่มีงานในวันที่เลือก</p>
          ) : (
            <ul className="space-y-3">
              {tasksForSelected.map((task) => (
                <li
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <p className="text-sm font-medium text-foreground">{task.taskName}</p>
                  <p className="text-xs text-muted-foreground">ระยะ: {task.stage} • วันที่ {task.day}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Milestone view: ตามระยะหลักของพันธุ์ */}
      {view === "milestone" && stages.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Milestone view (ตามระยะข้าว)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {stages.map((s) => {
              const isCurrent = daysSinceStart >= s.startDay && daysSinceStart <= s.endDay;
              const sStartISO = addDaysToISODate(plan.startDate, s.startDay);
              const sEndISO = addDaysToISODate(plan.startDate, s.endDay);
              const sTasks = plan.tasks.filter((t) => t.day >= s.startDay && t.day <= s.endDay);
              return (
                <div
                  key={s.name}
                  className={`p-3 rounded-xl border ${
                    isCurrent ? "bg-emerald-50 border-emerald-200" : "bg-slate-50/40 border-slate-200"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">วันที่ {s.startDay}–{s.endDay}</p>
                  <p className="text-sm font-semibold mt-1">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(`${sStartISO}T00:00:00`), "d MMM")} – {format(new Date(`${sEndISO}T00:00:00`), "d MMM")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {sTasks.length > 0 ? sTasks.map((t) => t.taskName).join(", ") : "ไม่มีงานกำหนด"}
                  </p>
                </div>
              );
            })}
          </div>
          {(currentStage || currentSubStage) && (
            <p className="text-xs text-muted-foreground mt-3">
              ระยะหลัก: {currentStage ?? "-"} • ระยะย่อย: {currentSubStage} • วันที่ {daysSinceStart}
            </p>
          )}
        </div>
      )}

      {/* Timeline static: รายการงานจาก fixed plan เรียง DAS */}
      {view === "timeline" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-1">Timeline static (จาก Fixed Plan)</h3>
          <p className="text-xs text-muted-foreground mb-4">
            รายการงานคงที่ตามพันธุ์ — ไม่คำนวณใหม่จาก AI
          </p>
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sortedTimeline.map((t) => {
              const done = t.isCompleted;
              return (
                <li
                  key={t.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:gap-3 p-3 rounded-xl border text-sm ${
                    done ? "bg-slate-50 border-slate-100 opacity-80" : "bg-white border-slate-200"
                  }`}
                >
                  <TaskGlyph taskName={t.taskName} className="w-4 h-4 text-emerald-700 shrink-0 sm:order-first" />
                  <span className="text-xs text-muted-foreground shrink-0 w-20">
                    {format(new Date(`${t.date}T00:00:00`), "d MMM yyyy", { locale: th })}
                  </span>
                  <span className={`flex-1 font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {t.taskName}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function groupTasksByDate(tasks: PlanTask[]): Map<string, PlanTask[]> {
  const map = new Map<string, PlanTask[]>();
  for (const task of tasks) {
    const normalizedKey = format(new Date(task.date), "yyyy-MM-dd");
    const arr = map.get(normalizedKey) ?? [];
    arr.push(task);
    map.set(normalizedKey, arr);
  }
  return map;
}
