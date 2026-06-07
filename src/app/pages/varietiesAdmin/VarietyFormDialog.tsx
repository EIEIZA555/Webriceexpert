import { type RefObject } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { PLANTING_METHODS } from "../../lib/plantingMethod";
import type { Variety } from "./types";

interface VarietyFormDialogProps {
  open: boolean;
  editing: Variety | null;
  form: Partial<Variety>;
  error: string | null;
  fieldErrors: Record<string, string>;
  saving: boolean;
  scrollRef: RefObject<HTMLDivElement>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onFormChange: (patch: Partial<Variety>) => void;
  onToggleMethod: (key: string) => void;
  onClearFieldError: (key: string) => void;
  onSetNum: (key: keyof Variety, val: string) => void;
}

export function VarietyFormDialog({
  open,
  editing,
  form,
  error,
  fieldErrors,
  saving,
  scrollRef,
  onOpenChange,
  onSave,
  onFormChange,
  onToggleMethod,
  onClearFieldError,
  onSetNum,
}: VarietyFormDialogProps) {
  const num = (v: number | null | undefined) => (v == null ? "" : String(v));
  const errClass = (key: string) =>
    fieldErrors[key] ? "border-red-500 focus-visible:ring-red-500/30" : "";

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="text-xs text-red-500 mt-1">{fieldErrors[field]}</p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle>{editing ? "แก้ไขพันธุ์ข้าว" : "เพิ่มพันธุ์ข้าวใหม่"}</DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            {!editing && (
              <div>
                <Label>รหัสพันธุ์</Label>
                <Input
                  data-field="collection_name"
                  className={`mt-1 rounded-lg font-mono ${errClass("collection_name")}`}
                  placeholder="เช่น jasmine, rd43, kk15"
                  value={form.collection_name ?? ""}
                  onChange={(e) => {
                    onFormChange({ collection_name: e.target.value });
                    onClearFieldError("collection_name");
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ภาษาอังกฤษพิมพ์เล็ก ไม่มีช่องว่าง
                </p>
                <FieldError field="collection_name" />
              </div>
            )}
            <div className={!editing ? "" : "col-span-2"}>
              <Label>ชื่อพันธุ์ข้าว</Label>
              <Input
                data-field="name"
                className={`mt-1 rounded-lg ${errClass("name")}`}
                placeholder="เช่น ข้าวหอมมะลิ 105"
                value={form.name ?? ""}
                onChange={(e) => {
                  onFormChange({ name: e.target.value });
                  onClearFieldError("name");
                }}
              />
              <FieldError field="name" />
            </div>
            <div>
              <Label>ไวต่อช่วงแสง</Label>
              <select
                data-field="is_photoperiod_sensitive"
                className={`mt-1 w-full h-10 rounded-lg border bg-background px-3 text-sm ${fieldErrors.is_photoperiod_sensitive ? "border-red-500" : "border-input"}`}
                value={
                  form.is_photoperiod_sensitive === undefined
                    ? ""
                    : form.is_photoperiod_sensitive
                      ? "yes"
                      : "no"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  onFormChange({
                    is_photoperiod_sensitive: v === "" ? undefined : v === "yes",
                  });
                  onClearFieldError("is_photoperiod_sensitive");
                }}
              >
                {!editing && <option value="">เลือก…</option>}
                <option value="no">ไม่ไวต่อแสง</option>
                <option value="yes">ไวต่อแสง</option>
              </select>
              <FieldError field="is_photoperiod_sensitive" />
            </div>
            <div className={editing ? "" : "col-span-2"}>
              <Label>วิธีปลูกที่รองรับ</Label>
              <div data-field="supported_methods" className="flex gap-4 mt-2">
                {PLANTING_METHODS.map((m) => (
                  <label
                    key={m.key}
                    className="flex items-center gap-1.5 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      className="accent-emerald-600 w-4 h-4 cursor-pointer"
                      checked={form.supported_methods?.includes(m.key) ?? false}
                      onChange={() => onToggleMethod(m.key)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
              <FieldError field="supported_methods" />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">ระยะการเจริญเติบโต (วันนับจากวันปลูก)</p>
            <p className="text-xs text-muted-foreground mb-3">
              ระบบใช้วันแตกกอสำหรับคำนวณปุ๋ยช่วงแตกกอ, วันกำเนิดช่อดอกสำหรับปุ๋ยช่วงกำเนิดช่อดอก
              วันตั้งท้อง/ออกรวงสำหรับช่วงออกรวง และอายุเก็บเกี่ยวสำหรับคำนวณวันเก็บเกี่ยว
              โดยทุกค่าต้องเรียงลำดับก่อนหลังตามระยะจริง
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  ["harvest_age_days", "อายุเก็บเกี่ยว (วัน)", "เช่น 120"],
                  ["tillering_day", "วันแตกกอ", "เช่น 20"],
                  ["panicle_initiation_day", "วันกำเนิดช่อดอก", "เช่น 50"],
                  ["heading_day", "วันตั้งท้องและออกรวง", "เช่น 75"],
                ] as const
              ).map(([key, label, placeholder]) => (
                <div key={key}>
                  <Label className="text-xs">{label}</Label>
                  <Input
                    data-field={key}
                    type="number"
                    min={key === "harvest_age_days" ? 1 : 0}
                    className={`mt-1 rounded-lg ${errClass(key)}`}
                    placeholder={placeholder}
                    value={num(form[key])}
                    onChange={(e) => onSetNum(key, e.target.value)}
                  />
                  <FieldError field={key} />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium">ปุ๋ย</p>
            <p className="text-xs text-muted-foreground">
              กรอกอัตราเป็นกิโลกรัมต่อไร่ ระบบจะคำนวณปริมาณรวมตามพื้นที่และชนิดดิน
              โดยสูตรปุ๋ยช่วงแตกกอจะเลือกจากชนิดดิน ส่วนสูตรปุ๋ยช่วงกำเนิดช่อดอกใช้ค่าที่กรอกในหน้านี้
            </p>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                ปุ๋ยช่วงแตกกอ
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">อัตรา (กก./ไร่)</Label>
                  <Input
                    data-field="fert1_rate"
                    type="number"
                    min={0}
                    className={`mt-1 rounded-lg bg-white ${errClass("fert1_rate")}`}
                    placeholder="เช่น 30"
                    value={num(form.fert1_rate)}
                    onChange={(e) => onSetNum("fert1_rate", e.target.value)}
                  />
                  <FieldError field="fert1_rate" />
                </div>
                <div>
                  <Label className="text-xs">สูตรปุ๋ยอัตโนมัติตามดิน</Label>
                  <div className="mt-1 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-600 leading-relaxed">
                    ดินเหนียว: 16-20-0 · ดินร่วน/ดินทราย: 16-16-8
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs">หมายเหตุ</Label>
                <Input
                  className="mt-1 rounded-lg bg-white"
                  placeholder="เช่น ใส่หลังปักดำ 20 วัน"
                  value={form.fert1_note ?? ""}
                  onChange={(e) => onFormChange({ fert1_note: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                ปุ๋ยช่วงกำเนิดช่อดอก
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">อัตรา (กก./ไร่)</Label>
                  <Input
                    data-field="fert2_rate"
                    type="number"
                    min={0}
                    className={`mt-1 rounded-lg bg-white ${errClass("fert2_rate")}`}
                    placeholder="เช่น 12"
                    value={num(form.fert2_rate)}
                    onChange={(e) => onSetNum("fert2_rate", e.target.value)}
                  />
                  <FieldError field="fert2_rate" />
                </div>
                <div>
                  <Label className="text-xs">สูตรปุ๋ย</Label>
                  <Input
                    data-field="fert2_formula"
                    className={`mt-1 rounded-lg bg-white ${errClass("fert2_formula")}`}
                    placeholder="46-0-0"
                    value={form.fert2_formula ?? ""}
                    onChange={(e) => {
                      onFormChange({ fert2_formula: e.target.value });
                      onClearFieldError("fert2_formula");
                    }}
                  />
                  <FieldError field="fert2_formula" />
                </div>
              </div>
              <div>
                <Label className="text-xs">หมายเหตุ</Label>
                <Input
                  className="mt-1 rounded-lg bg-white"
                  placeholder="เช่น ใส่ช่วงกำเนิดช่อดอก"
                  value={form.fert2_note ?? ""}
                  onChange={(e) => onFormChange({ fert2_note: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div>
              <Label className="text-xs">คำอธิบาย (ไม่บังคับ)</Label>
              <Input
                className="mt-1 rounded-lg"
                placeholder="เช่น ลักษณะเด่น การปลูกที่เหมาะ"
                value={form.description ?? ""}
                onChange={(e) => onFormChange({ description: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">URL อ้างอิง (ไม่บังคับ)</Label>
              <Input
                className="mt-1 rounded-lg"
                placeholder="https://…"
                value={form.reference_url ?? ""}
                onChange={(e) => onFormChange({ reference_url: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            ปิด
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={onSave} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
