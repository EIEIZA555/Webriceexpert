import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Sprout, Plus, Trash2 } from "lucide-react";
import { usePlans } from "../contexts/PlansContext";
import { getCurrentStage } from "../lib/planGenerator";
import { computeHybridSchedule, getCurrentStageHybrid } from "../lib/hybridSchedule";
import { useVarieties } from "../contexts/VarietiesContext";
import { getPlantingMethodLabel } from "../lib/plantingMethod";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function Plots() {
  const navigate = useNavigate();
  const { varietyConfigs, getRecord } = useVarieties();
  const { plans, loading, setCurrentPlanId, deletePlan } = usePlans();

  const handleSelectPlan = (id: string) => {
    setCurrentPlanId(id);
    navigate(`/app/plots/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">แปลงนา</h2>
            <p className="text-muted-foreground text-sm">ยังไม่มีแปลงนาในระบบ เริ่มสร้างแปลงแรกของคุณได้เลย</p>
          </div>
          <Button
            onClick={() => navigate("/app/create-plan")}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-6 text-white shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            เพิ่มแปลงนา
          </Button>
        </div>
        <Card className="p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">ยังไม่มีแปลงนา</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            เมื่อคุณสร้างแผนการปลูก แปลงนาจะถูกแสดงในหน้านี้
          </p>
          <Button
            onClick={() => navigate("/app/create-plan")}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-6 text-white shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            สร้างแผนการปลูกใหม่
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">แปลงนา</h2>
          <p className="text-muted-foreground text-sm">รายการแปลงนาทั้งหมดของคุณ</p>
        </div>
        <Button
          onClick={() => navigate("/app/create-plan")}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-6 text-white shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มแปลงนา
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const rec = getRecord(plan.varietyId);
          const hybrid = computeHybridSchedule(plan, rec, varietyConfigs);
          const pct = hybrid.progressPercent;
          const stage =
            (rec?.scheduleMode === "FIXED_DATE"
              ? getCurrentStageHybrid(plan, rec, hybrid.daysSincePlant, varietyConfigs)
              : getCurrentStage(plan.varietyId, hybrid.daysSincePlant, varietyConfigs)) ??
            "เก็บเกี่ยวแล้ว";

          return (
            <Card
              key={plan.id}
              className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all cursor-pointer hover:border-slate-200"
              onClick={() => handleSelectPlan(plan.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground">
                      {plan.plotName || "ไม่ระบุชื่อแปลง"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {plan.varietyName} • {getPlantingMethodLabel(plan.plantingMethod)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 text-xs">
                    {stage}
                  </Badge>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">พื้นที่</span>
                  <span>{plan.areaRai} ไร่</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">วันที่ปลูก</span>
                  <span>{format(new Date(plan.startDate), "d MMM yyyy", { locale: th })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">สถานะรอบการผลิต</span>
                  <span className="text-right max-w-[14rem] leading-snug">{hybrid.plotSummaryLine}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">ความคืบหน้า</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
