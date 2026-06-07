import { Circle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "./ui/badge";
import { TaskGlyph } from "../lib/taskIcons";
import { formatDateWithWeekday, isBeforeToday } from "../lib/dateUtils";
import type { PlanTask } from "../lib/planTypes";

interface TaskRowProps {
  task: PlanTask;
  onToggle: () => void;
  layout?: boolean;
}

export function TaskRow({ task, onToggle, layout = true }: TaskRowProps) {
  const isOverdue = !task.isCompleted && isBeforeToday(task.date);
  const Wrapper = layout ? motion.div : "div";
  const wrapperProps = layout ? { layout: true } : {};

  return (
    <Wrapper
      {...wrapperProps}
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
        onClick={onToggle}
        aria-label={
          task.isCompleted
            ? `ทำเครื่องหมายว่ายังไม่เสร็จ: ${task.taskName}`
            : `ทำเครื่องหมายว่าเสร็จแล้ว: ${task.taskName}`
        }
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
          <p
            className={`font-medium ${
              task.isCompleted ? "line-through text-slate-500" : "text-slate-900"
            }`}
          >
            {task.taskName}
          </p>
          {isOverdue && (
            <Badge
              variant="outline"
              className="text-[10px] text-rose-600 border-rose-200 bg-white"
            >
              เลยกำหนด
            </Badge>
          )}
        </div>
        <p className={`text-sm mt-0.5 ${isOverdue ? "text-rose-600" : "text-slate-500"}`}>
          {formatDateWithWeekday(task.date)} • {task.stage}
        </p>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{task.description}</p>
        )}
      </div>
    </Wrapper>
  );
}
