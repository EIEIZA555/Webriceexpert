"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Input } from "./input";

interface DatePickerProps {
  value?: string; // yyyy-MM-dd
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "วว/ดด/ปปปป",
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  const displayValue = date ? format(date, "dd/MM/yyyy", { locale: th }) : "";

  const handleSelect = (d: Date | undefined) => {
    if (!d) return;
    onChange?.(format(d, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              id={id}
              type="text"
              readOnly
              value={displayValue}
              placeholder={placeholder}
              className="pr-12 cursor-pointer bg-slate-50/80 border-slate-200 h-12 rounded-xl hover:bg-slate-50 focus:bg-white transition-colors"
              onClick={() => setOpen(true)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(true)}
              aria-label="เปิดปฏิทิน"
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            locale={th}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
