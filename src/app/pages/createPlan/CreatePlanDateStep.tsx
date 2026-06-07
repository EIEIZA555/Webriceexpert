import { Label } from "../../components/ui/label";
import { PlanStartDatePicker } from "../../components/PlanStartDatePicker";
import { todayAtMidnight } from "../../lib/dateUtils";
import type { CreatePlanFormData, CreatePlanVarietyOption } from "./types";

interface CreatePlanDateStepProps {
  formData: CreatePlanFormData;
  selectedVariety?: CreatePlanVarietyOption;
  calendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
  onPlantDateChange: (plantDate: string) => void;
}

export function CreatePlanDateStep({
  formData,
  selectedVariety,
  calendarOpen,
  onCalendarOpenChange,
  onPlantDateChange,
}: CreatePlanDateStepProps) {
  return (
    <div>
      <h2 className="text-2xl mb-2">วันที่เริ่มเตรียมงาน</h2>
      <p className="text-muted-foreground mb-6">
        เลือกวันที่คุณต้องการเริ่มทำกิจกรรมแรก — เช่น วันที่เริ่มไถดะ หรือวันที่เริ่มแช่เมล็ดพันธุ์
      </p>
      <div className="max-w-md">
        <Label htmlFor="plantDate" className="mb-2 block">
          วันที่เริ่มเตรียมงาน
        </Label>
        <PlanStartDatePicker
          value={formData.plantDate}
          onChange={onPlantDateChange}
          open={calendarOpen}
          onOpenChange={onCalendarOpenChange}
          disabled={(date) => {
            if (date < todayAtMidnight()) return true;
            if (selectedVariety?.is_photoperiod_sensitive) {
              const m = date.getMonth() + 1;
              return m < 6 || m > 7;
            }
            return false;
          }}
        />
        <p className="text-sm text-muted-foreground mt-2">
          ระบบจะคำนวณวันลงปลูกจริงและการดูแลต่างๆ ให้สัมพันธ์กับวันที่คุณเริ่มเตรียมงาน
        </p>

        {selectedVariety?.is_photoperiod_sensitive && (
          <div className="mt-6 p-4 bg-[#fff8e1] border border-[#ffe082] rounded-xl flex items-start gap-3">
            <div className="text-[#ff8f00] mt-0.5">🌾</div>
            <div>
              <h4 className="text-sm font-medium text-[#ff8f00]">
                พันธุ์ข้าวไวแสง (Photosensitive)
              </h4>
              <p className="text-xs text-[#ffb300] mt-1 leading-relaxed">
                ข้าวพันธุ์นี้ออกดอกตามช่วงแสง เหมาะกับการปลูกช่วงต้นฤดูฝน
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
