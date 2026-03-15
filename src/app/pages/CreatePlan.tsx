import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Check, Leaf } from "lucide-react";
import { usePlans } from "../contexts/PlansContext";

const riceVarieties = [
  { id: "jasmine", name: "ข้าวหอมมะลิ", description: "เหมาะสำหรับฤดูฝน" },
  { id: "rd43", name: "ข้าว RD43", description: "ทนแล้ง ให้ผลผลิตสูง" },
  { id: "kk15", name: "ข้าวกข 15", description: "เหมาะกับพื้นที่น้ำท่วม" },
  { id: "pathumthani", name: "ข้าวปทุมธานี", description: "โตเร็ว เก็บเกี่ยวไว" },
];

export default function CreatePlan() {
  const navigate = useNavigate();
  const { createPlan } = usePlans();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    variety: "",
    plantDate: "",
    landSize: "",
    plotName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (step === 1) navigate("/app/dashboard");
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
        startDate: formData.plantDate,
        plotName: formData.plotName,
        landSize: formData.landSize,
      });
      navigate("/app/dashboard");
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
      case 3: return formData.landSize !== "" && formData.plotName !== "";
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4">
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
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
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
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <Card className="p-8 rounded-xl shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="text-2xl mb-2">เลือกพันธุ์ข้าว</h2>
              <p className="text-muted-foreground mb-6">เลือกพันธุ์ข้าวที่เหมาะสมกับพื้นที่และฤดูกาลของคุณ</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riceVarieties.map((variety) => (
                  <button
                    key={variety.id}
                    onClick={() => setFormData({ ...formData, variety: variety.id })}
                    className={`p-6 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${formData.variety === variety.id ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg">{variety.name}</h3>
                      {formData.variety === variety.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{variety.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl mb-2">กำหนดวันเริ่มปลูก</h2>
              <p className="text-muted-foreground mb-6">เลือกวันที่คุณวางแผนจะเริ่มปลูกข้าว</p>
              <div className="max-w-md">
                <Label htmlFor="plantDate" className="mb-2 block">วันที่เริ่มปลูก</Label>
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

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="bg-accent/50 p-4 rounded-lg">
                  <h4 className="text-sm mb-2">สรุปแผนของคุณ</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>• พันธุ์ข้าว: {riceVarieties.find((v) => v.id === formData.variety)?.name}</p>
                    <p>• วันที่ปลูก: {formData.plantDate}</p>
                    <p>• ชื่อแปลง: {formData.plotName || "-"}</p>
                    <p>• ขนาดพื้นที่: {formData.landSize || "-"} ไร่</p>
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
