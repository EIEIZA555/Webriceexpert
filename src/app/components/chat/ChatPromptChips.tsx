interface Chip {
  id: string;
  title: string;
  content: string;
}

export function ChatPromptChips({
  templates,
  onSelect,
}: {
  templates: Chip[];
  onSelect: (content: string) => void;
}) {
  if (!templates.length) return null;
  return (
    <div className="px-4 pt-3 flex gap-2 flex-wrap border-t border-border">
      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.content)}
          className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          {t.title}
        </button>
      ))}
    </div>
  );
}
