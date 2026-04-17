import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Leaf, Sprout, MessageCircle, BookOpen, FileText, ExternalLink, Bot, CalendarDays, BarChart2, SendHorizonal, UserPlus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { apiFetch, API_BASE_URL } from "../lib/api";
import { isAuthenticated } from "../lib/auth";

interface Variety {
  id: string;
  name: string;
  collection_name: string;
  is_photoperiod_sensitive: boolean;
  harvest_age_days: number;
  supported_methods: string[];
}

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ChatResponse {
  answer: string;
  sources: string[];
}

interface DocumentResponse {
  id: string;
  filename: string;
  file_type: string;
  created_at: string;
}

interface PromptTemplate {
  id: string;
  title: string;
  content: string;
}

export default function Landing() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, text: "สวัสดีครับ! ถามคำถามเกี่ยวกับการปลูกข้าว โรคข้าว หรือการจัดการแปลงนาได้เลยครับ 🌾", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/app/plots", { replace: true });
    } else {
      apiFetch<DocumentResponse[]>("/documents/", {}, false).then(setDocuments).catch(() => {});
      apiFetch<PromptTemplate[]>("/prompts/", {}, false).then(setTemplates).catch(() => {});
      apiFetch<Variety[]>("/varieties/", {}, false).then(setVarieties).catch(() => {});
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
      const history = messages
        .slice(-6)
        .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
      const data = await apiFetch<ChatResponse>("/chat/", {
        method: "POST",
        body: JSON.stringify({ question, history }),
      }, false);
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
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Sprout size={16} className="text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-md"
                      : "bg-gray-100 text-gray-800 rounded-tl-md"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Sprout size={16} className="text-primary" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Templates */}
            {templates.length > 0 && messages.length <= 1 && (
              <div className="px-4 pt-3 flex gap-2 flex-wrap border-t border-border">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setInput(t.content)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, window.innerHeight * 0.4) + "px";
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="พิมพ์คำถามเกี่ยวกับการปลูกข้าว... (Shift+Enter ขึ้นบรรทัดใหม่)"
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white transition-colors disabled:opacity-60 resize-none overflow-hidden leading-relaxed"
                  style={{ minHeight: "44px", maxHeight: "40vh" }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${
                    input.trim() && !isLoading
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg active:scale-95"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  aria-label="ส่งข้อความ"
                >
                  {input.trim() ? (
                    <SendHorizonal size={18} strokeWidth={2} />
                  ) : (
                    <MessageCircle size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                <button onClick={() => navigate("/login")} className="text-primary hover:underline">
                  เข้าสู่ระบบ
                </button>{" "}
                เพื่อบันทึกประวัติการสนทนา วางแผนการปลูก และติดตามแปลงนา
              </p>
            </div>
          </Card>
        ) : (
          <div>{documents.length === 0 ? (
            <Card className="p-8 rounded-xl shadow-sm text-center text-muted-foreground text-sm">
              ยังไม่มีเอกสารในระบบ
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <Card key={doc.id} className="p-4 rounded-xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
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
                    className="rounded-lg w-full"
                    onClick={() => window.open(`${API_BASE_URL}/documents/${doc.id}/file`, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    เปิดอ่าน
                  </Button>
                </Card>
              ))}
            </div>
          )}</div>
        )}
      </div>
    </div>
  );
}
