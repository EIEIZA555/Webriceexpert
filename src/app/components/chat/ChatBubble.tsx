import { Sprout } from "lucide-react";

const formatTime = (date: Date) =>
  date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

interface ChatBubbleProps {
  message: {
    text: string;
    sender: "user" | "bot";
    timestamp?: Date;
    sources?: string[];
  };
  variant?: "landing" | "floating";
}

export function ChatBubble({ message, variant = "landing" }: ChatBubbleProps) {
  const isUser = message.sender === "user";
  const isFloating = variant === "floating";

  return (
    <div className="flex flex-col gap-1.5">
      <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <Sprout
              size={16}
              className={isFloating ? "text-emerald-600" : "text-primary"}
            />
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isFloating ? "max-w-[82%] shadow-sm" : "max-w-[80%] text-sm leading-relaxed"
          } ${
            isUser
              ? "bg-primary text-white rounded-tr-md"
              : isFloating
                ? "bg-white text-gray-800 rounded-tl-md border border-slate-100"
                : "bg-gray-100 text-gray-800 rounded-tl-md"
          }`}
        >
          <p className={`${isFloating ? "text-sm leading-relaxed" : ""} whitespace-pre-wrap`}>
            {message.text}
          </p>
          {isFloating && message.timestamp && (
            <p
              className={`text-[11px] mt-2 ${
                isUser ? "text-emerald-100/90" : "text-slate-400"
              }`}
            >
              {formatTime(message.timestamp)}
            </p>
          )}
        </div>
      </div>
      {!isUser && message.sources && message.sources.length > 0 && (
        <div className={isFloating ? "ml-10 max-w-[82%]" : "ml-10 max-w-[80%]"}>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-2">
              แหล่งอ้างอิงเอกสาร
            </p>
            <ul className="space-y-1 list-none">
              {message.sources.map((s, i) => (
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
  );
}
