import { CalendarIcon } from "lucide-react";
import { th } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { formatDateLong, fromISODate, toISODate } from "../lib/dateUtils";

type PlanStartDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
};

export function PlanStartDatePicker({
  value,
  onChange,
  open,
  onOpenChange,
  disabled,
  placeholder = "เลือกวันที่",
}: PlanStartDatePickerProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="flex w-full h-12 rounded-lg items-center px-3 text-left text-sm bg-input-background border border-border gap-2 hover:bg-accent transition-colors">
        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        {value ? (
          <span>{formatDateLong(value)}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={fromISODate(value)}
          disabled={disabled}
          onSelect={(date) => {
            if (date) onChange(toISODate(date));
            onOpenChange(false);
          }}
          locale={th}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
