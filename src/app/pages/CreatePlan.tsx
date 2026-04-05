import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Check, Leaf, Search } from "lucide-react";
import { usePlans } from "../contexts/PlansContext";
import { useVarieties } from "../contexts/VarietiesContext";
import { PLANTING_METHODS, plantingDateFromPlanStartDate, type PlantingMethodKey } from "../lib/plantingMethod";
import { resolveHarvestDateForSeason, shouldWarnLatePlantingFixed } from "../lib/hybridSchedule";
import { apiFetch } from "../lib/api";
import { RICE_SEASON_LABELS } from "../lib/riceVarietyTypes";

export default function CreatePlan() {
  const navigate = useNavigate();
  const { createPlan, isVarietyRegisteredOnBackend } = usePlans();
  const { varieties } = useVarieties();
  const [step, setStep] = useState(1);
  /** รองรับวิธีปลูกจาก GET /varieties/ (slug เดียวกับ id พันธุ์) */
  const [methodByCollection, setMethodByCollection] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    variety: "",
    plantDate: "",
    landSize: "",
    plotName: "",
    plantingMethod: "" as PlantingMethodKey | "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [varietyQuery, setVarietyQuery] = useState("");

  useEffect(() => {
    apiFetch<Array<{ collection_name: string; supported_methods: string[] }>>("/varieties/")
      .then((rows) => {
        const o: Record<string, string[]> = {};
        rows.forEach((r) => {
          o[r.collection_name] = r.supported_methods;
        });
        setMethodByCollection(o);
      })
      .catch(() => {});
  }, []);

  const selectedVariety = varieties.find((v) => v.id === formData.variety);

  const methodsForCollection = formData.variety
    ? methodByCollection[formData.variety]
    : undefined;
  const availableMethods =
    selectedVariety && methodsForCollection?.length
      ? PLANTING_METHODS.filter((m) => methodsForCollection.includes(m.key))
      : PLANTING_METHODS;

  const filteredVarieties = useMemo(() => {
    const q = varietyQuery.trim().toLowerCase();
    if (!q) return varieties;
    return varieties.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        RICE_SEASON_LABELS[v.seasonType].toLowerCase().includes(q),
    );
  }, [varietyQuery, varieties]);

  const fixedLatePlantingWarning = useMemo(() => {
    const v = selectedVariety;
    if (
      !v ||
      v.scheduleMode !== "FIXED_DATE" ||
      !v.harvestMonthDay ||
      !formData.plantDate ||
      !formData.plantingMethod
    ) {
      return false;
    }
    const plantingISO = plantingDateFromPlanStartDate(
      formData.plantDate,
      formData.plantingMethod as PlantingMethodKey,
    );
    const harvestISO = resolveHarvestDateForSeason(plantingISO, v.harvestMonthDay);
    return shouldWarnLatePlantingFixed(plantingISO, harvestISO);
  }, [selectedVariety, formData.plantDate, formData.plantingMethod]);

  const displayVarieties = useMemo(() => {
    const selected = varieties.find((v) => v.id === formData.variety);
    if (!selected) return filteredVarieties;
    if (filteredVarieties.some((v) => v.id === selected.id)) return filteredVarieties;
    return [selected, ...filteredVarieties];
  }, [filteredVarieties, formData.variety, varieties]);

  const handleBack = () => {
    if (step === 1) navigate("/app/plots");
    else setStep(step - 1);
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (!isVarietyRegisteredOnBackend(formData.variety)) {
        throw new Error(
          "พันธุ์นี้ยังไม่ลงทะเบียนในระบบหลังบ้าน — สร้างแผนไม่ได้ โปรดเลือกพันธุ์ที่มีใน API หรือเพิ่มพันธุ์ที่เซิร์ฟเวอร์ก่อน",
        );
      }
      await createPlan({
        varietyId: formData.variety,
        startDate: formData.plantDate,
        plotName: formData.plotName,
        landSize: formData.landSize,
        plantingMethod: formData.plantingMethod as PlantingMethodKey,
      });
      navigate("/app/plots");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.variety !== "";
      case 2:
        return formData.plantDate !== "";
      case 3:
        return formData.landSize !== "" && formData.plotName !== "" && formData.plantingMethod !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary" />
              <h1 className="text-xl">Rice Expert</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      step >= stepNumber ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > stepNumber ? <Check className="w-5 h-5" /> : <span>{stepNumber}</span>}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm ${
                        step >= stepNumber ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stepNumber === 1 && "เลือกพันธุ์ข้าว"}
                      {stepNumber === 2 && "กำหนดวันปลูก"}
                      {stepNumber === 3 && "รายละเอียดแปลง"}
                    </p>
                  </div>
                </div>
                {stepNumber < 3 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                    <div
                      className={`h-full transition-all ${
                        step > stepNumber ? "bg-primary" : "bg-gray-200"
                      }`}
                      style={{ width: step > stepNumber ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <Card className="p-6 sm:p-8 rounded-xl shadow-sm">
          {step === 1 && (
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
                  onChange={(e) => setVarietyQuery(e.target.value)}
                  className="h-11 rounded-xl border-border bg-input-background pl-9 pr-3"
                />
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                แสดง {displayVarieties.length} / {varieties.length} พันธุ์
              </p>
              <div className="max-h-[min(32rem,70vh)] overflow-y-auto overflow-x-hidden rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 [scrollbar-gutter:stable]">
                {displayVarieties.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center">
                    {varieties.length === 0 ? "กำลังโหลด..." : "ไม่พบพันธุ์ที่ตรงกับคำค้น"}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {displayVarieties.map((variety) => {
                      const onBackend = isVarietyRegisteredOnBackend(variety.id);
                      return (
                      <button
                        key={variety.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, variety: variety.id, plantingMethod: "" })
                        }
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
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {RICE_SEASON_LABELS[variety.seasonType]} •{" "}
                          {variety.photoperiodSensitive ? "ไวต่อช่วงแสง" : "ไม่ไวต่อช่วงแสง"} • DAS สูงสุด{" "}
                          {variety.totalDays} วัน
                        </p>
                        <p className="text-xs mt-1.5">
                          {onBackend ? (
                            <span className="text-emerald-700">ลงทะเบียนระบบ — สร้างแผนได้</span>
                          ) : (
                            <span className="text-amber-700">ยังไม่พบใน API — สร้างแผนไม่ได้จนกว่าจะลงทะเบียน</span>
                          )}
                        </p>
                      </button>
                    );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl mb-2">วันที่เริ่มปลูก</h2>
              <p className="text-muted-foreground mb-6">
                เลือกวันที่ปลูกจริง — เช่น วันปักดำ วันหว่าน หรือวันโยนกล้า
              </p>
              <div className="max-w-md">
                <Label htmlFor="plantDate" className="mb-2 block">
                  วันที่ปลูก
                </Label>
                <Input
                  id="plantDate"
                  type="date"
                  value={formData.plantDate}
                  onChange={(e) => setFormData({ ...formData, plantDate: e.target.value })}
                  className="rounded-lg bg-input-background border-border h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  ระบบจะคำนวณแผนการดูแลตามวันที่คุณเลือก
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
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
                    onChange={(e) => setFormData({ ...formData, plotName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                    className="rounded-lg bg-input-background border-border h-12"
                  />
                </div>

                {fixedLatePlantingWarning && (
                  <div
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                    role="status"
                  >
                    <p className="font-medium text-amber-900">คำเตือน</p>
                    <p className="mt-1 text-amber-900/90">
                      ปลูกช้าเกินไป อาจส่งผลต่อผลผลิต เนื่องจากข้าวจะออกดอกตามฤดูกาล (พันธุ์กำหนดวันเก็บเกี่ยวคงที่)
                    </p>
                  </div>
                )}

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
                        onClick={() => setFormData({ ...formData, plantingMethod: m.key })}
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
                    <p>• อายุเก็บเกี่ยว: {selectedVariety?.totalDays ?? "-"} วัน</p>
                    <p>• วันที่ปลูก: {formData.plantDate}</p>
                    <p>• ชื่อแปลง: {formData.plotName || "-"}</p>
                    <p>• ขนาดพื้นที่: {formData.landSize || "-"} ไร่</p>
                    <p>
                      • วิธีปลูก:{" "}
                      {PLANTING_METHODS.find((m) => m.key === formData.plantingMethod)?.label ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-lg"
              disabled={isLoading}
            >
              {step === 1 ? "ยกเลิก" : "ย้อนกลับ"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              className="bg-primary hover:bg-primary/90 rounded-lg min-w-[120px]"
            >
              {isLoading ? "กำลังสร้าง..." : step === 3 ? "สร้างแผน" : "ถัดไป"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
