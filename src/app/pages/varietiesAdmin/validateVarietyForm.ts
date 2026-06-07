import type { Variety } from "./types";

export function validateVarietyForm(
  form: Partial<Variety>,
  editing: Variety | null,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.name?.trim()) errors.name = "กรุณากรอกชื่อพันธุ์";
  if (!editing && !form.collection_name?.trim())
    errors.collection_name = "กรุณากรอกรหัสพันธุ์";
  if (form.is_photoperiod_sensitive === undefined)
    errors.is_photoperiod_sensitive = "กรุณาเลือกว่าไวต่อช่วงแสงหรือไม่";
  if (!form.supported_methods?.length)
    errors.supported_methods = "เลือกวิธีปลูกอย่างน้อย 1 แบบ";
  if (form.harvest_age_days == null || Number(form.harvest_age_days) < 1)
    errors.harvest_age_days = "กรุณากรอกอายุเก็บเกี่ยว (วัน)";
  if (form.tillering_day == null) errors.tillering_day = "กรุณากรอกวันแตกกอ";
  if (form.panicle_initiation_day == null)
    errors.panicle_initiation_day = "กรุณากรอกวันกำเนิดช่อดอก";
  if (form.heading_day == null)
    errors.heading_day = "กรุณากรอกวันตั้งท้องและออกรวง";
  if (
    form.fert1_rate == null ||
    !Number.isFinite(Number(form.fert1_rate)) ||
    Number(form.fert1_rate) < 0
  )
    errors.fert1_rate = "กรุณากรอกอัตราปุ๋ยช่วงแตกกอ";
  if (
    form.fert2_rate == null ||
    !Number.isFinite(Number(form.fert2_rate)) ||
    Number(form.fert2_rate) < 0
  )
    errors.fert2_rate = "กรุณากรอกอัตราปุ๋ยช่วงกำเนิดช่อดอก";
  if (!form.fert2_formula?.trim())
    errors.fert2_formula = "กรุณากรอกสูตรปุ๋ยช่วงกำเนิดช่อดอก";

  if (
    form.harvest_age_days != null &&
    form.tillering_day != null &&
    form.panicle_initiation_day != null &&
    form.heading_day != null &&
    !(
      0 <= Number(form.tillering_day) &&
      Number(form.tillering_day) < Number(form.panicle_initiation_day) &&
      Number(form.panicle_initiation_day) < Number(form.heading_day) &&
      Number(form.heading_day) < Number(form.harvest_age_days)
    )
  ) {
    errors.harvest_age_days =
      "ลำดับวันต้องเป็น แตกกอ < กำเนิดช่อดอก < ออกรวง < อายุเก็บเกี่ยว";
    errors.tillering_day = errors.tillering_day ?? "ตรวจสอบลำดับวัน";
    errors.panicle_initiation_day =
      errors.panicle_initiation_day ?? "ตรวจสอบลำดับวัน";
    errors.heading_day = errors.heading_day ?? "ตรวจสอบลำดับวัน";
  }

  return errors;
}

export function varietyFormToBody(form: Partial<Variety>) {
  return {
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
    fert1_rate: form.fert1_rate ?? null,
    fert2_rate: form.fert2_rate ?? null,
    fert2_formula: form.fert2_formula?.trim() || null,
    fert1_note: form.fert1_note || null,
    fert2_note: form.fert2_note || null,
  };
}
