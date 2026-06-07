import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { apiFetch } from "../lib/api";
import { EmptyState } from "../components/EmptyState";
import { VarietyCard } from "./varietiesAdmin/VarietyCard";
import { VarietyFormDialog } from "./varietiesAdmin/VarietyFormDialog";
import {
  emptyVarietyForm,
  FIELD_ORDER,
  type Variety,
} from "./varietiesAdmin/types";
import {
  validateVarietyForm,
  varietyFormToBody,
} from "./varietiesAdmin/validateVarietyForm";

export default function VarietiesAdminPanel({
  onVarietiesMutated,
}: {
  onVarietiesMutated?: () => void;
}) {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Variety | null>(null);
  const [form, setForm] = useState<Partial<Variety>>(emptyVarietyForm());
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteStats, setDeleteStats] = useState<Record<string, { doc_count: number } | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = () => {
    apiFetch<Variety[]>("/varieties/", {}, false)
      .then(setVarieties)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyVarietyForm());
    setError(null);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openEdit = (v: Variety) => {
    setEditing(v);
    setForm({ ...v });
    setError(null);
    setFieldErrors({});
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
    clearFieldError("supported_methods");
  };

  const clearFieldError = (key: string) =>
    setFieldErrors((fe) => {
      const next = { ...fe };
      delete next[key];
      return next;
    });

  const scrollToField = (key: string) => {
    const el = scrollRef.current?.querySelector(`[data-field="${key}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement).focus?.();
    }
  };

  const handleSave = async () => {
    const errors = validateVarietyForm(form, editing);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const first = FIELD_ORDER.find((k) => errors[k]);
      if (first) setTimeout(() => scrollToField(first), 50);
      return;
    }

    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const body = varietyFormToBody(form);
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

  const fetchDeleteStats = async (id: string) => {
    if (deleteStats[id] !== undefined) return;
    try {
      const stats = await apiFetch<{ doc_count: number }>(`/varieties/${id}/stats`, {}, true);
      setDeleteStats((s) => ({ ...s, [id]: stats }));
    } catch {
      setDeleteStats((s) => ({ ...s, [id]: null }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/varieties/${id}`, { method: "DELETE" }, true);
      setDeleteStats((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      });
      load();
      onVarietiesMutated?.();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const setNum = (key: keyof Variety, val: string) => {
    setForm((f) => ({ ...f, [key]: val === "" ? null : Number(val) }));
    clearFieldError(key as string);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h3 className="font-medium flex-1">พันธุ์ข้าว ({varieties.length})</h3>
        <Button
          className="bg-primary hover:bg-primary/90 text-white rounded-xl"
          onClick={openNew}
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มพันธุ์ข้าวใหม่
        </Button>
      </div>

      {varieties.length === 0 && <EmptyState message="ยังไม่มีพันธุ์ข้าวในระบบ" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {varieties.map((v) => (
          <VarietyCard
            key={v.id}
            variety={v}
            deleteStats={deleteStats[v.id]}
            onEdit={openEdit}
            onDeleteStatsOpen={fetchDeleteStats}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <VarietyFormDialog
        open={dialogOpen}
        editing={editing}
        form={form}
        error={error}
        fieldErrors={fieldErrors}
        saving={saving}
        scrollRef={scrollRef}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onToggleMethod={toggleMethod}
        onClearFieldError={clearFieldError}
        onSetNum={setNum}
      />
    </div>
  );
}
