import type { CollectionItem, DocumentResponse } from "../lib/api";
import { DocumentCard } from "./DocumentCard";

interface DocumentListByCollectionProps {
  documents: DocumentResponse[];
  collections: CollectionItem[];
  onDelete?: (id: string) => void;
}

export function DocumentListByCollection({
  documents,
  collections,
  onDelete,
}: DocumentListByCollectionProps) {
  const groups = [
    ...collections,
    { value: "__other__", label: "อื่นๆ" },
  ];

  return (
    <div className="space-y-6">
      {groups.map(({ value, label }) => {
        const knownValues = collections.map((c) => c.value);
        const group =
          value === "__other__"
            ? documents.filter((d) => !knownValues.includes(d.chroma_collection))
            : documents.filter((d) => d.chroma_collection === value);
        if (group.length === 0) return null;
        return (
          <div key={value}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              {label} ({group.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onDelete={onDelete} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
