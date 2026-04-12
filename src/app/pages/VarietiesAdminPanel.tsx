import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Sprout } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { apiFetch } from "../lib/api";

interface Variety {
  id: string;
  name: string;
  collection_name: string;
  harvest_age_days: number;
  is_photoperiod_sensitive: boolean;
  supported_methods: string[];
  description: string | null;
  reference_url: string | null;
  tillering_day: number | null;
  panicle_initiation_day: number | null;
  heading_day: number | null;
  fert1_rate_min: number | null;
  fert1_rate_max: number | null;
  fert2_rate_min: number | null;
  fert2_rate_max: number | null;
  fert1_formula: string | null;
  fert2_formula: string | null;
  fert1_note: string | null;
  fert2_note: string | null;
}

const METHODS = [
  { key: "transplant", label: "นาดำ" },
  { key: "broadcast", label: "นาหว่าน" },
  { key: "throw", label: "นาโยน" },
];

const emptyForm = (): Partial<Variety> => ({
  name: "",
  collection_name: "",
  harvest_age_days: undefined,
  is_photoperiod_sensitive: undefined,
  supported_methods: [],
  description: "",
  reference_url: "",
  tillering_day: undefined,
  panicle_initiation_day: undefined,
  heading_day: undefined,
  fert1_rate_min: undefined,
  fert1_rate_max: undefined,
  fert2_rate_min: undefined,
  fert2_rate_max: undefined,
  fert1_formula: "",
  fert2_formula: "",
  fert1_note: "",
  fert2_note: "",
});

export default function VarietiesAdminPanel({
  onCountChange,
  onVarietiesMutated,
}: {
  onCountChange?: (n: number) => void;
  /** เรียกเมื่อรายการพันธุ์เปลี่ยน (เพิ่ม/แก้/ลบ) เพื่อให้แท็บอื่น เช่น เอกสาร รีเฟรช collection จาก API */
  onVarietiesMutated?: () => void;
}) {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Variety | null>(null);
  const [form, setForm] = useState<Partial<Variety>>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = () => {
    apiFetch<Variety[]>("/varieties/", {}, false).then((data) => {
      setVarieties(data);
      onCountChange?.(data.length);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (v: Variety) => {
    setEditing(v);
    setForm({ ...v });
    setError(null);
    setDialogOpen(true);
    setTimeout(() => scrollRef.current?.scrollTo(0, 0), 50);
  };

  const toggleMethod = (key: string) => {
    const current = form.supported_methods ?? [];
    setForm((f) => ({
      ...f,
      supported_methods: current.includes(key)
        ? current.filter((m) => m !== key)
        : [...current, key],
    }));
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { setError("กรุณากรอกชื่อพันธุ์"); return; }
    if (!editing && !form.collection_name?.trim()) { setError("กรุณากรอกรหัสพันธุ์"); return; }
    if (form.harvest_age_days == null || Number(form.harvest_age_days) < 1) {
      setError("กรุณากรอกอายุเก็บเกี่ยว (วัน)");
      return;
    }
    if (form.is_photoperiod_sensitive === undefined) {
      setError("กรุณาเลือกว่าไวต่อช่วงแสงหรือไม่");
      return;
    }
    if (!form.supported_methods?.length) { setError("เลือกวิธีปลูกอย่างน้อย 1 แบบ"); return; }

    setSaving(true);
    setError(null);
    try {
      const body = {
        name: form.name,
        collection_name: form.collection_name,
        harvest_age_days: Number(form.harvest_age_days),
        is_photoperiod_sensitive: Boolean(form.is_photoperiod_sensitive),
        supported_methods: form.supported_methods,
        description: form.description || null,
        reference_url: form.reference_url || null,
        tillering_day: form.tillering_day ?? null,
        panicle_initiation_day: form.panicle_initiation_day ?? null,
        heading_day: form.heading_day ?? null,
        fert1_rate_min: form.fert1_rate_min ?? null,
        fert1_rate_max: form.fert1_rate_max ?? null,
        fert2_rate_min: form.fert2_rate_min ?? null,
        fert2_rate_max: form.fert2_rate_max ?? null,
        fert1_formula: form.fert1_formula || null,
        fert2_formula: form.fert2_formula || null,
        fert1_note: form.fert1_note || null,
        fert2_note: form.fert2_note || null,
      };

      if (editing) {
        await apiFetch(`/varieties/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }, true);
      } else {
        await apiFetch("/varieties/", { method: "POST", body: JSON.stringify(body) }, true);
      }
      load();
      onVarietiesMutated?.();
      setDialogOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/varieties/${id}`, { method: "DELETE" }, true);
      load();
      onVarietiesMutated?.();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const num = (v: number | null | undefined) => (v == null ? "" : String(v));
  const setNum = (key: keyof Variety, val: string) =>
    setForm((f) => ({ ...f, [key]: val === "" ? null : Number(val) }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h3 className="font-medium flex-1">พันธุ์ข้าว ({varieties.length})</h3>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มพันธุ์ข้าวใหม่
        </Button>
      </div>

      {varieties.length === 0 && (
        <Card className="p-8 rounded-xl text-center text-muted-foreground text-sm">
          ยังไม่มีพันธุ์ข้าวในระบบ
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {varieties.map((v) => (
          <Card key={v.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
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
              วิธีปลูก: {v.supported_methods.map((m) => METHODS.find((x) => x.key === m)?.label ?? m).join(", ")}
            </p>
            {(v.tillering_day || v.panicle_initiation_day || v.heading_day) && (
              <p className="text-xs text-muted-foreground mb-2">
                แตกกอ: {v.tillering_day ?? "-"} วัน • ตั้งท้อง: {v.panicle_initiation_day ?? "-"} วัน • ออกรวง: {v.heading_day ?? "-"} วัน
              </p>
            )}
            {(v.fert1_rate_min || v.fert2_rate_min) && (
              <p className="text-xs text-muted-foreground mb-3">
                ปุ๋ย 1: {v.fert1_rate_min ?? "-"}–{v.fert1_rate_max ?? "-"} กก./ไร่ •{" "}
                ปุ๋ย 2: {v.fert2_rate_min ?? "-"}–{v.fert2_rate_max ?? "-"} กก./ไร่
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openEdit(v)}>
                <Pencil className="w-4 h-4 mr-1" />แก้ไข
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-lg text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ลบพันธุ์ {v.name}?</AlertDialogTitle>
                    <AlertDialogDescription>การลบจะไม่สามารถกู้คืนได้</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(v.id)} className="bg-destructive text-destructive-foreground">
                      ลบ
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
            <DialogTitle>{editing ? "แก้ไขพันธุ์ข้าว" : "เพิ่มพันธุ์ข้าวใหม่"}</DialogTitle>
          </DialogHeader>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            {/* ข้อมูลพื้นฐาน */}
            <div className="grid grid-cols-2 gap-4">
              <div className={editing ? "col-span-2" : ""}>
                {!editing && (
                  <>
                    <Label>รหัสพันธุ์</Label>
                    <Input
                      className="mt-1 rounded-lg font-mono"
                      placeholder="เช่น jasmine, rd43, kk15"
                      value={form.collection_name ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, collection_name: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ไม่มีช่องว่าง ใช้สำหรับเชื่อมกับฐานความรู้</p>
                  </>
                )}
              </div>
              <div className="col-span-2">
                <Label>ชื่อพันธุ์ข้าว</Label>
                <Input
                  className="mt-1 rounded-lg"
                  placeholder="เช่น ข้าวหอมมะลิ 105"
                  value={form.name ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>อายุเก็บเกี่ยว (วัน)</Label>
                <Input
                  type="number"
                  min={1}
                  className="mt-1 rounded-lg"
                  placeholder="เช่น 120"
                  value={num(form.harvest_age_days)}
                  onChange={(e) => setNum("harvest_age_days", e.target.value)}
                />
              </div>
              <div>
                <Label>ไวต่อช่วงแสง</Label>
                <select
                  className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  value={
                    form.is_photoperiod_sensitive === undefined
                      ? ""
                      : form.is_photoperiod_sensitive
                        ? "yes"
                        : "no"
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({
                      ...f,
                      is_photoperiod_sensitive: v === "" ? undefined : v === "yes",
                    }));
                  }}
                >
                  {!editing && <option value="">เลือก…</option>}
                  <option value="no">ไม่ไวต่อแสง</option>
                  <option value="yes">ไวต่อแสง</option>
                </select>
              </div>
            </div>

            <div>
              <Label>วิธีปลูกที่รองรับ</Label>
              <div className="flex gap-4 mt-2">
                {METHODS.map((m) => (
                  <label key={m.key} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input type="checkbox"
                      className="accent-emerald-600 w-4 h-4 cursor-pointer"
                      checked={form.supported_methods?.includes(m.key) ?? false}
                      onChange={() => toggleMethod(m.key)} />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ระยะการเจริญเติบโต */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">ระยะการเจริญเติบโต (วันนับจากวันปลูก)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">วันแตกกอ</Label>
                  <Input type="number" min={0} className="mt-1 rounded-lg" placeholder="เช่น 20"
                    value={num(form.tillering_day)}
                    onChange={(e) => setNum("tillering_day", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">วันกำเนิดช่อดอก</Label>
                  <Input type="number" min={0} className="mt-1 rounded-lg" placeholder="เช่น 50"
                    value={num(form.panicle_initiation_day)}
                    onChange={(e) => setNum("panicle_initiation_day", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">วันออกรวง</Label>
                  <Input type="number" min={0} className="mt-1 rounded-lg" placeholder="เช่น 75"
                    value={num(form.heading_day)}
                    onChange={(e) => setNum("heading_day", e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">ถ้าไม่กรอก ระบบจะคำนวณอัตโนมัติจากอายุเก็บเกี่ยว</p>
            </div>

            {/* ปุ๋ย */}
            <div className="border-t pt-4 space-y-4">
              <p className="text-sm font-medium">ปุ๋ย</p>

              {/* ปุ๋ยครั้งที่ 1 */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">ปุ๋ยครั้งที่ 1</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">อัตราต่ำสุด (กก./ไร่)</Label>
                    <Input type="number" min={0} className="mt-1 rounded-lg bg-white" placeholder="เช่น 25"
                      value={num(form.fert1_rate_min)}
                      onChange={(e) => setNum("fert1_rate_min", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">อัตราสูงสุด (กก./ไร่)</Label>
                    <Input type="number" min={0} className="mt-1 rounded-lg bg-white" placeholder="เช่น 35"
                      value={num(form.fert1_rate_max)}
                      onChange={(e) => setNum("fert1_rate_max", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">สูตรปุ๋ย</Label>
                    <Input className="mt-1 rounded-lg bg-white" placeholder="16-20-0"
                      value={form.fert1_formula ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, fert1_formula: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">หมายเหตุ</Label>
                  <Input className="mt-1 rounded-lg bg-white" placeholder="เช่น ใส่หลังปักดำ 20 วัน"
                    value={form.fert1_note ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, fert1_note: e.target.value }))} />
                </div>
              </div>

              {/* ปุ๋ยครั้งที่ 2 */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">ปุ๋ยครั้งที่ 2</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">อัตราต่ำสุด (กก./ไร่)</Label>
                    <Input type="number" min={0} className="mt-1 rounded-lg bg-white" placeholder="เช่น 10"
                      value={num(form.fert2_rate_min)}
                      onChange={(e) => setNum("fert2_rate_min", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">อัตราสูงสุด (กก./ไร่)</Label>
                    <Input type="number" min={0} className="mt-1 rounded-lg bg-white" placeholder="เช่น 15"
                      value={num(form.fert2_rate_max)}
                      onChange={(e) => setNum("fert2_rate_max", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">สูตรปุ๋ย</Label>
                    <Input className="mt-1 rounded-lg bg-white" placeholder="46-0-0"
                      value={form.fert2_formula ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, fert2_formula: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">หมายเหตุ</Label>
                  <Input className="mt-1 rounded-lg bg-white" placeholder="เช่น ใส่ช่วงกำเนิดช่อดอก"
                    value={form.fert2_note ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, fert2_note: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* เพิ่มเติม */}
            <div className="border-t pt-4 space-y-3">
              <div>
                <Label className="text-xs">คำอธิบาย (ไม่บังคับ)</Label>
                <Input
                  className="mt-1 rounded-lg"
                  placeholder="เช่น ลักษณะเด่น การปลูกที่เหมาะ"
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">URL อ้างอิง (ไม่บังคับ)</Label>
                <Input
                  className="mt-1 rounded-lg"
                  placeholder="https://…"
                  value={form.reference_url ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, reference_url: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>ปิด</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
