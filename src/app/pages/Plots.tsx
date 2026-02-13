import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Sprout, Plus } from "lucide-react";
import { usePlanStore } from "../store/planStore";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function Plots() {
  const navigate = useNavigate();
  const plans = usePlanStore((s) => s.plans);
  const currentPlanId = usePlanStore((s) => s.currentPlanId);
  const setCurrentPlan = usePlanStore((s) => s.setCurrentPlan);
  const getProgressPercent = usePlanStore((s) => s.getProgressPercent);
  const getCurrentStage = usePlanStore((s) => s.getCurrentStage);
  const getStats = usePlanStore((s) => s.getStats);

  const stats = getStats();

  const handleSelectPlot = (planId: string) => {
    setCurrentPlan(planId);
    navigate("/dashboard");
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">แปลงนา</h1>
          <p className="text-muted-foreground text-sm mt-1">รายการแปลงนาทั้งหมดของคุณ</p>
        </div>
        <Button
          onClick={() => navigate("/create-plan")}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มแปลงนา
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-muted-foreground">แปลงนาทั้งหมด</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalPlots}</p>
        </Card>
        <Card className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-muted-foreground">พื้นที่รวม</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalArea} ไร่</p>
        </Card>
        <Card className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-muted-foreground">แปลงพร้อมเก็บเกี่ยว</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.readyToHarvest}</p>
        </Card>
      </div>

      {plans.length === 0 ? (
        <Card className="p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
          <Sprout className="w-16 h-16 text-emerald-600 mx-auto mb-4 opacity-60" />
          <h3 className="text-lg font-semibold text-foreground mb-2">ยังไม่มีแปลงนา</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            สร้างแผนการปลูกเพื่อเพิ่มแปลงนาแรกของคุณ
          </p>
          <Button
            onClick={() => navigate("/create-plan")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            สร้างแผนการปลูก
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((plan) => {
            const progress = getProgressPercent(plan);
            const stage = getCurrentStage(plan);
            const isCurrent = plan.id === currentPlanId;
            return (
              <Card
                key={plan.id}
                onClick={() => handleSelectPlot(plan.id)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? "border-emerald-500 bg-emerald-50/30 shadow-[0_4px_12px_rgba(5,150,105,0.15)] ring-2 ring-emerald-200"
                    : "border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCurrent ? "bg-emerald-500" : "bg-emerald-100"
                      }`}
                    >
                      <Sprout
                        className={`w-6 h-6 ${isCurrent ? "text-white" : "text-emerald-600"}`}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{plan.plotName}</h4>
                      <p className="text-sm text-muted-foreground">{plan.varietyName}</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge className="bg-emerald-600 text-white border-0">แปลงปัจจุบัน</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">พื้นที่:</span>
                    <span>{plan.landSize} ไร่</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">วันที่ปลูก:</span>
                    <span>{format(new Date(plan.startDate), "d MMM yyyy", { locale: th })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ระยะเจริญเติบโต:</span>
                    <span>{stage ?? "-"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">ความคืบหน้า:</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-slate-100">
                  คลิกเพื่อดูเป็นแปลงปัจจุบันบนแดชบอร์ด
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
