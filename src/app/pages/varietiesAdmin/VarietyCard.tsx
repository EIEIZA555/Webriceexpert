import { Pencil, Sprout } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { DeleteConfirmDialog } from "../../components/DeleteConfirmDialog";
import { PLANTING_METHODS } from "../../lib/plantingMethod";
import type { Variety } from "./types";

interface VarietyCardProps {
  variety: Variety;
  deleteStats: { doc_count: number } | null | undefined;
  onEdit: (variety: Variety) => void;
  onDeleteStatsOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function VarietyCard({
  variety: v,
  deleteStats,
  onEdit,
  onDeleteStatsOpen,
  onDelete,
}: VarietyCardProps) {
  return (
    <Card className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{v.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{v.collection_name}</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">
        {v.is_photoperiod_sensitive ? "ไวต่อแสง" : "ไม่ไวต่อแสง"} • {v.harvest_age_days} วัน
      </p>
      <p className="text-xs text-muted-foreground mb-2">
        วิธีปลูก:{" "}
        {v.supported_methods
          .map((m) => PLANTING_METHODS.find((pm) => pm.key === m)?.label ?? m)
          .join(", ")}
      </p>
      {(v.tillering_day || v.panicle_initiation_day || v.heading_day) && (
        <p className="text-xs text-muted-foreground mb-2">
          แตกกอ: {v.tillering_day ?? "-"} วัน • กำเนิดช่อดอก:{" "}
          {v.panicle_initiation_day ?? "-"} วัน • ตั้งท้องและออกรวง: {v.heading_day ?? "-"}{" "}
          วัน
        </p>
      )}
      {(v.fert1_rate || v.fert2_rate) && (
        <p className="text-xs text-muted-foreground mb-3">
          แตกกอ: {v.fert1_rate ?? "-"} กก./ไร่ • กำเนิดช่อดอก: {v.fert2_rate ?? "-"} กก./ไร่
        </p>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onEdit(v)}>
          <Pencil className="w-4 h-4 mr-1" />
          แก้ไข
        </Button>
        <DeleteConfirmDialog
          title={`ลบพันธุ์ ${v.name}?`}
          description={
            deleteStats == null
              ? "จะลบพันธุ์ข้าวและเอกสารที่เกี่ยวข้องทั้งหมดถาวร แผนที่สร้างไว้แล้วยังใช้งานได้ปกติ"
              : `จะลบเอกสาร ${deleteStats.doc_count} ไฟล์ และ ChromaDB collection ถาวร แผนที่สร้างไว้แล้วยังใช้งานได้ปกติ`
          }
          onOpenChange={(open) => {
            if (open) onDeleteStatsOpen(v.id);
          }}
          onConfirm={() => onDelete(v.id)}
        />
      </div>
    </Card>
  );
}
