import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { formatBE } from "../lib/dateUtils";
import { th } from "date-fns/locale";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { ArrowLeft, CalendarIcon, Check, Leaf, Search } from "lucide-react";
import { usePlans } from "../contexts/PlansContext";
import { PLANTING_METHODS, type PlantingMethodKey } from "../lib/plantingMethod";
import { apiFetch } from "../lib/api";

export default function CreatePlan() {
  const navigate = useNavigate();
  const { createPlan } = usePlans();
  const [step, setStep] = useState(1);
  const [varieties, setVarieties] = useState<{ id: string; name: string; supported_methods: string[]; is_photoperiod_sensitive?: boolean }[]>([]);

  const [formData, setFormData] = useState({
    variety: "",
    plantDate: "",
    landSize: "",
    plotName: "",
    plantingMethod: "" as PlantingMethodKey | "",
    soilType: "clay" as "clay" | "loam" | "sandy",
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [varietyQuery, setVarietyQuery] = useState("");

  useEffect(() => {
    apiFetch<Array<{ collection_name: string; name: string; supported_methods: string[]; is_photoperiod_sensitive: boolean }>>("/varieties/")
      .then((rows) => {
        setVarieties(rows.map((r) => ({
          id: r.collection_name,
          name: r.name,
          supported_methods: r.supported_methods,
          is_photoperiod_sensitive: r.is_photoperiod_sensitive,
        })));
      })
      .catch(() => {});
  }, []);

  const selectedVariety = varieties.find((v) => v.id === formData.variety);

  const methodsForCollection = selectedVariety?.supported_methods;
  const availableMethods =
    selectedVariety && methodsForCollection?.length
      ? PLANTING_METHODS.filter((m) => methodsForCollection.includes(m.key))
      : PLANTING_METHODS;

  const filteredVarieties = useMemo(() => {
    const q = varietyQuery.trim().toLowerCase();
    if (!q) return varieties;
    return varieties.filter(
      (v) => v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q),
    );
  }, [varietyQuery, varieties]);

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
      await createPlan({
        varietyId: formData.variety,
        startDate: formData.plantDate, // เก็บเป็น yyyy-mm-dd เสมอ
        plotName: formData.plotName,
        landSize: formData.landSize,
        plantingMethod: formData.plantingMethod as PlantingMethodKey,
        soilType: formData.soilType,
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
                    {displayVarieties.map((variety) => (
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
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${variety.is_photoperiod_sensitive ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                            {variety.is_photoperiod_sensitive ? "นาปี" : "นาปรัง"}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {variety.supported_methods.map((m) => PLANTING_METHODS.find((p) => p.key === m)?.label ?? m).join(", ")}
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
              <h2 className="text-2xl mb-2">วันที่เริ่มเตรียมงาน</h2>
              <p className="text-muted-foreground mb-6">
                เลือกวันที่คุณต้องการเริ่มทำกิจกรรมแรก — เช่น วันที่เริ่มไถดะ หรือวันที่เริ่มแช่เมล็ดพันธุ์
              </p>
              <div className="max-w-md">
                <Label htmlFor="plantDate" className="mb-2 block">
                  วันที่เริ่มเตรียมงาน
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger className="flex w-full h-12 rounded-lg items-center px-3 text-left text-sm bg-input-background border border-border gap-2 hover:bg-accent transition-colors">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    {formData.plantDate ? (
                      <span>{formatBE(new Date(`${formData.plantDate}T00:00:00`), "d MMMM yyyy", { locale: th })}</span>
                    ) : (
                      <span className="text-muted-foreground">เลือกวันที่</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.plantDate ? new Date(`${formData.plantDate}T00:00:00`) : undefined}
                      disabled={(date) => {
                        if (date < new Date(new Date().setHours(0,0,0,0))) return true;
                        if (selectedVariety?.is_photoperiod_sensitive) {
                          const m = date.getMonth() + 1; // 1-12
                          return m < 5 || m > 8;
                        }
                        return false;
                      }}
                      onSelect={(date) => {
                        if (date) {
                          const yyyy = date.getFullYear();
                          const mm = String(date.getMonth() + 1).padStart(2, "0");
                          const dd = String(date.getDate()).padStart(2, "0");
                          setFormData({ ...formData, plantDate: `${yyyy}-${mm}-${dd}` });
                        }
                        setCalendarOpen(false);
                      }}
                      formatters={{
                        formatCaption: (date) => {
                          const months = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
                          return `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
                        },
                      }}
                      locale={th}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground mt-2">
                  ระบบจะคำนวณวันลงปลูกจริงและการดูแลต่างๆ ให้สัมพันธ์กับวันที่คุณเริ่มเตรียมงาน
                </p>

                {selectedVariety?.is_photoperiod_sensitive && (
                  <div className="mt-6 p-4 bg-[#fff8e1] border border-[#ffe082] rounded-xl flex items-start gap-3">
                    <div className="text-[#ff8f00] mt-0.5">🌾</div>
                    <div>
                      <h4 className="text-sm font-medium text-[#ff8f00]">พันธุ์ข้าวไวแสง (Photosensitive)</h4>
                      <p className="text-xs text-[#ffb300] mt-1 leading-relaxed">
                        ข้าวพันธุ์นี้จะออกดอกตามช่วงแสงของฤดูกาล
                        <br />
                        <span className="font-semibold text-[#ff8f00]">คำแนะนำ:</span> ควรเริ่มเตรียมงานปลูกในช่วง <span className="underline">พฤษภาคม - สิงหาคม</span>
                      </p>
                    </div>
                  </div>
                )}
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


                <div>
                  <Label className="mb-3 block">ประเภทดิน</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { key: "clay", label: "ดินเหนียว", desc: "ปุ๋ย 16-20-0" },
                      { key: "loam", label: "ดินร่วน", desc: "ปุ๋ย 16-16-8" },
                      { key: "sandy", label: "ดินทราย", desc: "ปุ๋ย 16-16-8" },
                    ] as const).map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, soilType: s.key })}
                        className={`p-3 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                          formData.soilType === s.key ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-medium text-sm">{s.label}</span>
                          {formData.soilType === s.key && <Check className="w-4 h-4 text-primary shrink-0" />}
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
                    <p>• วันที่ปลูก: {formData.plantDate ? formatBE(new Date(`${formData.plantDate}T00:00:00`), "d MMMM yyyy", { locale: th }) : "-"}</p>
                    <p>• ชื่อแปลง: {formData.plotName || "-"}</p>
                    <p>• ขนาดพื้นที่: {formData.landSize || "-"} ไร่</p>
                    <p>• ประเภทดิน: {{ clay: "ดินเหนียว", loam: "ดินร่วน", sandy: "ดินทราย" }[formData.soilType]}</p>
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
