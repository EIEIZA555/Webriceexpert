import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { DatePicker } from "../components/ui/date-picker";
import { ArrowLeft, Check, Leaf } from "lucide-react";
import { usePlanStore } from "../store/planStore";
import { RICE_VARIETIES } from "../lib/planGenerator";

const riceVarieties = RICE_VARIETIES.map((v) => ({
  id: v.id,
  name: v.name,
  description: `อายุเก็บเกี่ยว ${v.lifecycleDays} วัน`,
}));

export default function CreatePlan() {
  const navigate = useNavigate();
  const createPlan = usePlanStore((s) => s.createPlan);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    variety: "",
    plantDate: "",
    landSize: "",
    plotName: "",
  });

  const handleBack = () => {
    if (step === 1) {
      navigate("/dashboard");
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      createPlan({
        varietyId: formData.variety,
        startDate: formData.plantDate,
        plotName: formData.plotName,
        landSize: formData.landSize,
      });
      navigate("/dashboard");
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.variety !== "";
      case 2:
        return formData.plantDate !== "";
      case 3:
        return formData.landSize !== "" && formData.plotName !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Rice Expert</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center flex-1 min-w-0">
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                      step >= stepNumber
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {step > stepNumber ? (
                      <Check className="w-5 h-5" strokeWidth={2.5} />
                    ) : (
                      <span>{stepNumber}</span>
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium hidden sm:block truncate ${
                      step >= stepNumber ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {stepNumber === 1 && "เลือกพันธุ์ข้าว"}
                    {stepNumber === 2 && "กำหนดวันปลูก"}
                    {stepNumber === 3 && "รายละเอียดแปลง"}
                  </p>
                </div>
                {stepNumber < 3 && (
                  <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-slate-200 rounded-full min-w-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        step > stepNumber ? "bg-emerald-500" : "bg-slate-200"
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
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <Card className="p-8 lg:p-10 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {/* Step 1: Select Rice Variety */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">เลือกพันธุ์ข้าว</h2>
              <p className="text-muted-foreground text-sm mb-8">
                เลือกพันธุ์ข้าวที่เหมาะสมกับพื้นที่และฤดูกาลของคุณ
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {riceVarieties.map((variety) => (
                  <button
                    key={variety.id}
                    onClick={() => setFormData({ ...formData, variety: variety.id })}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      formData.variety === variety.id
                        ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-foreground">{variety.name}</h3>
                      {formData.variety === variety.id && (
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{variety.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Planting Date */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">กำหนดวันเริ่มปลูก</h2>
              <p className="text-muted-foreground text-sm mb-8">
                เลือกวันที่คุณวางแผนจะเริ่มปลูกข้าว
              </p>

              <div className="max-w-md space-y-2">
                <Label htmlFor="plantDate" className="text-sm font-medium text-foreground">
                  วันที่เริ่มปลูก
                </Label>
                <DatePicker
                  id="plantDate"
                  value={formData.plantDate}
                  onChange={(value) =>
                    setFormData({ ...formData, plantDate: value })
                  }
                  placeholder="วว/ดด/ปปปป"
                  className="rounded-xl"
                />
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  ระบบจะคำนวณแผนการดูแลตามวันที่คุณเลือก
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Land Details */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">รายละเอียดแปลงนา</h2>
              <p className="text-muted-foreground text-sm mb-8">
                กรอกข้อมูลเกี่ยวกับแปลงนาของคุณ
              </p>

              <div className="max-w-md space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="plotName" className="text-sm font-medium">ชื่อแปลงนา</Label>
                  <Input
                    id="plotName"
                    type="text"
                    placeholder="เช่น แปลงนา A1"
                    value={formData.plotName}
                    onChange={(e) =>
                      setFormData({ ...formData, plotName: e.target.value })
                    }
                    className="rounded-xl border-slate-200 bg-slate-50/50 h-12 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landSize" className="text-sm font-medium">ขนาดพื้นที่ (ไร่)</Label>
                  <Input
                    id="landSize"
                    type="number"
                    step="0.1"
                    placeholder="เช่น 3.5"
                    value={formData.landSize}
                    onChange={(e) =>
                      setFormData({ ...formData, landSize: e.target.value })
                    }
                    className="rounded-xl border-slate-200 bg-slate-50/50 h-12 focus:bg-white"
                  />
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h4 className="text-sm mb-2">สรุปแผนของคุณ</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>
                      • พันธุ์ข้าว:{" "}
                      {riceVarieties.find((v) => v.id === formData.variety)?.name}
                    </p>
                    <p>• วันที่ปลูก: {formData.plantDate}</p>
                    <p>• ชื่อแปลง: {formData.plotName || "-"}</p>
                    <p>• ขนาดพื้นที่: {formData.landSize || "-"} ไร่</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-3 mt-10 pt-8 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-xl h-11 px-5 border-slate-200 hover:bg-slate-50"
            >
              {step === 1 ? "ยกเลิก" : "ย้อนกลับ"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 min-w-[120px] shadow-sm disabled:opacity-50"
            >
              {step === 3 ? "สร้างแผน" : "ถัดไป"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
