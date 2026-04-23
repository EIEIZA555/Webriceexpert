import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  ExternalLink,
  MessageSquare,
  Plus,
  Sparkles,
  Sprout,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { apiFetch, API_BASE_URL, getAuthToken, fetchDocsAndCollections, type DocumentResponse, type CollectionItem } from "../lib/api";
import VarietiesAdminPanel from "./VarietiesAdminPanel";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { EmptyState } from "../components/EmptyState";

type Tab = "users" | "docs" | "prompts" | "varieties" | "gaps";

interface UserResponse {
  id: string;
  username: string;
  role: string;
}

interface FaqItem {
  question: string;
  count: number;
}

interface GapItem {
  question: string;
  count: number;
  last_asked_at: string | null;
}

interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface PromptSuggestion {
  title: string;
  content: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("users");

  // --- Users state ---
  const [usersList, setUsersList] = useState<UserResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);

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
  const [generating, setGenerating] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<PromptSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [suggestionsDialogOpen, setSuggestionsDialogOpen] = useState(false);
  const [savingGenerated, setSavingGenerated] = useState(false);

  // --- Gaps state ---
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [gapsLoading, setGapsLoading] = useState(false);
  const [gapsLoaded, setGapsLoaded] = useState(false);

  const refreshDocumentCollections = useCallback(() => {
    apiFetch<CollectionItem[]>("/documents/collections", {}, false)
      .then(setCollections)
      .catch(() => {});
  }, []);

  // fetch docs + collections on mount
  useEffect(() => {
    fetchDocsAndCollections()
      .then(({ documents, collections }) => {
        setDocuments(documents);
        setCollections(collections);
      })
      .catch((e) => setDocsError((e as Error).message))
      .finally(() => setDocsLoading(false));
  }, []);

  // รายการ collection มาจากพันธุ์ใน DB — รีเฟรชทุกครั้งที่เปิดแท็บเอกสาร (หลังเพิ่มพันธุ์ในแท็บอื่น)
  useEffect(() => {
    if (activeTab === "docs") refreshDocumentCollections();
  }, [activeTab, refreshDocumentCollections]);

  // fetch Users on tab switch
  useEffect(() => {
    if (activeTab === "users" && !usersLoaded) {
      setUsersLoading(true);
      apiFetch<UserResponse[]>("/admin/users", {}, true)
        .then(setUsersList)
        .catch(() => { })
        .finally(() => {
          setUsersLoading(false);
          setUsersLoaded(true);
        });
    }
  }, [activeTab, usersLoaded]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const updatedUser = await apiFetch<UserResponse>(
        `/admin/users/${userId}/role`,
        {
          method: "PUT",
          body: JSON.stringify({ role: newRole }),
        },
        true
      );
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? updatedUser : u))
      );
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // fetch knowledge gaps on gaps tab switch
  useEffect(() => {
    if (activeTab === "gaps" && !gapsLoaded) {
      setGapsLoading(true);
      apiFetch<GapItem[]>("/admin/gaps", {}, true)
        .then(setGaps)
        .catch(() => {})
        .finally(() => {
          setGapsLoading(false);
          setGapsLoaded(true);
        });
    }
  }, [activeTab, gapsLoaded]);

  // fetch prompts + FAQ on prompts tab switch
  useEffect(() => {
    if (activeTab !== "prompts") return;
    if (!promptsLoaded) {
      setPromptsLoading(true);
      apiFetch<PromptTemplate[]>("/prompts/", {}, false)
        .then(setPrompts)
        .catch(() => { })
        .finally(() => {
          setPromptsLoading(false);
          setPromptsLoaded(true);
        });
    }
    if (!faqLoaded) {
      setFaqLoading(true);
      apiFetch<FaqItem[]>("/admin/faq", {}, true)
        .then(setFaq)
        .catch(() => { })
        .finally(() => {
          setFaqLoading(false);
          setFaqLoaded(true);
        });
    }
  }, [activeTab, promptsLoaded, faqLoaded]);

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
      const { documents: docs, collections: cols } = await fetchDocsAndCollections();
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

  const handleGenerateSuggestions = async () => {
    setGenerating(true);
    setPromptsError(null);
    try {
      const suggestions = await apiFetch<PromptSuggestion[]>(
        "/prompts/generate",
        { method: "POST" },
        true,
      );
      if (suggestions.length === 0) {
        throw new Error("AI ไม่ได้สร้างคำถามกลับมา กรุณาลองใหม่อีกครั้ง");
      }
      setGeneratedSuggestions(suggestions);
      setSelectedSuggestions(new Set(suggestions.map((_, index) => index)));
      setSuggestionsDialogOpen(true);
    } catch (e) {
      setPromptsError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const toggleGeneratedSuggestion = (index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSaveGeneratedSuggestions = async () => {
    const selected = generatedSuggestions.filter((_, index) => selectedSuggestions.has(index));
    if (selected.length === 0) return;

    setSavingGenerated(true);
    setPromptsError(null);
    try {
      const created: PromptTemplate[] = [];
      for (const s of selected) {
        const item = await apiFetch<PromptTemplate>(
          "/prompts/",
          {
            method: "POST",
            body: JSON.stringify({ title: s.title, content: s.content }),
          },
          true,
        );
        created.push(item);
      }
      setPrompts((prev) => [...prev, ...created]);
      setGeneratedSuggestions([]);
      setSelectedSuggestions(new Set());
      setSuggestionsDialogOpen(false);
    } catch (e) {
      setPromptsError((e as Error).message);
    } finally {
      setSavingGenerated(false);
    }
  };

  const handleUseFaqQuestion = (question: string) => {
    setNewTitle(question.slice(0, 60));
    setNewContent(question);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    { key: "users", label: "จัดการผู้ใช้งาน", icon: <Users className="w-4 h-4" /> },
    { key: "docs", label: "เอกสาร", icon: <FileText className="w-4 h-4" /> },
    { key: "prompts", label: "Prompt Templates", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "varieties", label: "พันธุ์ข้าว", icon: <Sprout className="w-4 h-4" /> },
    { key: "gaps", label: "ช่องว่างความรู้", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">จัดการระบบ</h2>
        <p className="text-sm text-muted-foreground mt-1">
          เอกสาร, คำถามที่พบบ่อย และ อื่นๆ
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === key
              ? "bg-primary text-white"
              : "bg-white border border-border text-foreground hover:bg-accent"
              }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <h3 className="font-medium">จัดการผู้ใช้งานระบบ ({usersList.length})</h3>

          {usersLoading ? (
            <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
          ) : usersList.length === 0 ? (
            <EmptyState message="ไม่มีข้อมูลผู้ใช้งาน" />
          ) : (
            <Card className="rounded-xl overflow-hidden shadow-sm border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                    <tr>
                      <th className="px-6 py-4 font-medium">ผู้ใช้งาน (Username)</th>
                      <th className="px-6 py-4 font-medium">ระดับสิทธิ์ (Role)</th>
                      <th className="px-6 py-4 font-medium min-w-[200px]">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700 font-medium">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full max-w-[150px] p-2"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "docs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="font-medium flex-1">เอกสารในระบบ ({documents.length})</h3>
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
            <DialogContent className="max-w-sm">
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
                  {collections.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label === c.value ? c.label : `${c.label} · ${c.value}`}
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
            <EmptyState message="ยังไม่มีเอกสารในระบบ" />
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
                              <DeleteConfirmDialog
                                title="ลบเอกสาร"
                                description={`ต้องการลบ "${doc.filename}" ใช่ไหม? การลบจะไม่สามารถกู้คืนได้`}
                                onConfirm={() => handleDeleteDoc(doc.id)}
                              />
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
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleAddPrompt}
                disabled={!newTitle.trim() || !newContent.trim() || saving}
                className="bg-primary hover:bg-primary/90 rounded-lg"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                {saving ? "กำลังบันทึก..." : "เพิ่ม Template"}
              </Button>
              <Button
                onClick={handleGenerateSuggestions}
                disabled={generating}
                variant="outline"
                className="rounded-lg"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {generating ? "กำลังสร้าง..." : "สร้างจาก AI"}
              </Button>
            </div>
          </Card>

          <Dialog
            open={suggestionsDialogOpen}
            onOpenChange={(open) => {
              if (!savingGenerated) setSuggestionsDialogOpen(open);
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>เลือกคำถามจาก AI ก่อนบันทึก</DialogTitle>
                <DialogDescription>
                  คำถามชุดนี้สร้างจากเอกสารใน ChromaDB ทุก collection ที่ backend โหลดไว้ เช่น general และ collection ของพันธุ์ข้าว
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
                {generatedSuggestions.map((suggestion, index) => {
                  const checked = selectedSuggestions.has(index);
                  return (
                    <div
                      key={`${suggestion.title}-${index}`}
                      onClick={() => toggleGeneratedSuggestion(index)}
                      className={`w-full text-left rounded-lg border p-4 transition-colors ${
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-border bg-white hover:bg-accent"
                      }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleGeneratedSuggestion(index);
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleGeneratedSuggestion(index)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{suggestion.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                            {suggestion.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSuggestionsDialogOpen(false)}
                  disabled={savingGenerated}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveGeneratedSuggestions}
                  disabled={savingGenerated || selectedSuggestions.size === 0}
                >
                  {savingGenerated
                    ? "กำลังบันทึก..."
                    : `บันทึก ${selectedSuggestions.size} Template`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* FAQ section (top questions from chat_history) */}
          <Card className="p-4 rounded-xl space-y-3">
            <h3 className="font-medium text-sm">
              คำถามที่ถามบ่อย ({faq.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              คลิกคำถามเพื่อใช้เป็น template ใหม่
            </p>
            {faqLoading ? (
              <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
            ) : faq.length === 0 ? (
              <EmptyState message="ยังไม่มีประวัติการสนทนา" />
            ) : (
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-white">
                {faq.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleUseFaqQuestion(item.question)}
                    className="w-full text-left flex items-baseline gap-4 px-5 py-3 hover:bg-accent transition-colors"
                  >
                    <span className="text-xs text-muted-foreground w-4 shrink-0">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm">{item.question}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.count} ครั้ง
                    </span>
                  </button>
                ))}
              </div>
            )}
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
            <EmptyState message="ยังไม่มี template" />
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
                    <DeleteConfirmDialog
                      title="ลบ Template"
                      description={`ต้องการลบ "${p.title}" ใช่ไหม? การลบจะไม่สามารถกู้คืนได้`}
                      onConfirm={() => handleDeletePrompt(p.id)}
                      triggerClassName="shrink-0"
                    />
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

      {activeTab === "varieties" && (
        <VarietiesAdminPanel
          onVarietiesMutated={refreshDocumentCollections}
        />
      )}

      {activeTab === "gaps" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">คำถามที่ AI ตอบไม่ได้ ({gaps.length})</h3>
            <p className="text-xs text-muted-foreground mt-1">
              คำถามที่ไม่มีเอกสารตรง หรือ AI ตอบว่า "ไม่ทราบ" —
              ใช้เป็นแนวทางว่าควรอัพโหลดเอกสารเรื่องอะไรเพิ่ม
            </p>
          </div>
          {gapsLoading ? (
            <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
          ) : gaps.length === 0 ? (
            <EmptyState message="ยังไม่มีช่องว่างความรู้ — AI ตอบได้ครบทุกคำถาม 🎉" />
          ) : (
            <Card className="rounded-xl overflow-hidden shadow-sm border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                    <tr>
                      <th className="px-6 py-4 font-medium w-10">#</th>
                      <th className="px-6 py-4 font-medium">คำถาม</th>
                      <th className="px-6 py-4 font-medium w-28 text-center">จำนวนครั้ง</th>
                      <th className="px-6 py-4 font-medium w-40">ถามล่าสุด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {gaps.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground">{i + 1}</td>
                        <td className="px-6 py-4 text-slate-900">{item.question}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                            {item.count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {item.last_asked_at?.slice(0, 10) ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
