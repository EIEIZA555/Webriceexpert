import { MessageCircle, SendHorizonal } from "lucide-react";

interface ChatTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  footer?: React.ReactNode;
}

export function ChatTextInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "พิมพ์คำถามเกี่ยวกับการปลูกข้าว... (Shift+Enter ขึ้นบรรทัดใหม่)",
  footer,
}: ChatTextInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="flex gap-2 items-end">
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height =
              Math.min(e.target.scrollHeight, window.innerHeight * 0.4) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white transition-colors disabled:opacity-60 resize-none overflow-hidden leading-relaxed"
          style={{ minHeight: "44px", maxHeight: "40vh" }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${
            value.trim() && !disabled
              ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg active:scale-95"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          aria-label="ส่งข้อความ"
        >
          {value.trim() ? (
            <SendHorizonal size={18} strokeWidth={2} />
          ) : (
            <MessageCircle size={18} strokeWidth={2} />
          )}
        </button>
      </div>
      {footer}
    </div>
  );
}
