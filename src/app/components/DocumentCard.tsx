import { FileText, ExternalLink } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { API_BASE_URL, type DocumentResponse } from "../lib/api";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface DocumentCardProps {
  doc: DocumentResponse;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ doc, onDelete }: DocumentCardProps) {
  return (
    <Card className="p-4 rounded-xl flex flex-row items-center gap-3 hover:shadow-md transition-shadow">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm">{doc.filename}</p>
        <p className="text-xs text-muted-foreground">
          {doc.file_type.toUpperCase()} • {doc.created_at.slice(0, 10)}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() =>
            window.open(`${API_BASE_URL}/documents/${doc.id}/file`, "_blank")
          }
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          เปิดอ่าน
        </Button>
        {onDelete && (
          <DeleteConfirmDialog
            title="ลบเอกสาร"
            description={`ต้องการลบ "${doc.filename}" ใช่ไหม? การลบจะไม่สามารถกู้คืนได้`}
            onConfirm={() => onDelete(doc.id)}
          />
        )}
      </div>
    </Card>
  );
}
