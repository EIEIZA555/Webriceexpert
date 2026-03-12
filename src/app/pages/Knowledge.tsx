import { BookOpen, FileText, Upload } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { isAdmin } from "../lib/auth";

// Mock PDF list - จะเชื่อมกับ backend ในอนาคต
const mockPdfs = [
  { id: 1, title: "คู่มือการปลูกข้าว กรมการข้าว", filename: "rice-guide-2024.pdf", uploadedAt: "2026-01-10" },
  { id: 2, title: "การจัดการโรคข้าว", filename: "rice-disease.pdf", uploadedAt: "2026-01-15" },
  { id: 3, title: "แนวทางใช้ปุ๋ยในนาข้าว", filename: "fertilizer-guide.pdf", uploadedAt: "2026-02-01" },
];

export default function Knowledge() {
  const admin = isAdmin();

  return (
    <div className="p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl mb-1">คลังข้อมูลความรู้</h2>
          <p className="text-muted-foreground">
            เอกสารและความรู้ที่ใช้เป็นพื้นฐานให้ RAG Chatbot ตอบคำถามเกี่ยวกับการปลูกข้าว
          </p>
        </div>
        {admin && (
          <Button className="bg-primary hover:bg-primary/90 rounded-lg">
            <Upload className="w-5 h-5 mr-2" />
            อัพโหลด PDF
          </Button>
        )}
      </div>

      <Card className="p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold">คลังความรู้ PDF</h3>
            <p className="text-sm text-muted-foreground">
              เอกสารในคลังนี้จะถูกใช้เป็นแหล่งอ้างอิงสำหรับ AI ผู้ช่วยวิชาการข้าว ทั้งสำหรับผู้ที่ล็อกอินและผู้เยี่ยมชมทั่วไป
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">เอกสารในระบบ</h3>
        {mockPdfs.map((pdf) => (
          <Card key={pdf.id} className="p-4 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{pdf.title}</p>
              <p className="text-sm text-muted-foreground">{pdf.filename} • อัพโหลดเมื่อ {pdf.uploadedAt}</p>
            </div>
            {admin && (
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="rounded-lg">
                  ดู
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-destructive hover:text-destructive"
                >
                  ลบ
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {admin && (
        <p className="text-sm text-muted-foreground mt-4">
          ฟีเจอร์อัพโหลดและจัดการ PDF จะเชื่อมกับ backend ในอนาคต
        </p>
      )}
    </div>
  );
}
