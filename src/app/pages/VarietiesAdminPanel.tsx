import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Sprout, Lock } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useVarieties } from "../contexts/VarietiesContext";
import type { RiceSeasonType, RiceVarietyRecord, ScheduleMode } from "../lib/riceVarietyTypes";
import { RICE_SEASON_LABELS } from "../lib/riceVarietyTypes";
import { validateRiceVarietyRecord } from "../lib/varietyValidation";

const emptyStages = (): RiceVarietyRecord["stages"] => [
  { name: "ระยะกล้า", startDay: 0, endDay: 20 },
  { name: "ระยะแตกกอ", startDay: 21, endDay: 45 },
  { name: "ระยะรับท้อง", startDay: 46, endDay: 70 },
  { name: "ระยะออกดอกและสุกแก่", startDay: 71, endDay: 95 },
];

const emptyFixedMilestones = (): NonNullable<RiceVarietyRecord["fixedMilestones"]> => [
  { name: "ระยะรับท้อง (ใส่ปุ๋ยรอบ 2)", daysBeforeHarvest: 60 },
  { name: "ระยะออกดอก", daysBeforeHarvest: 30 },
  { name: "ระยะพลับพลึง", daysBeforeHarvest: 7 },
  { name: "ระยะเก็บเกี่ยว", daysBeforeHarvest: 0 },
];

export default function VarietiesAdminPanel() {
  const { varieties, addVariety, updateVariety, deleteVariety } = useVarieties();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RiceVarietyRecord | null>(null);
  const [form, setForm] = useState<Partial<RiceVarietyRecord>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...varieties].sort((a, b) => a.name.localeCompare(b.name, "th")),
    [varieties],
  );

  const openNew = () => {
    setEditing(null);
    setForm({
      id: "",
      name: "",
      seasonType: "naprang",
      photoperiodSensitive: false,
      totalDays: 95,
      stages: emptyStages(),
      isDefault: false,
      scheduleMode: "DAS_BASED",
      harvestMonthDay: "11-25",
      fixedMilestones: emptyFixedMilestones(),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (v: RiceVarietyRecord) => {
    setEditing(v);
    setForm({
      ...v,
      stages: v.stages.map((s) => ({ ...s })),
      scheduleMode: v.scheduleMode ?? "DAS_BASED",
      harvestMonthDay: v.harvestMonthDay,
      fixedMilestones: v.fixedMilestones?.map((m) => ({ ...m })) ?? emptyFixedMilestones(),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const applyTotalToLastStage = (total: number, stages: RiceVarietyRecord["stages"]) => {
    if (!stages.length) return stages;
    const next = stages.map((s, i) =>
      i === stages.length - 1 ? { ...s, endDay: total } : { ...s },
    );
    return next;
  };

  const handleSave = () => {
    const totalDays = Number(form.totalDays);
    const mode = (form.scheduleMode ?? "DAS_BASED") as ScheduleMode;
    const stages =
      editing && editing.isDefault
        ? (form.stages as RiceVarietyRecord["stages"])
        : applyTotalToLastStage(totalDays, (form.stages ?? []) as RiceVarietyRecord["stages"]);

    const draft: RiceVarietyRecord = {
      id: (form.id ?? "").trim(),
      name: (form.name ?? "").trim(),
      seasonType: (form.seasonType ?? "naprang") as RiceSeasonType,
      photoperiodSensitive: !!form.photoperiodSensitive,
      totalDays,
      stages,
      isDefault: editing?.isDefault ?? false,
      scheduleMode: mode,
      ...(mode === "FIXED_DATE"
        ? {
            harvestMonthDay: (form.harvestMonthDay ?? "").trim(),
            fixedMilestones: (form.fixedMilestones ?? emptyFixedMilestones()).map((m) => ({
              name: m.name.trim(),
              daysBeforeHarvest: Number(m.daysBeforeHarvest),
            })),
          }
        : {
            harvestMonthDay: undefined,
            fixedMilestones: undefined,
          }),
    };

    const err = validateRiceVarietyRecord(draft);
    if (err) {
      setFormError(err);
      return;
    }

    if (editing) {
      if (editing.isDefault) {
        const u = updateVariety(editing.id, {
          name: draft.name,
          totalDays: draft.totalDays,
          stages: draft.stages,
          seasonType: draft.seasonType,
          photoperiodSensitive: draft.photoperiodSensitive,
          scheduleMode: draft.scheduleMode,
          harvestMonthDay: draft.harvestMonthDay,
          fixedMilestones: draft.fixedMilestones,
        });
        if (u) {
          setFormError(u);
          return;
        }
      } else {
        const u = updateVariety(editing.id, draft);
        if (u) {
          setFormError(u);
          return;
        }
      }
    } else {
      const u = addVariety({
        id: draft.id,
        name: draft.name,
        seasonType: draft.seasonType,
        photoperiodSensitive: draft.photoperiodSensitive,
        totalDays: draft.totalDays,
        stages: draft.stages,
        scheduleMode: draft.scheduleMode,
        harvestMonthDay: draft.harvestMonthDay,
        fixedMilestones: draft.fixedMilestones,
      });
      if (u) {
        setFormError(u);
        return;
      }
    }
    setDialogOpen(false);
  };

  const updateStage = (index: number, patch: Partial<RiceVarietyRecord["stages"][0]>) => {
    const stages = [...((form.stages ?? []) as RiceVarietyRecord["stages"])];
    stages[index] = { ...stages[index], ...patch };
    setForm((f) => ({ ...f, stages }));
  };

  const updateFixedMilestone = (
    index: number,
    patch: Partial<{ name: string; daysBeforeHarvest: number }>,
  ) => {
    const list = [...(form.fixedMilestones ?? emptyFixedMilestones())];
    list[index] = { ...list[index], ...patch };
    setForm((f) => ({ ...f, fixedMilestones: list }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h3 className="font-medium flex-1">พันธุ์ข้าว (เก็บในเบราว์เซอร์)</h3>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มพันธุ์ข้าวใหม่
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        พันธุ์ข้าวที่สร้างจะถูกใช้ในการสร้างแผนงาน และรายงาน
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((v) => (
          <Card key={v.id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Sprout className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{v.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v.id}</p>
                </div>
              </div>
              {v.isDefault && (
                <span className="text-xs flex items-center gap-1 text-muted-foreground shrink-0">
                  <Lock className="w-3.5 h-3.5" /> ค่าเริ่มต้น
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {v.scheduleMode === "FIXED_DATE" ? "วันเก็บเกี่ยวคงที่ (ย้อนหลัง)" : "DAS จากวันปลูก"} •{" "}
              {RICE_SEASON_LABELS[v.seasonType]} • {v.photoperiodSensitive ? "ไวต่อแสง" : "ไม่ไวต่อแสง"} •{" "}
              {v.totalDays} วัน • {v.stages.length} ระยะ (DAS)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openEdit(v)}>
                <Pencil className="w-4 h-4 mr-1" />
                {v.isDefault ? "ดู/แก้ไข" : "แก้ไข"}
              </Button>
              {!v.isDefault && (
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
                      <AlertDialogAction
                        onClick={() => deleteVariety(v.id)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        ลบ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? (editing.isDefault ? "แก้ไขพันธุ์เริ่มต้น" : "แก้ไขพันธุ์") : "เพิ่มพันธุ์ข้าวใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div>
              <Label>รหัสพันธุ์ (slug / collection)</Label>
              <Input
                className="mt-1 rounded-lg"
                value={form.id ?? ""}
                disabled={!!editing}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                placeholder="เช่น my_rice_01"
              />
            </div>
            <div>
              <Label>ชื่อพันธุ์ข้าว</Label>
              <Input
                className="mt-1 rounded-lg"
                value={form.name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ประเภทนา</Label>
                <Select
                  value={form.seasonType ?? "naprang"}
                  onValueChange={(v) => setForm((f) => ({ ...f, seasonType: v as RiceSeasonType }))}
                >
                  <SelectTrigger className="mt-1 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="napee">{RICE_SEASON_LABELS.napee}</SelectItem>
                    <SelectItem value="naprang">{RICE_SEASON_LABELS.naprang}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ไวต่อช่วงแสง</Label>
                <Select
                  value={form.photoperiodSensitive ? "yes" : "no"}
                  onValueChange={(v) => setForm((f) => ({ ...f, photoperiodSensitive: v === "yes" }))}
                >
                  <SelectTrigger className="mt-1 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">ไวต่อช่วงแสง</SelectItem>
                    <SelectItem value="no">ไม่ไวต่อช่วงแสง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>โหมดตารางเวลา</Label>
              <Select
                value={form.scheduleMode ?? "DAS_BASED"}
                onValueChange={(v) => setForm((f) => ({ ...f, scheduleMode: v as ScheduleMode }))}
              >
                <SelectTrigger className="mt-1 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAS_BASED">DAS จากวันปลูก (พันธุ์ไม่ไวแสง / กำหนดเอง)</SelectItem>
                  <SelectItem value="FIXED_DATE">วันเก็บเกี่ยวคงที่ (ย้อนหลังจากวันเก็บเกี่ยว)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(form.scheduleMode ?? "DAS_BASED") === "FIXED_DATE" && (
              <>
                <div>
                  <Label>วันเก็บเกี่ยวคงที่ (MM-DD)</Label>
                  <Input
                    className="mt-1 rounded-lg font-mono"
                    placeholder="11-25"
                    value={form.harvestMonthDay ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, harvestMonthDay: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">เช่น 25 พ.ย. = 11-25</p>
                </div>
                <div>
                  <Label>Milestone ย้อนจากวันเก็บเกี่ยว (วันก่อนเก็บเกี่ยว)</Label>
                  <div className="mt-2 space-y-2">
                    {(form.fixedMilestones ?? emptyFixedMilestones()).map((m, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_6rem] gap-2 items-end">
                        <Input
                          placeholder="ชื่อ milestone"
                          value={m.name}
                          onChange={(e) => updateFixedMilestone(i, { name: e.target.value })}
                          className="rounded-lg"
                        />
                        <Input
                          type="number"
                          min={0}
                          placeholder="วันก่อนเก็บ"
                          value={m.daysBeforeHarvest}
                          onChange={(e) =>
                            updateFixedMilestone(i, { daysBeforeHarvest: Number(e.target.value) })
                          }
                          className="rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ต้องมีรายการที่วันก่อนเก็บ = 0 (วันเก็บเกี่ยว)
                  </p>
                </div>
              </>
            )}
            <div>
              <Label>อายุเก็บเกี่ยว (วัน) — ใช้กราฟ / DAS</Label>
              <Input
                type="number"
                min={1}
                className="mt-1 rounded-lg"
                value={form.totalDays ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, totalDays: Number(e.target.value) }))}
              />
            </div>
            {(form.scheduleMode ?? "DAS_BASED") === "DAS_BASED" && (
              <div>
                <Label>ช่วง DAS ต่อ milestone (เรียงต่อเนื่อง — ระยะสุดท้ายต้องจบที่อายุเก็บเกี่ยว)</Label>
                <div className="mt-2 space-y-2">
                  {((form.stages ?? []) as RiceVarietyRecord["stages"]).map((s, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                      <Input
                        placeholder="ชื่อระยะ"
                        value={s.name}
                        onChange={(e) => updateStage(i, { name: e.target.value })}
                        className="rounded-lg"
                      />
                      <Input
                        type="number"
                        placeholder="DAS เริ่ม"
                        value={s.startDay}
                        onChange={(e) => updateStage(i, { startDay: Number(e.target.value) })}
                        className="rounded-lg"
                      />
                      <Input
                        type="number"
                        placeholder="DAS จบ"
                        value={s.endDay}
                        onChange={(e) => updateStage(i, { endDay: Number(e.target.value) })}
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ปิด
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
