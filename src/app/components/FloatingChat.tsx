import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Sprout,
  FlaskConical,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { isAuthenticated } from "../lib/auth";
import { usePlans } from "../contexts/PlansContext";
import { buildChatHistory, sendChatMessage } from "../lib/chatApi";
import { buildPlanChatContext } from "../lib/planChatContext";
import { ChatMessageList } from "./chat/ChatMessageList";
import { ChatPromptChips } from "./chat/ChatPromptChips";
import { ChatTextInput } from "./chat/ChatTextInput";
import type { ChatMessage } from "./chat/types";
import type { PromptTemplate } from "../lib/types";

const WELCOME_MESSAGE = {
  id: 0,
  text: "สวัสดีครับ! ผมเป็น AI ผู้ช่วยวิชาการข้าว ยินดีให้คำปรึกษาแบบใช้ได้จริง — ว่าควรทำวันไหน ทำอย่างไร ตามคู่มือครับ 🌾",
  sender: "bot" as const,
  timestamp: new Date(),
};

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

/** ดึงเฉพาะคำถามที่ผู้ใช้พิมพ์จากข้อความที่เก็บใน DB (ตัด CONTEXT_PACK ออก) */
function toDisplayUserQuestion(storedQuestion: string): string {
  const marker = "คำถาม: ";
  const idx = storedQuestion.lastIndexOf(marker);
  if (idx !== -1) {
    return storedQuestion.slice(idx + marker.length).trim();
  }
  return storedQuestion.trim();
}

export function FloatingChat() {
  const { plan, getDaysSinceStart, getCurrentStageName, getUpcomingTasks } =
    usePlans();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [noRagMode, setNoRagMode] = useState(false);
  const headerClickCount = useRef(0);
  const headerClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleHeaderTripleClick = () => {
    headerClickCount.current += 1;
    if (headerClickTimer.current) clearTimeout(headerClickTimer.current);
    headerClickTimer.current = setTimeout(() => {
      headerClickCount.current = 0;
    }, 600);
    if (headerClickCount.current >= 3) {
      headerClickCount.current = 0;
      setNoRagMode((prev) => !prev);
    }
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
    apiFetch<HistoryItem[]>("/chat/history", {}, true)
      .then((history) => {
        if (history.length === 0) return;
        const loaded: ChatMessage[] = [WELCOME_MESSAGE];
        history.forEach((h, i) => {
          const displayQ = toDisplayUserQuestion(h.question);
          const hasPack = h.question.includes("---CONTEXT_PACK");
          loaded.push({
            id: i * 2 + 1,
            text: displayQ,
            sender: "user",
            timestamp: new Date(h.created_at),
            ...(hasPack ? { apiPayload: h.question } : {}),
          });
          loaded.push({
            id: i * 2 + 2,
            text: h.answer,
            sender: "bot",
            timestamp: new Date(h.created_at),
          });
        });
        setMessages(loaded);
      })
      .catch(() => {});
  }, [isOpen, historyLoaded]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const planContext = plan
      ? buildPlanChatContext(plan, {
          getDaysSinceStart,
          getCurrentStageName,
          getUpcomingTasks,
        })
      : undefined;

    const question = inputMessage.trim();

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: question,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setHasSentMessage(true);
    setIsLoading(true);

    try {
      const history = buildChatHistory(messages, {
        skipWelcomeId: 0,
        useApiPayload: true,
      });
      const data = await sendChatMessage({
        question,
        history,
        authenticated: true,
        planContext,
        collection: plan?.varietyId ?? null,
        noRag: noRagMode,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: data.answer,
          sender: "bot" as const,
          timestamp: new Date(),
          sources: data.sources.length > 0 ? data.sources : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อระบบ กรุณาลองใหม่อีกครั้ง",
          sender: "bot" as const,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
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
          <MessageCircle
            size={22}
            className="sm:w-[26px] sm:h-[26px]"
            strokeWidth={2}
          />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[480px] sm:h-[640px] w-full h-full sm:max-h-[88vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border-0 sm:border border-primary/20">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div
              className="flex items-center gap-3 min-w-0 cursor-default select-none"
              onClick={handleHeaderTripleClick}
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {noRagMode ? (
                  <FlaskConical size={22} strokeWidth={2} />
                ) : (
                  <Sprout size={22} strokeWidth={2} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base truncate">
                    AI ผู้ช่วยวิชาการข้าว
                  </h3>
                  {noRagMode && (
                    <span className="text-[10px] font-semibold bg-amber-400/30 text-amber-100 border border-amber-300/40 px-1.5 py-0.5 rounded-full shrink-0">
                      No-RAG
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/80 truncate">
                  {noRagMode
                    ? "โหมดทดสอบ — ไม่ใช้เอกสารอ้างอิง"
                    : "พร้อมให้คำปรึกษาจากคู่มือกรมการข้าว"}
                </p>
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

          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            variant="floating"
            messagesEndRef={messagesEndRef}
          />

          {/* Prompt Templates */}
          {templates.length > 0 && !hasSentMessage && (
            <ChatPromptChips
              templates={templates}
              onSelect={setInputMessage}
            />
          )}

          <ChatTextInput
            value={inputMessage}
            onChange={setInputMessage}
            onSend={handleSend}
            disabled={isLoading}
            footer={
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Enter ส่ง • Shift+Enter ขึ้นบรรทัดใหม่
              </p>
            }
          />
        </div>
      )}
    </>
  );
}
