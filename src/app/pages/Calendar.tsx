import { CalendarDays } from "lucide-react";

export default function Calendar() {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl mb-1">ปฏิทิน</h2>
        <p className="text-muted-foreground">ปฏิทินการดูแลแปลงนาและกิจกรรม</p>
      </div>

      <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-border bg-white">
        <CalendarDays className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">ปฏิทิน</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          ฟีเจอร์ปฏิทินกำลังจะมาเร็วๆ นี้ คุณสามารถดูและจัดการกิจกรรมการปลูกข้าวได้ที่นี่
        </p>
      </div>
    </div>
  );
}
