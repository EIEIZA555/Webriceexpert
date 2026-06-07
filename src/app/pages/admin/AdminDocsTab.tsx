import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { EmptyState } from "../../components/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import { DocumentListByCollection } from "../../components/DocumentListByCollection";
import {
  apiFetch,
  fetchDocsAndCollections,
  getAuthToken,
  API_BASE_URL,
  type CollectionItem,
  type DocumentResponse,
} from "../../lib/api";
import { getErrorMessage } from "../../lib/getErrorMessage";

interface AdminDocsTabProps {
  collectionsVersion?: number;
}

export default function AdminDocsTab({ collectionsVersion = 0 }: AdminDocsTabProps) {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = () => {
    setLoading(true);
    fetchDocsAndCollections()
      .then(({ documents, collections }) => {
        setDocuments(documents);
        setCollections(collections);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {
    if (collectionsVersion === 0) return;
    apiFetch<CollectionItem[]>("/documents/collections", {}, false)
      .then(setCollections)
      .catch(() => {});
  }, [collectionsVersion]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    setError(null);
    setUploadDialogOpen(false);
    try {
      const formData = new FormData();
      for (const file of Array.from(e.target.files)) formData.append("files", file);
      formData.append("collection", selectedCollection);
      const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { detail?: string }).detail ?? "อัปโหลดไม่สำเร็จ");
      }
      const { documents: docs, collections: cols } = await fetchDocsAndCollections();
      setDocuments(docs);
      setCollections(cols);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" }, true);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="font-medium flex-1">เอกสาร ({documents.length})</h3>
        <Button
          className="bg-primary hover:bg-primary/90 rounded-lg"
          onClick={() => {
            setSelectedCollection("general");
            setUploadDialogOpen(true);
          }}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>อัปโหลดเอกสาร</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <label className="text-sm font-medium">หมวดหมู่เอกสาร</label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {collections.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label === c.value ? c.label : `${c.label} · ${c.value}`}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => fileInputRef.current?.click()}
            >
              เลือกไฟล์
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <LoadingScreen />
      ) : documents.length === 0 ? (
        <EmptyState message="ยังไม่มีเอกสารในระบบ" />
      ) : (
        <DocumentListByCollection
          documents={documents}
          collections={collections}
          onDelete={handleDeleteDoc}
        />
      )}
    </div>
  );
}
