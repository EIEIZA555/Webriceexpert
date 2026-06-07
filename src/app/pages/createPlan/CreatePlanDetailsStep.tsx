import { Check } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { formatDateLong } from "../../lib/dateUtils";
import { PLANTING_METHODS } from "../../lib/plantingMethod";
import type { CreatePlanFormData, CreatePlanVarietyOption } from "./types";

interface CreatePlanDetailsStepProps {
  formData: CreatePlanFormData;
  selectedVariety?: CreatePlanVarietyOption;
  availableMethods: (typeof PLANTING_METHODS)[number][];
  error: string | null;
  onFormChange: (patch: Partial<CreatePlanFormData>) => void;
}

export function CreatePlanDetailsStep({
  formData,
  selectedVariety,
  availableMethods,
  error,
  onFormChange,
}: CreatePlanDetailsStepProps) {
  return (
    <div>
      <h2 className="text-2xl mb-2">รายละเอียดแปลงนา</h2>
      <p className="text-muted-foreground mb-6">กรอกข้อมูลเกี่ยวกับแปลงนาของคุณ</p>
      <div className="max-w-md space-y-6">
        <div>
          <Label htmlFor="plotName" className="mb-2 block">
            ชื่อแปลงนา
          </Label>
          <Input
            id="plotName"
            type="text"
            placeholder="เช่น แปลงนา A1"
            value={formData.plotName}
            onChange={(e) => onFormChange({ plotName: e.target.value })}
            className="rounded-lg bg-input-background border-border h-12"
          />
        </div>
        <div>
          <Label htmlFor="landSize" className="mb-2 block">
            ขนาดพื้นที่ (ไร่)
          </Label>
          <Input
            id="landSize"
            type="number"
            step="0.1"
            placeholder="เช่น 3.5"
            value={formData.landSize}
            onChange={(e) => onFormChange({ landSize: e.target.value })}
            className="rounded-lg bg-input-background border-border h-12"
          />
        </div>

        <div>
          <Label className="mb-3 block">ประเภทดิน</Label>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { key: "clay", label: "ดินเหนียว", desc: "ปุ๋ย 16-20-0" },
                { key: "loam", label: "ดินร่วน", desc: "ปุ๋ย 16-16-8" },
                { key: "sandy", label: "ดินทราย", desc: "ปุ๋ย 16-16-8" },
              ] as const
            ).map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onFormChange({ soilType: s.key })}
                className={`p-3 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                  formData.soilType === s.key ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-medium text-sm">{s.label}</span>
                  {formData.soilType === s.key && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-3 block">วิธีการปลูก</Label>
          {selectedVariety && (
            <p className="text-xs text-muted-foreground mb-2">
              พันธุ์ที่เลือกรองรับ: {availableMethods.map((m) => m.label).join(", ")}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3">
            {availableMethods.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => onFormChange({ plantingMethod: m.key })}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                  formData.plantingMethod === m.key
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">{m.label}</span>
                  {formData.plantingMethod === m.key && (
                    <Check className="w-5 h-5 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-accent/50 p-4 rounded-lg">
          <h4 className="text-sm mb-2">สรุปแผนของคุณ</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>• พันธุ์ข้าว: {selectedVariety?.name ?? "-"}</p>
            <p>• วันเริ่มงาน: {formData.plantDate ? formatDateLong(formData.plantDate) : "-"}</p>
            <p>• ชื่อแปลง: {formData.plotName || "-"}</p>
            <p>• ขนาดพื้นที่: {formData.landSize || "-"} ไร่</p>
            <p>
              • ประเภทดิน:{" "}
              {{ clay: "ดินเหนียว", loam: "ดินร่วน", sandy: "ดินทราย" }[formData.soilType]}
            </p>
            <p>
              • วิธีปลูก:{" "}
              {PLANTING_METHODS.find((m) => m.key === formData.plantingMethod)?.label ?? "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
