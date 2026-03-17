import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { apiFetch, API_BASE_URL, getAuthToken } from "../lib/api";

type Tab = "docs" | "faq" | "prompts";

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

interface FaqItem {
  question: string;
  count: number;
}

interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const UPLOAD_COLLECTIONS: { value: string; label: string }[] = [
  { value: "jasmine", label: "ข้าวหอมมะลิ" },
  { value: "rd43", label: "ข้าว RD43" },
  { value: "kk15", label: "ข้าวกข 15" },
  { value: "pathumthani", label: "ข้าวปทุมธานี" },
  { value: "general", label: "ทั่วไป" },
];

function FaqTab({ faq, faqLoading }: { faq: FaqItem[]; faqLoading: boolean }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">คำถามที่ถามบ่อย</h3>
      {faqLoading ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      ) : faq.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการสนทนา</p>
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white">
          {faq.map((item, i) => (
            <div key={i} className="flex items-baseline gap-4 px-5 py-3">
              <span className="text-xs text-muted-foreground w-4 shrink-0">
                {i + 1}
              </span>
              <p className="flex-1 text-sm">{item.question}</p>
              <span className="text-xs text-muted-foreground shrink-0">
                {item.count} ครั้ง
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("docs");

  // --- Docs state ---
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("general");
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FAQ state ---
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqLoaded, setFaqLoaded] = useState(false);

  // --- Prompts state ---
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsLoaded, setPromptsLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [promptsError, setPromptsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // fetch docs + collections on mount
  useEffect(() => {
    Promise.all([
      apiFetch<DocumentResponse[]>("/documents/", {}, false),
      apiFetch<CollectionItem[]>("/documents/collections", {}, false),
    ])
      .then(([docs, cols]) => {
        setDocuments(docs);
        setCollections(cols);
      })
      .catch((e) => setDocsError((e as Error).message))
      .finally(() => setDocsLoading(false));
  }, []);

  // fetch FAQ on tab switch
  useEffect(() => {
    if (activeTab === "faq" && !faqLoaded) {
      setFaqLoading(true);
      apiFetch<FaqItem[]>("/admin/faq", {}, true)
        .then(setFaq)
        .catch(() => {})
        .finally(() => {
          setFaqLoading(false);
          setFaqLoaded(true);
        });
    }
  }, [activeTab, faqLoaded]);

  // fetch prompts on tab switch
  useEffect(() => {
    if (activeTab === "prompts" && !promptsLoaded) {
      setPromptsLoading(true);
      apiFetch<PromptTemplate[]>("/prompts/", {}, false)
        .then(setPrompts)
        .catch(() => {})
        .finally(() => {
          setPromptsLoading(false);
          setPromptsLoaded(true);
        });
    }
  }, [activeTab, promptsLoaded]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = e.target.files;
    setUploading(true);
    setDocsError(null);
    setUploadDialogOpen(false);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) formData.append("files", file);
      formData.append("collection", selectedCollection);
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { detail?: string }).detail ?? "อัพโหลดไม่สำเร็จ",
        );
      }
      const [docs, cols] = await Promise.all([
        apiFetch<DocumentResponse[]>("/documents/", {}, false),
        apiFetch<CollectionItem[]>("/documents/collections", {}, false),
      ]);
      setDocuments(docs);
      setCollections(cols);
    } catch (e) {
      setDocsError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" }, true);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setDocsError((e as Error).message);
    }
  };

  const handleAddPrompt = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    setPromptsError(null);
    try {
      const created = await apiFetch<PromptTemplate>(
        "/prompts/",
        {
          method: "POST",
          body: JSON.stringify({
            title: newTitle.trim(),
            content: newContent.trim(),
          }),
        },
        true,
      );
      setPrompts((prev) => [...prev, created]);
      setNewTitle("");
      setNewContent("");
    } catch (e) {
      setPromptsError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      await apiFetch(`/prompts/${id}`, { method: "DELETE" }, true);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setPromptsError((e as Error).message);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "docs",
      label: `เอกสาร (${documents.length})`,
      icon: <FileText className="w-4 h-4" />,
    },
    { key: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
    {
      key: "prompts",
      label: "Prompt Templates",
      icon: <MessageSquare className="w-4 h-4" />,
    },
  ];

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">จัดการระบบ</h2>
        <p className="text-sm text-muted-foreground mt-1">
          เอกสาร, คำถามที่พบบ่อย และ Prompt Templates
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === key
                ? "bg-primary text-white"
                : "bg-white border border-border text-foreground hover:bg-accent"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === "docs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="font-medium flex-1">เอกสารในระบบ</h3>
            <Button
              className="bg-primary hover:bg-primary/90 rounded-lg"
              onClick={() => {
                setSelectedCollection("general");
                setUploadDialogOpen(true);
              }}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "กำลังอัพโหลด..." : "อัพโหลด"}
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>อัพโหลดเอกสาร</DialogTitle>
              </DialogHeader>
              <div className="space-y-1.5 py-2">
                <label className="text-sm font-medium">หมวดหมู่เอกสาร</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {UPLOAD_COLLECTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                >
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

          {docsError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {docsError}
            </div>
          )}

          {docsLoading ? (
            <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
          ) : documents.length === 0 ? (
            <Card className="p-8 rounded-xl text-center text-muted-foreground text-sm">
              ยังไม่มีเอกสารในระบบ
            </Card>
          ) : (
            <div className="space-y-6">
              {[...collections, { value: "__other__", label: "อื่นๆ" }].map(
                ({ value, label }) => {
                  const knownValues = collections.map((c) => c.value);
                  const group =
                    value === "__other__"
                      ? documents.filter(
                          (d) => !knownValues.includes(d.chroma_collection),
                        )
                      : documents.filter((d) => d.chroma_collection === value);
                  if (group.length === 0) return null;
                  return (
                    <div key={value}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        {label} ({group.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.map((doc) => (
                          <Card
                            key={doc.id}
                            className="p-4 rounded-xl flex flex-row items-center gap-3 hover:shadow-md transition-shadow"
                          >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">
                                {doc.filename}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.file_type.toUpperCase()} •{" "}
                                {doc.created_at.slice(0, 10)}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() =>
                                  window.open(
                                    `${API_BASE_URL}/documents/${doc.id}/file`,
                                    "_blank",
                                  )
                                }
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                เปิดอ่าน
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      ลบเอกสาร
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ต้องการลบ "{doc.filename}" ใช่ไหม?
                                      การลบจะไม่สามารถกู้คืนได้
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      ยกเลิก
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() => handleDeleteDoc(doc.id)}
                                    >
                                      ลบ
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && <FaqTab faq={faq} faqLoading={faqLoading} />}

      {/* Prompt Templates Tab */}
      {activeTab === "prompts" && (
        <div className="space-y-4">
          {/* Add form */}
          <Card className="p-4 rounded-xl space-y-3">
            <h3 className="font-medium text-sm">เพิ่ม Template ใหม่</h3>
            <input
              type="text"
              placeholder="ชื่อ template"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <textarea
              placeholder="เนื้อหา prompt..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            {promptsError && (
              <p className="text-sm text-red-600">{promptsError}</p>
            )}
            <Button
              onClick={handleAddPrompt}
              disabled={!newTitle.trim() || !newContent.trim() || saving}
              className="bg-primary hover:bg-primary/90 rounded-lg"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              {saving ? "กำลังบันทึก..." : "เพิ่ม Template"}
            </Button>
          </Card>

          {/* List */}
          <div className="flex justify-between items-center">
            <h3 className="font-medium">
              Templates ทั้งหมด ({prompts.length})
            </h3>
          </div>
          {promptsLoading ? (
            <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
          ) : prompts.length === 0 ? (
            <Card className="p-8 rounded-xl text-center text-muted-foreground text-sm">
              ยังไม่มี template
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {prompts.map((p) => (
                <Card
                  key={p.id}
                  className="p-4 rounded-xl flex flex-col gap-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.created_at.slice(0, 10)}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ลบ Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            ต้องการลบ "{p.title}" ใช่ไหม?
                            การลบจะไม่สามารถกู้คืนได้
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDeletePrompt(p.id)}
                          >
                            ลบ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                    {p.content}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
