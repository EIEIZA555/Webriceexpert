export function ChatLoadingDots({ variant = "light" }: { variant?: "light" | "white" }) {
  const dotClass = variant === "white" ? "bg-slate-300" : "bg-gray-400";
  return (
    <div className="flex gap-1 items-center h-5">
      <span className={`w-2 h-2 ${dotClass} rounded-full animate-bounce`} style={{ animationDelay: "0ms" }} />
      <span className={`w-2 h-2 ${dotClass} rounded-full animate-bounce`} style={{ animationDelay: "150ms" }} />
      <span className={`w-2 h-2 ${dotClass} rounded-full animate-bounce`} style={{ animationDelay: "300ms" }} />
    </div>
  );
}
