import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Sprout, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { mockRagQuery } from "../lib/ragMock";

const formatTime = (date: Date) =>
  date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  latencyMs?: number;
  sources?: Array<{ title: string; page?: number; filename?: string }>;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "สวัสดีครับ! ผมคือ **Rice Guru** 🌾 AI ผู้ช่วยวิชาการข้าว ยินดีให้คำปรึกษาเกี่ยวกับการปลูกข้าว โรคข้าว การคำนวณปุ๋ย และการจัดการแปลงนา\n\nลองถาม เช่น \"ใบเหลืองทำยังไง\" หรือ \"สูตรคำนวณปุ๋ย\"",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const delayMs = 300 + Math.random() * 400;
      const { content, latencyMs, sources } = await mockRagQuery(
        inputMessage,
        delayMs
      );

      const botResponse: ChatMessage = {
        id: messages.length + 2,
        text: content,
        sender: "bot",
        timestamp: new Date(),
        latencyMs,
        sources: sources.map((s) => ({ ...s, filename: undefined })),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          text: "เกิดข้อผิดพลาดครับ กรุณาลองใหม่อีกครั้ง",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 ring-4 ring-white/50"
          aria-label="เปิดแชท Rice Guru"
        >
          <MessageCircle size={22} className="sm:w-[26px] sm:h-[26px]" strokeWidth={2} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] w-full h-full sm:max-h-[85vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border-0 sm:border border-emerald-200">
          {/* Header - Rice Guru */}
          <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sprout size={22} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base truncate">Rice Guru</h3>
                <p className="text-xs text-emerald-100/90 truncate">AI ผู้ช่วยวิชาการข้าว • RAG</p>
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
                        ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-tr-md"
                        : "bg-white text-gray-800 rounded-tl-md border border-slate-100"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0">
                        <ReactMarkdown
                          components={{
                            strong: ({ children }) => <strong className="font-semibold text-emerald-900">{children}</strong>,
                            p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                    <p className={`text-[11px] mt-2 ${msg.sender === "user" ? "text-emerald-100/90" : "text-slate-400"}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                    {msg.sender === "bot" && msg.latencyMs != null && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px] text-slate-500">
                          Response generated in <strong className="text-emerald-600">{msg.latencyMs}ms</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {msg.sender === "bot" && msg.sources && msg.sources.length > 0 && (
                  <div className="ml-10 max-w-[82%]">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                      <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        แหล่งอ้างอิง
                      </p>
                      <ul className="space-y-2 list-none">
                        {msg.sources.map((s, i) => (
                          <li key={i} className="text-xs text-slate-700 flex gap-2 items-start">
                            <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                            <span className="font-medium text-slate-800">{s.title}</span>
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
                  <Sprout size={16} className="text-emerald-600 animate-pulse" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-white border border-slate-100 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 p-4 pt-3 bg-white border-t border-slate-100">
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="พิมพ์คำถาม... เช่น ใบเหลืองทำยังไง"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputMessage.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="ส่งข้อความ"
              >
                <MessageCircle size={20} strokeWidth={2} />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">กด Enter เพื่อส่ง</p>
          </div>
        </div>
      )}
    </>
  );
}
