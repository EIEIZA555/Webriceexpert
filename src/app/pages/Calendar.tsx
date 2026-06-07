import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { usePlans, type PlanTask } from "../contexts/PlansContext";
import type { DayContentProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { th } from "date-fns/locale";
import { Calendar as CalendarPicker } from "../components/ui/calendar";
import { formatDateShort, formatDateWithWeekday, toISODate } from "../lib/dateUtils";
import { addDaysToISODate } from "../lib/planGenerator";
import LoadingScreen from "../components/LoadingScreen";
import { EmptyState } from "../components/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function Calendar() {
  const { plan, plans, loading, setCurrentPlanId, getDaysSinceStart, getCurrentStageName } =
    usePlans();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  if (loading) return <LoadingScreen />;

  if (!plan || plans.length === 0) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1">ปฏิทิน</h2>
          <p className="text-muted-foreground text-sm">
            เลือกหรือสร้างแผนการปลูกก่อน จากนั้นจะเห็นปฏิทินงานของแปลงนั้นที่นี่
          </p>
        </div>
        <EmptyState
          icon={CalendarDays}
          title="ยังไม่มีแผนที่เลือก"
          description='ไปที่หน้า "แปลงนา" เพื่อสร้างและเลือกแผนการปลูก แล้วเปิดแปลงเพื่อดูรายละเอียด'
          className="bg-white"
        />
      </div>
    );
  }

  const tasksByDate = groupTasksByDate(plan.tasks);
  const taskDates = Array.from(tasksByDate.keys()).map((iso) => new Date(iso));
  const taskDateSet = new Set(Array.from(tasksByDate.keys()));
  const daysSinceStart = getDaysSinceStart();
  const currentStage = getCurrentStageName();
  const stages = plan.tasks.reduce((acc, t) => {
    if (!acc.find((s: { name: string }) => s.name === t.stage)) {
      const stageTasks = plan.tasks.filter(x => x.stage === t.stage);
      acc.push({ name: t.stage, startDay: Math.min(...stageTasks.map(x => x.day)), endDay: Math.max(...stageTasks.map(x => x.day)) });
    }
    return acc;
  }, [] as { name: string; startDay: number; endDay: number }[]);

  const selectedKey = selectedDay != null ? toISODate(selectedDay) : undefined;
  const tasksForSelected: PlanTask[] = selectedKey ? (tasksByDate.get(selectedKey) ?? []) : [];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold mb-1">ปฏิทิน</h2>
            <p className="text-muted-foreground text-sm">
              งานและระยะตามแผนของแปลงที่เลือก
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
          <CalendarPicker
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
                const key = toISODate(props.date);
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
              ? formatDateWithWeekday(selectedDay)
              : "ยังไม่ได้เลือกวันที่"}
          </p>
          {tasksForSelected.length === 0 ? (
            <p className="text-sm text-muted-foreground">ไม่มีงานในวันที่เลือก</p>
          ) : (
            <ul className="space-y-3">
              {tasksForSelected.map((task) => (
                <li key={task.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <p className="text-sm font-medium text-foreground">{task.taskName}</p>
                  <p className="text-xs text-muted-foreground">ระยะ: {task.stage}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {stages.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">งานในแต่ละระยะ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {stages.map((s) => {
              const isCurrent = daysSinceStart >= s.startDay && daysSinceStart <= s.endDay;
              const sStartISO = addDaysToISODate(plan.startDate, s.startDay);
              const sEndISO = addDaysToISODate(plan.startDate, s.endDay);
              const sTasks = plan.tasks.filter((t) => t.stage === s.name);
              return (
                <div
                  key={s.name}
                  className={`p-3 rounded-xl border ${isCurrent ? "bg-emerald-50 border-emerald-200" : "bg-slate-50/40 border-slate-200"}`}
                >
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(sStartISO)}
                    {sStartISO !== sEndISO && ` – ${formatDateShort(sEndISO)}`}
                  </p>
                  <p className="text-sm font-semibold mt-1">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {sTasks.length > 0 ? sTasks.map((t) => t.taskName).join(", ") : "ไม่มีงานกำหนด"}
                  </p>
                </div>
              );
            })}
          </div>
          {currentStage && (
            <p className="text-xs text-muted-foreground mt-3">
              ระยะปัจจุบัน: {currentStage} • วันที่ {daysSinceStart}
            </p>
          )}
        </div>
      )}

    </div>
  );
}

function groupTasksByDate(tasks: PlanTask[]): Map<string, PlanTask[]> {
  const map = new Map<string, PlanTask[]>();
  for (const task of tasks) {
    const normalizedKey = task.date.slice(0, 10);
    const arr = map.get(normalizedKey) ?? [];
    arr.push(task);
    map.set(normalizedKey, arr);
  }
  return map;
}
