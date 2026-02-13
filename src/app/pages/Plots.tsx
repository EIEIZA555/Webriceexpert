import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Sprout, Plus } from "lucide-react";
import { plots } from "../lib/mockData";

export default function Plots() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl mb-1">แปลงนา</h2>
          <p className="text-muted-foreground">รายการแปลงนาทั้งหมดของคุณ</p>
        </div>
        <Button
          onClick={() => navigate("/create-plan")}
          className="bg-primary hover:bg-primary/90 rounded-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มแปลงนา
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {plots.map((plot) => (
          <Card
            key={plot.id}
            className="p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg">{plot.name}</h4>
                  <p className="text-sm text-muted-foreground">{plot.variety}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  plot.status === "ดีมาก"
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : "border-gray-500 text-gray-700 bg-gray-50"
                }
              >
                {plot.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">พื้นที่:</span>
                <span>{plot.area}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">วันที่ปลูก:</span>
                <span>{plot.plantDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ระยะเจริญเติบโต:</span>
                <span>{plot.stage}</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">ความคืบหน้า:</span>
                  <span>{plot.progress}%</span>
                </div>
                <Progress value={plot.progress} className="h-2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
