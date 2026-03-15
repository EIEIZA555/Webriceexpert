import { Settings as SettingsIcon } from "lucide-react";
import { Card } from "../components/ui/card";

export default function Settings() {
  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">ตั้งค่า</h2>
        <p className="text-sm text-muted-foreground mt-1">จัดการบัญชีและการตั้งค่าแอป</p>
      </div>

      <div className="max-w-2xl space-y-4">
        <Card className="p-6 rounded-xl shadow-sm">
          <h3 className="font-medium mb-2">ข้อมูลบัญชี</h3>
          <p className="text-sm text-muted-foreground">
            ฟีเจอร์ตั้งค่ากำลังจะมาเร็วๆ นี้ คุณสามารถจัดการโปรไฟล์และการแจ้งเตือนได้ที่นี่
          </p>
        </Card>
        <Card className="p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Rice Expert</h3>
              <p className="text-sm text-muted-foreground">ระบบผู้เชี่ยวชาญการปลูกข้าว</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
