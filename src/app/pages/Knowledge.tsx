import { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { apiFetch, API_BASE_URL } from "../lib/api";

interface DocumentResponse {
  id: string;
  filename: string;
  file_type: string;
  chroma_collection: string;
  created_at: string;
}

interface CollectionItem {
  value: string;
  label: string;
}

export default function Knowledge() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<DocumentResponse[]>("/documents/", {}, false),
      apiFetch<CollectionItem[]>("/documents/collections", {}, false),
    ])
      .then(([docs, cols]) => { setDocuments(docs); setCollections(cols); })
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

      {loading ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      ) : documents.length === 0 ? (
        <Card className="p-8 rounded-xl text-center text-muted-foreground text-sm">
          ยังไม่มีเอกสารในระบบ
        </Card>
      ) : (
        <div className="space-y-6">
          {[
            ...collections,
            { value: "__other__", label: "อื่นๆ" },
          ].map(({ value, label }) => {
            const knownValues = collections.map((c) => c.value);
            const group = value === "__other__"
              ? documents.filter((d) => !knownValues.includes(d.chroma_collection))
              : documents.filter((d) => d.chroma_collection === value);
            if (group.length === 0) return null;
            return (
              <div key={value}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{label} ({group.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.map((doc) => (
                    <Card key={doc.id} className="p-4 rounded-xl flex flex-row items-center gap-3 hover:shadow-md transition-shadow">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">{doc.file_type.toUpperCase()} • {doc.created_at.slice(0, 10)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg shrink-0"
                        onClick={() => window.open(`${API_BASE_URL}/documents/${doc.id}/file`, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />เปิดอ่าน
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
