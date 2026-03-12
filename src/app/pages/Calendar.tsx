import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { usePlanStore } from "../store/planStore";
import type { PlanTask } from "../lib/planGenerator";
import { DayPicker, type DayContentProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function Calendar() {
  const plan = usePlanStore((s) => s.plan);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  if (!plan) {
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
          <h3 className="text-lg font-medium text-foreground mb-2">
            ยังไม่มีแผนที่เลือก
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            ไปที่หน้า &quot;แดชบอร์ด&quot; หรือ &quot;แปลงนา&quot; เพื่อสร้างและเลือกแผนการปลูก จากนั้นกลับมาดูปฏิทินงานที่นี่
          </p>
        </div>
      </div>
    );
  }

  const tasksByDate = groupTasksByDate(plan.tasks);
  const taskDates = Array.from(tasksByDate.keys()).map((iso) => new Date(iso));
  const taskDateSet = new Set(Array.from(tasksByDate.keys()));

  const selectedKey =
    selectedDay != null ? format(selectedDay, "yyyy-MM-dd") : undefined;
  const tasksForSelected =
    (selectedKey && tasksByDate.get(selectedKey)) ?? [];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold mb-1">ปฏิทิน</h2>
          <p className="text-muted-foreground text-sm">
            ปฏิทินงานดูแลแปลง: {plan.plotName || "ไม่ระบุชื่อแปลง"} •{" "}
            {plan.varietyName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
          <DayPicker
            mode="single"
            locale={th}
            selected={selectedDay}
            onSelect={setSelectedDay}
            modifiers={{ hasTask: taskDates }}
            modifiersClassNames={{
              hasTask:
                "bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200",
            }}
            components={{
              DayContent: (props: DayContentProps) => {
                const key = format(props.date, "yyyy-MM-dd");
                const hasTask = taskDateSet.has(key);
                return (
                  <div className="flex flex-col items-center justify-center">
                    <span>{props.date.getDate()}</span>
                    {hasTask && (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
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
          <h3 className="text-sm font-semibold text-foreground mb-1">
            งานในวันที่เลือก
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {selectedDay
              ? format(selectedDay, "EEE d MMM yyyy", { locale: th })
              : "ยังไม่ได้เลือกวันที่"}
          </p>

          {tasksForSelected.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              ไม่มีงานในวันที่เลือก
            </p>
          ) : (
            <ul className="space-y-3">
              {tasksForSelected.map((task) => (
                <li
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <p className="text-sm font-medium text-foreground">
                    {task.taskName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ระยะ: {task.stage} • วันที่ {task.day}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function groupTasksByDate(tasks: PlanTask[]): Map<string, PlanTask[]> {
  const map = new Map<string, PlanTask[]>();
  for (const task of tasks) {
    const arr = map.get(task.date) ?? [];
    arr.push(task);
    map.set(task.date, arr);
  }
  return map;
}

