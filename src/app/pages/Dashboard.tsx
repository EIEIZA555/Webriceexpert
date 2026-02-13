import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  LayoutDashboard,
  Sprout,
  Calendar,
  Settings,
  LogOut,
  Cloud,
  CloudRain,
  Droplets,
  Wind,
  Plus,
  Leaf,
} from "lucide-react";

// Mock data
const plots = [
  {
    id: 1,
    name: "แปลงนา A1",
    variety: "ข้าวหอมมะลิ",
    plantDate: "2026-01-15",
    stage: "ระยะแตกกอ",
    progress: 35,
    status: "ปกติ",
    area: "3 ไร่",
  },
  {
    id: 2,
    name: "แปลงนา A2",
    variety: "ข้าว RD43",
    plantDate: "2026-01-20",
    stage: "ระยะเจริญเติบโต",
    progress: 55,
    status: "ดีมาก",
    area: "2.5 ไร่",
  },
  {
    id: 3,
    name: "แปลงนา B1",
    variety: "ข้าวหอมมะลิ",
    plantDate: "2026-02-01",
    stage: "ระยะต้นกล้า",
    progress: 15,
    status: "ปกติ",
    area: "4 ไร่",
  },
  {
    id: 4,
    name: "แปลงนา B2",
    variety: "ข้าวกข 15",
    plantDate: "2025-12-10",
    stage: "ระยะออกดอก",
    progress: 75,
    status: "ดีมาก",
    area: "3.5 ไร่",
  },
];

const stats = [
  { label: "แปลงนาทั้งหมด", value: "4", color: "bg-emerald-100 text-emerald-700" },
  { label: "พื้นที่รวม", value: "13 ไร่", color: "bg-blue-100 text-blue-700" },
  { label: "แปลงพร้อมเก็บเกี่ยว", value: "1", color: "bg-amber-100 text-amber-700" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const handleLogout = () => {
    navigate("/");
  };

  const handleCreatePlan = () => {
    navigate("/create-plan");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-xl">Rice Expert</h1>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveMenu("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === "dashboard"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>แดชบอร์ด</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenu("plots")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === "plots"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Sprout className="w-5 h-5" />
                <span>แปลงนา</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenu("calendar")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === "calendar"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>ปฏิทิน</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenu("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === "settings"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>ตั้งค่า</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl mb-1">แดชบอร์ด</h2>
              <p className="text-muted-foreground">ภาพรวมการจัดการแปลงนา</p>
            </div>
            <Button onClick={handleCreatePlan} className="bg-primary hover:bg-primary/90 rounded-lg">
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
          <div className="mb-4">
            <h3 className="text-lg mb-4">แปลงนาทั้งหมด</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {plots.map((plot) => (
              <Card key={plot.id} className="p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
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
      </main>
    </div>
  );
}
