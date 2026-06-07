import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Check, Leaf } from "lucide-react";
import { usePlans } from "../contexts/PlansContext";
import { PLANTING_METHODS, type PlantingMethodKey } from "../lib/plantingMethod";
import { useVarieties } from "../lib/useVarieties";
import { CreatePlanDateStep } from "./createPlan/CreatePlanDateStep";
import { CreatePlanDetailsStep } from "./createPlan/CreatePlanDetailsStep";
import { CreatePlanVarietyStep } from "./createPlan/CreatePlanVarietyStep";
import type { CreatePlanFormData } from "./createPlan/types";

export default function CreatePlan() {
  const navigate = useNavigate();
  const { createPlan } = usePlans();
  const [step, setStep] = useState(1);
  const { varieties: varietyRows } = useVarieties();
  const varieties = varietyRows.map((r) => ({
    id: r.collection_name,
    name: r.name,
    supported_methods: r.supported_methods,
    is_photoperiod_sensitive: r.is_photoperiod_sensitive,
  }));

  const [formData, setFormData] = useState<CreatePlanFormData>({
    variety: "",
    plantDate: "",
    landSize: "",
    plotName: "",
    plantingMethod: "",
    soilType: "clay",
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [varietyQuery, setVarietyQuery] = useState("");

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
        startDate: formData.plantDate,
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
        return (
          formData.landSize !== "" &&
          formData.plotName !== "" &&
          formData.plantingMethod !== ""
        );
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                      {stepNumber === 2 && "วันเริ่มงาน"}
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

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <Card className="p-6 sm:p-8 rounded-xl shadow-sm">
          {step === 1 && (
            <CreatePlanVarietyStep
              formData={formData}
              varietyQuery={varietyQuery}
              displayVarieties={displayVarieties}
              totalVarieties={varieties.length}
              onVarietyQueryChange={setVarietyQuery}
              onSelectVariety={(varietyId) =>
                setFormData({ ...formData, variety: varietyId, plantingMethod: "" })
              }
            />
          )}

          {step === 2 && (
            <CreatePlanDateStep
              formData={formData}
              selectedVariety={selectedVariety}
              calendarOpen={calendarOpen}
              onCalendarOpenChange={setCalendarOpen}
              onPlantDateChange={(plantDate) => setFormData({ ...formData, plantDate })}
            />
          )}

          {step === 3 && (
            <CreatePlanDetailsStep
              formData={formData}
              selectedVariety={selectedVariety}
              availableMethods={availableMethods}
              error={error}
              onFormChange={(patch) => setFormData({ ...formData, ...patch })}
            />
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
