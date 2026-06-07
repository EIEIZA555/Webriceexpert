import { type RefObject } from "react";
import { Sprout } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import { ChatLoadingDots } from "./ChatLoadingDots";
import type { ChatMessage } from "./types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  variant?: "landing" | "floating";
  messagesEndRef?: RefObject<HTMLDivElement>;
}

export function ChatMessageList({
  messages,
  isLoading = false,
  variant = "landing",
  messagesEndRef,
}: ChatMessageListProps) {
  const isFloating = variant === "floating";

  return (
    <div
      className={
        isFloating
          ? "flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white space-y-5"
          : "flex-1 overflow-y-auto p-4 space-y-4"
      }
    >
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} variant={variant} />
      ))}
      {isLoading && (
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Sprout
              size={16}
              className={isFloating ? "text-emerald-600" : "text-primary"}
            />
          </div>
          <div
            className={`rounded-2xl rounded-tl-md px-4 py-3 ${
              isFloating
                ? "bg-white border border-slate-100 shadow-sm"
                : "bg-gray-100"
            }`}
          >
            <ChatLoadingDots variant={isFloating ? "white" : "light"} />
          </div>
        </div>
      )}
      {messagesEndRef && <div ref={messagesEndRef} />}
    </div>
  );
}
