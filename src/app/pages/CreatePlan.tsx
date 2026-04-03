import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Check, Leaf, Search } from "lucide-react";
import { usePlans } from "../contexts/PlansContext";
import { RICE_VARIETIES, SOIL_TYPES, type SoilTypeKey } from "../lib/planGenerator";
import { PLANTING_METHODS, type PlantingMethodKey } from "../lib/plantingMethod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const riceVarieties = RICE_VARIETIES.map((v) => ({
  id: v.id,
  name: v.name,
  description:
    v.id === "rd43"
      ? "Fixed plan ตัวอย่าง (DAS 0–95) — ทนแล้ง ให้ผลผลิตสูง"
      : v.id === "jasmine"
        ? "หอมมะลิ — วงจรประมาณ 120 วัน"
        : v.id === "kk15"
          ? "กข15 — อ้างอิงคู่มือ RD15 (origin correction ในแชท)"
          : v.id === "pathumthani"
            ? "ปทุมธานี — วงจรประมาณ 100 วัน"
            : "ตาม Fixed Plan ในระบบ",
}));

export default function CreatePlan() {
  const navigate = useNavigate();
  const { createPlan } = usePlans();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    variety: "",
    plantDate: "",
    landSize: "",
    plotName: "",
    soilType: "" as SoilTypeKey | "",
    plantingMethod: "" as PlantingMethodKey | "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [varietyQuery, setVarietyQuery] = useState("");

  const filteredVarieties = useMemo(() => {
    const q = varietyQuery.trim().toLowerCase();
    if (!q) return riceVarieties;
    return riceVarieties.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q),
    );
  }, [varietyQuery]);

  /** ถ้ามีการเลือกแล้วแต่ถูก filter ซ่อน ให้โชว์การ์ดที่เลือกไว้ด้านบน */
  const displayVarieties = useMemo(() => {
    const selected = riceVarieties.find((v) => v.id === formData.variety);
    if (!selected) return filteredVarieties;
    if (filteredVarieties.some((v) => v.id === selected.id)) return filteredVarieties;
    return [selected, ...filteredVarieties];
  }, [filteredVarieties, formData.variety]);

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
      const created = await createPlan({
        varietyId: formData.variety,
        startDate: formData.plantDate,
        plotName: formData.plotName,
        landSize: formData.landSize,
        soilType: formData.soilType as SoilTypeKey,
        plantingMethod: formData.plantingMethod as PlantingMethodKey,
      });
      // After creating plan, jump directly to the individual plot dashboard.
      navigate(`/app/plots/${created.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.variety !== "";
      case 2: return formData.plantDate !== "";
      case 3:
        return (
          formData.landSize !== "" &&
          formData.plotName !== "" &&
          formData.soilType !== "" &&
          formData.plantingMethod !== ""
        );
      default: return false;
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${step >= stepNumber ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
                    {step > stepNumber ? <Check className="w-5 h-5" /> : <span>{stepNumber}</span>}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm ${step >= stepNumber ? "text-foreground" : "text-muted-foreground"}`}>
                      {stepNumber === 1 && "เลือกพันธุ์ข้าว"}
                      {stepNumber === 2 && "กำหนดวันปลูก"}
                      {stepNumber === 3 && "รายละเอียดแปลง"}
                    </p>
                  </div>
                </div>
                {stepNumber < 3 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                    <div className={`h-full transition-all ${step > stepNumber ? "bg-primary" : "bg-gray-200"}`} style={{ width: step > stepNumber ? "100%" : "0%" }} />
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
                เลือกพันธุ์ข้าวที่เหมาะสมกับพื้นที่และฤดูกาลของคุณ — รองรับรายการยาวด้วยการค้นหาและเลื่อนดู
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
                แสดง {displayVarieties.length} / {riceVarieties.length} พันธุ์
              </p>
              <div className="max-h-[min(32rem,70vh)] overflow-y-auto overflow-x-hidden rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 [scrollbar-gutter:stable]">
                {displayVarieties.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center">
                    ไม่พบพันธุ์ที่ตรงกับคำค้น — ลองคำอื่นหรือล้างช่องค้นหา
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {displayVarieties.map((variety) => (
                      <button
                        key={variety.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, variety: variety.id })}
                        className={`min-h-[5.5rem] p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${formData.variety === variety.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background/80"}`}
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
                          {variety.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl mb-2">วันที่เริ่มนับ DAS 0</h2>
              <p className="text-muted-foreground mb-6">
                เลือกตามจุดอ้างอิงของแปลง — เช่น วันปักดำ วันหว่านน้ำตม หรือวันหว่าน/หยอด (จะสอดคล้องกับวิธีปลูกที่เลือกในขั้นถัดไป)
              </p>
              <div className="max-w-md">
                <Label htmlFor="plantDate" className="mb-2 block">วันที่อ้างอิง (DAS 0)</Label>
                <Input
                  id="plantDate"
                  type="date"
                  value={formData.plantDate}
                  onChange={(e) => setFormData({ ...formData, plantDate: e.target.value })}
                  className="rounded-lg bg-input-background border-border h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">ระบบจะคำนวณแผนการดูแลตามวันที่คุณเลือก</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl mb-2">รายละเอียดแปลงนา</h2>
              <p className="text-muted-foreground mb-6">กรอกข้อมูลเกี่ยวกับแปลงนาของคุณ</p>
              <div className="max-w-md space-y-6">
                <div>
                  <Label htmlFor="plotName" className="mb-2 block">ชื่อแปลงนา</Label>
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
                  <Label htmlFor="landSize" className="mb-2 block">ขนาดพื้นที่ (ไร่)</Label>
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

                <div>
                  <Label htmlFor="soilType" className="mb-2 block">ชนิดดินตามมาตรฐานกรมการข้าว</Label>
                  <Select
                    value={formData.soilType}
                    onValueChange={(v) => setFormData({ ...formData, soilType: v as SoilTypeKey })}
                  >
                    <SelectTrigger className="w-full rounded-lg bg-input-background border-border h-12">
                      <SelectValue placeholder="เลือกชนิดดิน" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOIL_TYPES.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">วิธีการปลูก (กำหนดงานในไทม์ไลน์)</Label>
                  <span className="text-xs text-muted-foreground block mb-2">
                    DAS 0 = วันที่คุณเลือกในขั้นตอนก่อนหน้า — ตามประเภทนาด้านล่าง
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {PLANTING_METHODS.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, plantingMethod: m.key })}
                        className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                          formData.plantingMethod === m.key ? "border-primary bg-primary/5" : "border-border"
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
                    <p>• พันธุ์ข้าว: {riceVarieties.find((v) => v.id === formData.variety)?.name}</p>
                    <p>• วันที่ปลูก: {formData.plantDate}</p>
                    <p>• ชื่อแปลง: {formData.plotName || "-"}</p>
                    <p>• ขนาดพื้นที่: {formData.landSize || "-"} ไร่</p>
                    <p>• ชนิดดิน: {SOIL_TYPES.find((s) => s.key === formData.soilType)?.label ?? "-"}</p>
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
            <Button variant="outline" onClick={handleBack} className="rounded-lg" disabled={isLoading}>
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
