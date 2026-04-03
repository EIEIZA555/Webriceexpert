import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Sprout, SendHorizonal } from "lucide-react";
import { apiFetch } from "../lib/api";
import { isAuthenticated } from "../lib/auth";
import { usePlans } from "../contexts/PlansContext";
import { getCurrentStage } from "../lib/planGenerator";
import { buildRagContextPack } from "../lib/fixedPlan";

const formatTime = (date: Date) =>
  date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

const WELCOME_MESSAGE = {
  id: 0,
  text: "สวัสดีครับ! ผมเป็น AI ผู้ช่วยวิชาการข้าว ยินดีให้คำปรึกษาแบบใช้ได้จริง — ว่าควรทำวันไหน ทำอย่างไร ตามคู่มือครับ 🌾",
  sender: "bot" as const,
  timestamp: new Date(),
};

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  sources?: string[];
}

interface ChatResponse {
  answer: string;
  sources: string[];
}

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

interface PromptTemplate {
  id: string;
  title: string;
  content: string;
}

export function FloatingChat() {
  const { plan, getDaysSinceStart, getCurrentStageName } = usePlans();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    apiFetch<PromptTemplate[]>("/prompts/", {}, false)
      .then(setTemplates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen || historyLoaded || !isAuthenticated()) return;
    setHistoryLoaded(true);
    apiFetch<HistoryItem[]>("/chat/history", {}, true).then((history) => {
      if (history.length === 0) return;
      const loaded: ChatMessage[] = [WELCOME_MESSAGE];
      history.forEach((h, i) => {
        loaded.push({ id: i * 2 + 1, text: h.question, sender: "user", timestamp: new Date(h.created_at) });
        loaded.push({ id: i * 2 + 2, text: h.answer, sender: "bot", timestamp: new Date(h.created_at) });
      });
      setMessages(loaded);
    }).catch(() => {});
  }, [isOpen, historyLoaded]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const question = (() => {
      if (!plan) return inputMessage;

      const das = getDaysSinceStart();
      const stage = getCurrentStageName() ?? getCurrentStage(plan.varietyId, das) ?? "ไม่ระบุระยะ";
      const soil = plan.soilType ?? "ไม่ระบุชนิดดิน";

      // PRD: fixedPlanSnapshot + fertilizerRules + activePlotId ในแพ็กเก็ตเดียว (ส่งเป็นข้อความ — API เดิมไม่เปลี่ยน)
      const pack = buildRagContextPack(plan, das);
      const contextPrefix =
        `${pack}\n` +
        `สรุปย่อสำหรับอ่านเร็ว: ${plan.plotName ?? "แปลง"} | ${plan.varietyName} | DAS ${das} | ระยะหลัก: ${stage} | ดิน: ${soil}\n` +
        `คำสั่ง: กรุณา “อธิบายเฉพาะข้อมูลตามแต่ละระยะ” หรือ “ตอบโดยอ้างอิงจากเอกสาร PDF ในคู่มือ (RAG)” เท่านั้น ` +
        `ห้ามคิด/แนะนำการวางแผนใหม่หรือปรับไทม์ไลน์จากเดิม\n` +
        `รูปแบบคำตอบ: เน้นใช้ได้จริง — ระบุว่าควรทำวันไหน (อ้าง DAS/วันที่จากบริบท) และทำอย่างไรสั้น ๆ ตามคู่มือ ไม่ใช่ทฤษฎีอย่างเดียว\n\n` +
        `คำถาม: `;

      return contextPrefix + inputMessage;
    })();

    const userMessage = {
      id: messages.length + 1,
      text: question,
      sender: "user" as const,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setHasSentMessage(true);
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 0)
        .slice(-6)
        .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
      const data = await apiFetch<ChatResponse>("/chat/", {
        method: "POST",
        body: JSON.stringify({ question, history }),
      }, true);

      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        text: data.answer,
        sender: "bot" as const,
        timestamp: new Date(),
        sources: data.sources.length > 0 ? data.sources : undefined,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        text: "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อระบบ กรุณาลองใหม่อีกครั้ง",
        sender: "bot" as const,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 ring-4 ring-white/50"
          aria-label="เปิดแชท"
        >
          <MessageCircle size={22} className="sm:w-[26px] sm:h-[26px]" strokeWidth={2} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] w-full h-full sm:max-h-[85vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border-0 sm:border border-primary/20">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sprout size={22} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base truncate">AI ผู้ช่วยวิชาการข้าว</h3>
                <p className="text-xs text-white/80 truncate">พร้อมให้คำปรึกษาจากคู่มือกรมการข้าว</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0"
              aria-label="ปิดแชท"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1.5">
                <div className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Sprout size={16} className="text-emerald-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-tr-md"
                        : "bg-white text-gray-800 rounded-tl-md border border-slate-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[11px] mt-2 ${msg.sender === "user" ? "text-emerald-100/90" : "text-slate-400"}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
                {msg.sender === "bot" && msg.sources && msg.sources.length > 0 && (
                  <div className="ml-10 max-w-[82%]">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                      <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        แหล่งอ้างอิงเอกสาร
                      </p>
                      <ul className="space-y-1 list-none">
                        {msg.sources.map((s, i) => (
                          <li key={i} className="text-xs text-slate-700 flex gap-2 items-start">
                            <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                            <span className="text-slate-500">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Sprout size={16} className="text-emerald-600" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Templates */}
          {templates.length > 0 && !hasSentMessage && (
            <div className="shrink-0 px-4 pt-3 pb-0 bg-white border-t border-slate-100 flex gap-2 flex-wrap">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInputMessage(t.content)}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 p-4 pt-3 bg-white border-t border-slate-100">
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="พิมพ์คำถามเกี่ยวกับโรคข้าว..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputMessage.trim() || isLoading}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${
                  inputMessage.trim() && !isLoading
                    ? "bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
                aria-label="ส่งข้อความ"
              >
                {inputMessage.trim() ? (
                  <SendHorizonal size={18} strokeWidth={2} />
                ) : (
                  <MessageCircle size={18} strokeWidth={2} />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">กด Enter เพื่อส่ง</p>
          </div>
        </div>
      )}
    </>
  );
}
