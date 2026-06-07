import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Leaf, Sprout, MessageCircle, BookOpen, Bot, CalendarDays, BarChart2, UserPlus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { apiFetch } from "../lib/api";
import { useVarieties } from "../lib/useVarieties";
import { ChatMessageList } from "../components/chat/ChatMessageList";
import { ChatPromptChips } from "../components/chat/ChatPromptChips";
import { ChatTextInput } from "../components/chat/ChatTextInput";
import type { ChatMessage } from "../components/chat/types";
import { buildChatHistory, sendChatMessage } from "../lib/chatApi";
import { EmptyState } from "../components/EmptyState";
import { DocumentCard } from "../components/DocumentCard";
import { isAuthenticated } from "../lib/auth";
import type { DocumentResponse, PromptTemplate, RiceVariety } from "../lib/types";

export default function Landing() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, text: "สวัสดีครับ! ถามคำถามเกี่ยวกับการปลูกข้าว โรคข้าว หรือการจัดการแปลงนาได้เลยครับ 🌾", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const { varieties: varietyRows } = useVarieties();
  const varieties = varietyRows as RiceVariety[];
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/app/plots", { replace: true });
    } else {
      apiFetch<DocumentResponse[]>("/documents/", {}, false).then(setDocuments).catch(() => {});
      apiFetch<PromptTemplate[]>("/prompts/", {}, false).then(setTemplates).catch(() => {});
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { id: prev.length, text: question, sender: "user" }]);
    setInput("");
    setIsLoading(true);
    try {
      const history = buildChatHistory(messages);
      const data = await sendChatMessage({ question, history, authenticated: false });
      setMessages((prev) => [...prev, { id: prev.length, text: data.answer, sender: "bot" }]);
    } catch {
      setMessages((prev) => [...prev, { id: prev.length, text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold">Rice Expert</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              เข้าสู่ระบบ
            </button>
            <Button
              onClick={() => navigate("/register")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5"
              size="sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              สมัครสมาชิก
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-semibold mb-2">ระบบผู้เชี่ยวชาญการปลูกข้าว</h1>
          <p className="text-muted-foreground text-sm mb-6">
            ใช้ AI ช่วยตอบคำถามเรื่องข้าวได้ทันที หรือเข้าสู่ระบบเพื่อวางแผนและติดตามแปลงนาของคุณ
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {[
              { icon: Bot, label: "ถาม-ตอบด้วย AI", desc: "ถามเรื่องโรค ปุ๋ย การดูแลข้าวได้ทันที" },
              { icon: CalendarDays, label: "วางแผนการปลูก", desc: "สร้างแผนงานและปฏิทินดูแลแปลงนา" },
              { icon: BarChart2, label: "ติดตามแปลงนา", desc: "ดูความคืบหน้าและงานที่ต้องทำ" },
              { icon: BookOpen, label: "คลังความรู้", desc: "เอกสารวิชาการข้าวพร้อมอ้างอิง" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Varieties */}
      {varieties.length > 0 && (
        <div className="bg-slate-50/60 border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <p className="text-sm font-medium text-foreground mb-3">พันธุ์ข้าวที่รองรับ</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {varieties.map((v) => (
                <div key={v.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-border">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{v.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.is_photoperiod_sensitive ? "ไวแสง" : `${v.harvest_age_days} วัน`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-6 flex gap-2">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === "chat" ? "bg-primary text-white" : "bg-white border border-border text-foreground hover:bg-accent"}`}
        >
          <MessageCircle className="w-4 h-4" />
          ถามผู้เชี่ยวชาญ AI
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === "docs" ? "bg-primary text-white" : "bg-white border border-border text-foreground hover:bg-accent"}`}
        >
          <BookOpen className="w-4 h-4" />
          คลังความรู้ ({documents.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto w-full px-4 py-4 flex-1">
        {activeTab === "chat" ? (
          <Card className="rounded-xl shadow-sm flex flex-col h-[520px]">
            <ChatMessageList
              messages={messages}
              isLoading={isLoading}
              variant="landing"
              messagesEndRef={messagesEndRef}
            />

            {/* Prompt Templates */}
            {templates.length > 0 && messages.length <= 1 && (
              <ChatPromptChips templates={templates} onSelect={setInput} />
            )}

            <ChatTextInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={isLoading}
              footer={
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  <button onClick={() => navigate("/login")} className="text-primary hover:underline">
                    เข้าสู่ระบบ
                  </button>{" "}
                  เพื่อบันทึกประวัติการสนทนา วางแผนการปลูก และติดตามแปลงนา
                </p>
              }
            />
          </Card>
        ) : (
          <div>
            {documents.length === 0 ? (
              <EmptyState message="ยังไม่มีเอกสารในระบบ" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
