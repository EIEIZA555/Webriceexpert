import { useEffect, useRef, useState } from "react";
import { BookOpen, FileText, Upload, Trash2, ExternalLink } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { isAdmin } from "../lib/auth";
import { apiFetch, API_BASE_URL, getAuthToken } from "../lib/api";

interface DocumentResponse {
  id: string;
  filename: string;
  file_type: string;
  chroma_collection: string;
  created_at: string;
}

export default function Knowledge() {
  const admin = isAdmin();
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const data = await apiFetch<DocumentResponse[]>("/documents/", {}, false);
      setDocuments(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { detail?: string }).detail ?? "อัพโหลดไม่สำเร็จ");
      }
      await fetchDocuments();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบเอกสารนี้ใช่ไหม?")) return;
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" }, true);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleView = (id: string) => {
    window.open(`${API_BASE_URL}/documents/${id}/file`, "_blank");
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl mb-1">คลังข้อมูลความรู้</h2>
          <p className="text-muted-foreground">
            เอกสารและความรู้เกี่ยวกับการปลูกข้าว — เปิดอ่านได้ทันที
          </p>
        </div>
        {admin && (
          <>
            <Button
              className="bg-primary hover:bg-primary/90 rounded-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-5 h-5 mr-2" />
              {uploading ? "กำลังอัพโหลด..." : "อัพโหลดเอกสาร"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <Card className="p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold">คลังความรู้</h3>
            <p className="text-sm text-muted-foreground">
              เอกสารเหล่านี้ถูกใช้เป็นแหล่งอ้างอิงของ AI ผู้ช่วยวิชาการข้าว — กดเปิดเพื่ออ่านเนื้อหาต้นฉบับได้เลย
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">เอกสารในระบบ ({documents.length})</h3>

        {loading ? (
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        ) : documents.length === 0 ? (
          <Card className="p-8 rounded-xl shadow-sm text-center text-muted-foreground">
            ยังไม่มีเอกสารในระบบ
          </Card>
        ) : (
          documents.map((doc) => (
            <Card
              key={doc.id}
              className="p-4 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {doc.file_type.toUpperCase()} • อัพโหลดเมื่อ {doc.created_at.slice(0, 10)}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => handleView(doc.id)}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  เปิดอ่าน
                </Button>
                {admin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-destructive hover:text-destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
