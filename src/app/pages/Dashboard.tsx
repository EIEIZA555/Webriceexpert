import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Cloud,
  CloudRain,
  Droplets,
  Wind,
  Plus,
  Sprout,
} from "lucide-react";
import { plots, stats } from "../lib/mockData";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl mb-1">แดชบอร์ด</h2>
          <p className="text-muted-foreground">ภาพรวมการจัดการแปลงนา</p>
        </div>
        <Button
          onClick={() => navigate("/create-plan")}
          className="bg-primary hover:bg-primary/90 rounded-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          สร้างแผนใหม่
        </Button>
      </div>

      {/* Weather Widget */}
      <Card className="p-6 mb-6 rounded-xl shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg">สภาพอากาศวันนี้</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">กรุงเทพมหานคร</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl">32°C</span>
              <span className="text-muted-foreground">มีเมฆบางส่วน</span>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <CloudRain className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">ฝน</p>
              <p className="text-sm">20%</p>
            </div>
            <div className="text-center">
              <Droplets className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">ความชื้น</p>
              <p className="text-sm">65%</p>
            </div>
            <div className="text-center">
              <Wind className="w-6 h-6 text-gray-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">ลม</p>
              <p className="text-sm">12 km/h</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 rounded-xl shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl mb-2">{stat.value}</p>
            <div className={`inline-block px-2 py-1 rounded text-xs ${stat.color}`}>
              อัปเดตล่าสุด
            </div>
          </Card>
        ))}
      </div>

      {/* Rice Plots Grid */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg">แปลงนาทั้งหมด</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/plots")}
          className="text-primary"
        >
          ดูทั้งหมด
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {plots.slice(0, 2).map((plot) => (
          <Card
            key={plot.id}
            className="p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/plots")}
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
