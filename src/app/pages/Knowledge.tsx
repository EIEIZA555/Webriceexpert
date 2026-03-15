import { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { apiFetch, API_BASE_URL } from "../lib/api";

interface DocumentResponse {
  id: string;
  filename: string;
  file_type: string;
  created_at: string;
}

export default function Knowledge() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DocumentResponse[]>("/documents/", {}, false)
      .then(setDocuments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">คลังความรู้</h2>
        <p className="text-sm text-muted-foreground mt-1">
          เอกสารและความรู้เกี่ยวกับการปลูกข้าว — ใช้เป็นแหล่งอ้างอิงของ AI ผู้ช่วย
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">เอกสารในระบบ ({documents.length})</h3>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        ) : documents.length === 0 ? (
          <Card className="p-8 rounded-xl text-center text-muted-foreground text-sm">
            ยังไม่มีเอกสารในระบบ
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4 rounded-xl flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">{doc.file_type.toUpperCase()} • {doc.created_at.slice(0, 10)}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg flex-1"
                  onClick={() => window.open(`${API_BASE_URL}/documents/${doc.id}/file`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />เปิดอ่าน
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
