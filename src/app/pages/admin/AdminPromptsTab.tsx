import { useEffect, useRef, useState } from "react";
import { MessageSquare, Plus, Sparkles } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Checkbox } from "../../components/ui/checkbox";
import { EmptyState } from "../../components/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import { DeleteConfirmDialog } from "../../components/DeleteConfirmDialog";
import { apiFetch } from "../../lib/api";
import { getErrorMessage } from "../../lib/getErrorMessage";
import type { FaqItem, PromptTemplate } from "../../lib/types";

interface PromptSuggestion {
  title: string;
  content: string;
}

export default function AdminPromptsTab() {
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<PromptSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [suggestionsDialogOpen, setSuggestionsDialogOpen] = useState(false);
  const [savingGenerated, setSavingGenerated] = useState(false);
  const generateDismissedRef = useRef(false);

  useEffect(() => {
    apiFetch<PromptTemplate[]>("/prompts/", {}, false)
      .then(setPrompts)
      .catch(() => {})
      .finally(() => setPromptsLoading(false));
    apiFetch<FaqItem[]>("/admin/faq", {}, true)
      .then(setFaq)
      .catch(() => {})
      .finally(() => setFaqLoading(false));
  }, []);

  const handleAddPrompt = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await apiFetch<PromptTemplate>(
        "/prompts/",
        {
          method: "POST",
          body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
        },
        true,
      );
      setPrompts((prev) => [...prev, created]);
      setNewTitle("");
      setNewContent("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    setGenerating(true);
    setError(null);
    setGeneratedSuggestions([]);
    setSelectedSuggestions(new Set());
    generateDismissedRef.current = false;
    setSuggestionsDialogOpen(true);
    try {
      const suggestions = await apiFetch<PromptSuggestion[]>(
        "/prompts/generate",
        { method: "POST" },
        true,
      );
      if (generateDismissedRef.current) return;
      if (suggestions.length === 0) {
        throw new Error("AI ไม่ได้สร้างคำถามกลับมา กรุณาลองใหม่อีกครั้ง");
      }
      setGeneratedSuggestions(suggestions);
      setSelectedSuggestions(new Set(suggestions.map((_, index) => index)));
    } catch (e) {
      if (generateDismissedRef.current) return;
      setSuggestionsDialogOpen(false);
      setError(getErrorMessage(e));
    } finally {
      setGenerating(false);
    }
  };

  const toggleGeneratedSuggestion = (index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSaveGeneratedSuggestions = async () => {
    const selected = generatedSuggestions.filter((_, index) =>
      selectedSuggestions.has(index),
    );
    if (!selected.length) return;
    setSavingGenerated(true);
    setError(null);
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
      setError(getErrorMessage(e));
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
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 rounded-xl space-y-3">
        <h3 className="font-medium text-sm">เพิ่มคำถามแนะนำ</h3>
        <input
          type="text"
          placeholder="ชื่อคำถาม"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <textarea
          placeholder="ข้อความคำถาม..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleAddPrompt}
            disabled={!newTitle.trim() || !newContent.trim() || saving}
            className="bg-primary hover:bg-primary/90 rounded-lg"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            {saving ? "กำลังบันทึก..." : "เพิ่มคำถาม"}
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
          if (!open && generating) generateDismissedRef.current = true;
          if (!savingGenerated) setSuggestionsDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          {generating ? (
            <div className="py-8">
              <DialogHeader className="sr-only">
                <DialogTitle>กำลังสร้างคำถามจาก AI</DialogTitle>
              </DialogHeader>
              <LoadingScreen />
              <p className="text-center text-sm text-muted-foreground">
                กำลังสร้างคำถามจาก AI...
              </p>
            </div>
          ) : (
            <>
          <DialogHeader>
            <DialogTitle>เลือกคำถามจาก AI ก่อนบันทึก</DialogTitle>
            <DialogDescription>
              คำถามชุดนี้สร้างจากเอกสารในคลังความรู้ทุกหมวด เช่น ความรู้ทั่วไปและเอกสารตามพันธุ์ข้าว
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
                    checked ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-accent"
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
                : `บันทึก ${selectedSuggestions.size} คำถาม`}
            </Button>
          </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card className="p-4 rounded-xl space-y-3">
        <h3 className="font-medium text-sm">คำถามที่ถามบ่อย ({faq.length})</h3>
        <p className="text-xs text-muted-foreground">
          คลิกคำถามเพื่อใช้เป็นคำถามแนะนำใหม่
        </p>
        {faqLoading ? (
          <LoadingScreen />
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
                <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                <p className="flex-1 text-sm">{item.question}</p>
                <span className="text-xs text-muted-foreground shrink-0">{item.count} ครั้ง</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <h3 className="font-medium">คำถามแนะนำทั้งหมด ({prompts.length})</h3>
      {promptsLoading ? (
        <LoadingScreen />
      ) : prompts.length === 0 ? (
        <EmptyState message="ยังไม่มีคำถามแนะนำ" />
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
                  <p className="text-xs text-muted-foreground">{p.created_at?.slice(0, 10) ?? "-"}</p>
                </div>
                <DeleteConfirmDialog
                  title="ลบคำถามแนะนำ"
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
  );
}
