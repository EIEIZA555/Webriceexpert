import { Check, Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { PLANTING_METHODS } from "../../lib/plantingMethod";
import type { CreatePlanFormData, CreatePlanVarietyOption } from "./types";

interface CreatePlanVarietyStepProps {
  formData: CreatePlanFormData;
  varietyQuery: string;
  displayVarieties: CreatePlanVarietyOption[];
  totalVarieties: number;
  onVarietyQueryChange: (query: string) => void;
  onSelectVariety: (varietyId: string) => void;
}

export function CreatePlanVarietyStep({
  formData,
  varietyQuery,
  displayVarieties,
  totalVarieties,
  onVarietyQueryChange,
  onSelectVariety,
}: CreatePlanVarietyStepProps) {
  return (
    <div>
      <h2 className="text-2xl mb-2">เลือกพันธุ์ข้าว</h2>
      <p className="text-muted-foreground mb-4">
        เลือกพันธุ์ข้าวที่เหมาะสมกับพื้นที่และฤดูกาลของคุณ
      </p>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          autoComplete="off"
          placeholder="ค้นหาชื่อพันธุ์หรือคำอธิบาย..."
          value={varietyQuery}
          onChange={(e) => onVarietyQueryChange(e.target.value)}
          className="h-11 rounded-xl border-border bg-input-background pl-9 pr-3"
        />
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        แสดง {displayVarieties.length} / {totalVarieties} พันธุ์
      </p>
      <div className="max-h-[min(32rem,70vh)] overflow-y-auto overflow-x-hidden rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 [scrollbar-gutter:stable]">
        {displayVarieties.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            {totalVarieties === 0 ? "กำลังโหลด..." : "ไม่พบพันธุ์ที่ตรงกับคำค้น"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayVarieties.map((variety) => (
              <button
                key={variety.id}
                type="button"
                onClick={() => onSelectVariety(variety.id)}
                className={`min-h-[5.5rem] p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                  formData.variety === variety.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-base font-medium leading-snug">{variety.name}</h3>
                  {formData.variety === variety.id && (
                    <div className="w-6 h-6 shrink-0 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      variety.is_photoperiod_sensitive
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {variety.is_photoperiod_sensitive ? "นาปี" : "นาปรัง"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {variety.supported_methods
                    .map((m) => PLANTING_METHODS.find((p) => p.key === m)?.label ?? m)
                    .join(", ")}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
