## RICE EXPERT: Context-Engineering Rules (PRD & Technical Logic)

### 1) Project Scope & User Pain Points
- Goal: สร้างระบบ RAG AI ช่วยเกษตรกร “จัดการแปลง” ผ่าน `Timeline` และ `Dashboard`
- Target User:
  - เกษตรกร: ต้องใช้ภาษาเข้าใจง่าย ตอบนำไปทำงานจริงได้
  - Developer: ต้องการข้อมูลที่ชัดเจน/แม่นและกติกา anti-hallucination ชัด
- Minimum Spec in Webapp:
  - เว็บต้องเบาและลื่น (Optimize for low-end mobile)
  - โหลดข้อมูลแบบแยกตามแปลง (plot-based loading)
  - timeline เป็น fixed/static plan เพื่อเรนเดอร์เร็ว

---

### 2) Display Rules: ผู้ใช้ต้องรู้ว่า “ดูแปลงไหนอยู่”
- Dashboard/Calendar ต้องแสดงชื่อแปลง (`plotName`) และชื่อพันธุ์ (`varietyName`)
- ทุก action (เช่น ดูงาน/ติ๊กงาน/ส่งคำถาม AI) ต้องผูกกับ `activePlotId` เท่านั้น

---

### 3) Dashboard & Calendar (แปลงรวม + รายแปลง)
- ภาพรวม (Dashboard รวมหลายแปลง):
  - ต้องมี “แดชบอร์ดใส่ในแต่ละแปลง” (card per plot) เช่น ระยะปัจจุบัน + สิ่งที่ต้องทำต่อ + งานเดือนนี้/ช่วงถัดไป
- Calendar:
  - ต้องมี selector เลือกแปลงนา เพื่อดู “วันเวลา” งานของแปลงนั้น
  - มีมุมมองอย่างน้อย 1 แบบ และควรทำได้ทั้ง 2 แบบ:
    - `Milestone view` ตามระยะข้าว
    - `Timeline static` จาก fixed plan

---

### 4) Growth Stage Logic (3 ระยะหลัก + 10 ระยะย่อย)
ระบบต้องใช้ logic นี้เพื่อสร้าง Milestones/Timeline ของแต่ละแปลง

#### A) Vegetative Stage (ลำต้น)
1. ระยะงอก (Germination): แช่ 24 ชม. บ่ม 24–48 ชม.
2. ระยะต้นกล้า (Seedling): 0–20 วัน
3. ระยะแตกกอ (Tillering): เริ่มหลังปลูก 20–45 วัน (ใส่ปุ๋ยรอบ 1)

#### B) Reproductive Stage (การเจริญพันธุ์)
4. ระยะสร้างรวงอ่อน (Panicle Initiation): เริ่ม “รับท้อง” (ใส่ปุ๋ยรอบ 2)
5. ระยะโผล่เหมย/ท้องแก่ (Booting): รวงดันกาบบน
6. ระยะออกดอก (Heading/Flowering): ข้าวบาน (ห้ามขาดน้ำเด็ดขาด)

#### C) Ripening Stage (สุกแก่)
7. ระยะน้ำนม (Milk Stage): หลังผสมเกสร
8. ระยะสร้างแป้ง (Dough Stage): เมล็ดเริ่มแข็ง
9. ระยะสุกแก่/พลับพลึง (Maturity): 25–30 วันหลังออกดอก (เก็บเกี่ยวได้คุณภาพดีที่สุด)

หมายเหตุเชิงเทคนิค:
- “จำนวนวันต่อระยะ” ที่ใช้คำนวณต้องได้จาก `Fixed Plan` ของพันธุ์ (ห้ามเดาจากช่วงกว้าง)
- ข้อจำกัดเฉพาะระยะ เช่น “ห้ามขาดน้ำช่วงออกดอก” ต้อง encode เป็น `Constraints` เพื่อกันคำตอบขัดกับคู่มือ

---

### 5) Fixed Plan (Predictive Schedule) = หัวใจ Timeline/Calendar
ระบบต้องใช้ “ค่าคงที่ของพันธุ์” เพื่อแสดงล่วงหน้าใน Timeline/Calendar

#### 5.1 นิยาม FixedPlan
`FixedPlan` ของพันธุ์หนึ่งประกอบด้วย:
- `totalDays`
- `stageBreakpoints[]`: วันที่/วันนับจาก `plantingDate` ที่เปลี่ยนระยะ
- `milestones[]`: จุดสำคัญสำหรับ UI
- `tasks[]`: งานที่จะสร้างเป็น timeline items
- `fertilizerEvents[]`: เหตุการณ์ใส่ปุ๋ยตามระยะ
- `constraintsByStage`: กฎข้อห้าม/ข้อกำหนดตามระยะ

#### 5.2 Plot-based Context (ต้องยึดเฉพาะแปลงที่กำลังดู)
เมื่อ active user ดู `Plot A`:
- ใช้ข้อมูลของ `Plot A` เท่านั้น: `varietyId/varietyName`, `plantingDate`, `soilType` (ถ้ามี)
- timeline/milestones/tasks ต้องผูกกับ snapshot ของ `Plot A`

---

### 6) Add Rice Variety + Fertilizer per Variety & Soil
ระบบต้องรองรับ “พันธุ์หลายขึ้น” และสูตรปุ๋ยตามชนิดดิน

#### 6.1 Data ที่ต้องมี
- `RiceVariety`: `id`, `name`, `fixedPlan`, `sourceReferences[]`
- `SoilType`: อย่างน้อย 2–3 กลุ่ม (เป็น key กลางของระบบ)
- `FertilizerRule`: key (`varietyId` + `soilType`) -> สูตร/ชนิดปุ๋ย + เงื่อนไขตามระยะ

#### 6.2 Constraint: ห้ามแนะนำปุ๋ยที่ขัดกับกรมการข้าว/คู่มือใน KB
- ต้อง encode ข้อห้ามตาม `constraintsByStage`
- ถ้า Knowledge Base ไม่ระบุสิ่งที่ถาม:
  - ตอบว่า “ไม่มีข้อมูลในคู่มือ”
  - ห้ามเอาความรู้ทั่วไปจากอินเทอร์เน็ตมาปน

---

### 7) RAG & Anti-Hallucination Protocol (บังคับ)

#### 7.1 Identify Source ทุกครั้ง
- ทุกคำตอบเกี่ยวกับ “วิธีปลูก” หรือ “พันธุ์ข้าว” ต้องระบุแหล่งข้อมูล (sources) ว่ามาจากไฟล์ใดใน Knowledge Base
  - ตัวอย่างเอกสารที่ระบบต้อง cite (ชื่อไฟล์ให้ตรงกับที่อยู่จริง): `Kubota_Guide.pdf`, `RD15_Manual.pdf`

#### 7.2 RD15 Origin Correction (ห้ามตอบผิด)
- กข15 (RD15) คือ “แฝด/สาย” ของหอมมะลิ 105 ที่ใช้รังสีแกมมา
- ห้ามตอบว่าเป็นพันธุ์ผสมจากสุพรรณบุรีเด็ดขาด

#### 7.3 No Guessing Rule
- หากใน Knowledge Base ไม่มีข้อมูล “ส่วนที่ผู้ใช้ถาม”:
  - ตอบ “ไม่มีข้อมูลในคู่มือ”
  - ห้ามเดา/เติมเต็มจากความรู้ทั่วไป

#### 7.4 Context Pack ที่ต้องส่งให้ backend RAG
- `question`
- `activePlotContext`:
  - `plotName/plotId`
  - `varietyId/varietyName`
  - `plantingDate`
  - `soilType`
- `fixedPlanSnapshot` ของพันธุ์นั้น (stage breakpoints + milestone dates)
- `fertilizerRules` ตาม variety + soil
- policy: citation + no guessing + conflict constraints

---

### 8) ไล่วิธีการปลูกข้าว 1 ชนิดก่อน (Pattern ก่อน scale)
- Strategy:
  - ทำ planting method แบบ step-by-step ให้ครบ pattern ด้วยพันธุ์เริ่มต้น 1 ชนิดก่อน
  - จากนั้นค่อยขยาย variety อื่น และเพิ่ม fertilizerRules ที่ถูกต้อง
- เมื่อผู้ใช้ถาม “วิธีปลูกข้าวพันธุ์ X”:
  - ตอบเป็นขั้นตอนตาม fixed plan
  - ผูกกับระยะ/stage และวันนับจาก `plantingDate`
  - ทุกส่วนต้องมี citation

---

### 9) “คิดจะปลูกจริงๆ” (Actionability)
- Timeline/คำตอบต้องนำไปทำงานได้จริง
- UI labels ควรผูกกับ “งานจริง” เช่น ใส่ปุ๋ยรอบไหน/ดูแลช่วงไหน/น้ำช่วงวิกฤต
- ห้ามคำอธิบายกว้าง ๆ ที่ทำให้ตัดสินใจไม่ได้ ต้องมีช่วงวัน/ระยะชัดเจนจาก fixed plan

---

### 10) Knowledge Upload ใหม่ (PDF -> Vector Store)
- ต้องมี API สำหรับอัปโหลด Knowledge ใหม่ (PDF) เข้า Vector Store
- Admin/Knowledge page:
  - อัปโหลดไฟล์ พร้อมเลือก `collection`
  - ลบเอกสาร
  - AI ต้องใช้งานเอกสารใหม่ได้หลัง index/update ตามรอบที่ระบบกำหนด

---

### 11) เก็บข้อมูลผลของ RAG (Logging; Mandatory)
ทุกครั้งที่ระบบตอบคำถามด้วย RAG ต้องเก็บอย่างน้อย:
- `timestamp`
- `userId` (ถ้ามี)
- `activePlotId`
- `question`
- `promptTemplateVersion` หรือ `templateId`
- `retrievedDocIds` (หรือ chunk ids)
- `sources[]` ที่ใช้ cite
- `answer`
- `latency_ms`
- `resultType` เช่น `success`, `no_data_in_kb`, `conflict_detected`, `error`

---

### 12) ชุดคำถามทดสอบ (20 ข้อ) + Template ที่ดี

#### 12.1 Template Structure (แนะนำ)
- `id`
- `question`
- `intentType` (เช่น `fertilizer`, `schedule`, `watering`, `pests`, `harvesting`, `troubleshooting`)
- `requiresPlotContext`
- `activePlotAssumptions`:
  - `plotName/varietyId/plantingDate/soilType`
- `expectedAnswerBehavior`:
  - ต้องมี citation
  - ถ้าไม่มีใน KB -> ต้องตอบ “ไม่มีข้อมูลในคู่มือ”

#### 12.2 ตัวอย่างคำถาม 20 ข้อ (แนวจากชาวนา/เพจ/ฟอรั่ม)
1. ตารางงานรายวัน/รายสัปดาห์สำหรับแปลงที่เลือก (timeline)
2. ตอนนี้ข้าวอยู่ระยะอะไร (อิงจาก `plantingDate`)
3. ต้องใส่ปุ๋ยรอบ 1-2 วันไหนของแปลงนี้
4. สูตรปุ๋ยของพันธุ์ X ในชนิดดิน Y คืออะไร (ต้อง cite)
5. ช่วงออกดอกต้องจัดการน้ำยังไง (ห้ามขาดน้ำ) (ต้อง cite)
6. หลังออกดอกควรทำอะไรเกี่ยวกับการให้น้ำ/ดูแล (ต้อง cite)
7. สัญญาณข้าวขาดน้ำ/น้ำมากในแต่ละช่วง (ต้อง cite)
8. ใบเหลืองในระยะนี้เกิดจากอะไร (ถ้าไม่มี KB -> ไม่มีข้อมูลในคู่มือ)
9. โรค/แมลงเริ่มระยะไหน (ถ้าไม่มี KB -> ไม่มีข้อมูลในคู่มือ)
10. การเตรียมแปลงก่อนปลูก/ก่อนเพาะ (ต้อง cite)
11. ระยะงอกควรแช่นานแค่ไหน (ต้อง cite)
12. วิธีบ่ม/เพาะกล้าให้แข็งแรง (ต้อง cite)
13. การจัดการวัชพืชช่วงแตกกอ (ถ้า KB มี)
14. เก็บเกี่ยวเมื่อถึงระยะพลับพลึงควรทำอย่างไร (ต้อง cite)
15. วางแผนเก็บเกี่ยวล่วงหน้าด้วย milestone (fixedPlan)
16. ฝนตกหนักควรทำอะไรกับแปลงนี้ (ต้อง cite)
17. ถ้าปลูกช้าหรือเลื่อนวันปลูก ต้องเลื่อน timeline อย่างไร (fixedPlan-based)
18. วิธีบันทึกผล/ติดตามการทำงาน (ตอบแบบ system guide + cite ถ้ามี)
19. ความแตกต่างของ RD15 vs พันธุ์อื่น (ต้อง cite และย้ำ origin correction)
20. วิธีปลูกข้าว “พันธุ์เริ่มต้น 1 ชนิด” แบบ step-by-step (ต้อง cite)

---

### 13) Frontend/Backend Integration Notes (ให้ตรง PRD)
- Frontend ต้องมี `CalendarComponent` ที่รองรับ milestone/timeline static ตาม growth stages
- `Calendar` ต้องเลือกแปลงได้และแสดง tasks/milestones ของ `activePlotId` เท่านั้น
- `Dashboard` ต้องแสดง card ต่อแปลงและบอกภาพรวม/สรุปงานของแปลงนั้น ๆ
- Backend ตอบ RAG โดยใช้ context pack ที่ผูกกับ active plot + fixed plan snapshot
- Plot-based loading เป็นข้อบังคับ:
  - Dashboard: summary ต่อ plot
  - Calendar/Timeline: tasks ของ active plot เท่านั้น

---

### 14) Implementation Order (แนะนำเพื่อทำให้จบไวและไม่หลุดกติกา)
1. ทำ fixed plan mapping ของพันธุ์เริ่มต้น 1 ชนิด (stage breakpoints + milestone dates + fertilizer events)
2. ทำ `CalendarComponent` + plot selector ให้ใช้งานได้ (milestone/timeline static)
3. ทำ `Dashboard` แบบ card ต่อแปลง (ระยะปัจจุบัน + งานเดือนนี้/สิ่งที่ต้องทำต่อ)
4. ทำ fertilizerRules (variety + soil) และผูกกับ stage constraints
5. ทำ planting method step-by-step สำหรับพันธุ์เริ่มต้น 1 ชนิด พร้อม citation
6. เพิ่ม Knowledge upload (PDF -> vector store)
7. เพิ่ม RAG logging + dataset 20 ข้อ เพื่อประเมินคุณภาพ
8. ค่อยขยาย variety + fertilizerRules ให้หลากหลายขึ้น

---

### 15) Open Questions (ขอคำตอบก่อนลงมือ “finalize”)
1. `SoilType` เริ่มต้นจะใช้กี่กลุ่ม และชื่อกลุ่มที่อยากให้ระบบใช้จริงคืออะไร?
2. พันธุ์เริ่มต้น “1 ชนิด” ที่อยากทำ planting method step-by-step ก่อนคือพันธุ์อะไร?
3. Fixed plan ของพันธุ์เริ่มต้นมี stage breakpoints เป็น “วันนับจากปลูก” อยู่แล้วหรือยัง?
4. ใน Calendar รอบแรกต้องการ “Milestone อย่างเดียว” หรือ “Milestone + tasks รายวัน” ตั้งแต่เริ่ม?
5. `task` ในระบบจะละเอียดระดับไหน (ใส่ปุ๋ยเป็น 1 task ต่อรอบ หรือแยกย่อยเป็นชนิดปุ๋ย/วิธีใส่)?

<!-- OLD_DUPLICATE_CONTENT_START (hidden) -->
## RICE EXPERT: Context-Engineering Rules (PRD & Technical Logic)

### 1) Project Scope & User Pain Points
- Goal: สร้างระบบ RAG AI ช่วยเกษตรกร “จัดการแปลง” ผ่าน `Timeline` และ `Dashboard`
- Target User:
  - เกษตรกร: ต้องใช้ภาษาเข้าใจง่าย ตอบนำไปทำงานจริงได้
  - Developer: ต้องการข้อมูลที่ชัดเจน/แม่นและกติกา anti-hallucination ชัด
- Minimum Spec in Webapp:
  - เว็บต้องเบาและลื่น (Optimize for low-end mobile)
  - โหลดข้อมูลแบบแยกตามแปลง (plot-based loading)
  - timeline เป็น fixed/static plan เพื่อเรนเดอร์เร็ว

---

### 2) Display Rules: ผู้ใช้ต้องรู้ว่า “ดูแปลงไหนอยู่”
- Dashboard/Calendar ต้องแสดงชื่อแปลง (`plotName`) และชื่อพันธุ์ (`varietyName`)
- ทุก action (เช่น ดูงาน/ติ๊กงาน/ส่งคำถาม AI) ต้องผูกกับ `activePlotId` เท่านั้น

---

### 3) Dashboard & Calendar (แปลงรวม + รายแปลง)
- ภาพรวม (Dashboard รวมหลายแปลง):
  - ต้องมี “แดชบอร์ดใส่ในแต่ละแปลง” (card per plot) เช่น ระยะปัจจุบัน + สิ่งที่ต้องทำต่อ + งานเดือนนี้/ช่วงถัดไป
- Calendar:
  - ต้องมี selector เลือกแปลงนา เพื่อดู “วันเวลา” งานของแปลงนั้น
  - มีมุมมองอย่างน้อย 1 แบบ และควรทำได้ทั้ง 2 แบบ:
    - `Milestone view` ตามระยะข้าว
    - `Timeline static` จาก fixed plan

---

### 4) Growth Stage Logic (3 ระยะหลัก + 10 ระยะย่อย)
ระบบต้องใช้ logic นี้เพื่อสร้าง Milestones/Timeline ของแต่ละแปลง

#### A) Vegetative Stage (ลำต้น)
1. ระยะงอก (Germination): แช่ 24 ชม. บ่ม 24–48 ชม.
2. ระยะต้นกล้า (Seedling): 0–20 วัน
3. ระยะแตกกอ (Tillering): เริ่มหลังปลูก 20–45 วัน (ใส่ปุ๋ยรอบ 1)

#### B) Reproductive Stage (การเจริญพันธุ์)
4. ระยะสร้างรวงอ่อน (Panicle Initiation): เริ่ม “รับท้อง” (ใส่ปุ๋ยรอบ 2)
5. ระยะโผล่เหมย/ท้องแก่ (Booting): รวงดันกาบบน
6. ระยะออกดอก (Heading/Flowering): ข้าวบาน (ห้ามขาดน้ำเด็ดขาด)

#### C) Ripening Stage (สุกแก่)
7. ระยะน้ำนม (Milk Stage): หลังผสมเกสร
8. ระยะสร้างแป้ง (Dough Stage): เมล็ดเริ่มแข็ง
9. ระยะสุกแก่/พลับพลึง (Maturity): 25–30 วันหลังออกดอก (เก็บเกี่ยวได้คุณภาพดีที่สุด)

หมายเหตุเชิงเทคนิค:
- “จำนวนวันต่อระยะ” ที่ใช้คำนวณต้องได้จาก `Fixed Plan` ของพันธุ์ (ห้ามเดาจากช่วงกว้าง)
- ข้อจำกัดเฉพาะระยะ เช่น “ห้ามขาดน้ำช่วงออกดอก” ต้อง encode เป็น `Constraints` เพื่อกันคำตอบขัดกับคู่มือ

---

### 5) Fixed Plan (Predictive Schedule) = หัวใจ Timeline/Calendar
ระบบต้องใช้ “ค่าคงที่ของพันธุ์” เพื่อแสดงล่วงหน้าใน Timeline/Calendar

#### 5.1 นิยาม FixedPlan
`FixedPlan` ของพันธุ์หนึ่งประกอบด้วย:
- `totalDays`
- `stageBreakpoints[]`: วันที่/วันนับจาก `plantingDate` ที่เปลี่ยนระยะ
- `milestones[]`: จุดสำคัญสำหรับ UI
- `tasks[]`: งานที่จะสร้างเป็น timeline items
- `fertilizerEvents[]`: เหตุการณ์ใส่ปุ๋ยตามระยะ
- `constraintsByStage`: กฎข้อห้าม/ข้อกำหนดตามระยะ

#### 5.2 Plot-based Context (ต้องยึดเฉพาะแปลงที่กำลังดู)
เมื่อ active user ดู `Plot A`:
- ใช้ข้อมูลของ `Plot A` เท่านั้น: `varietyId/varietyName`, `plantingDate`, `soilType` (ถ้ามี)
- timeline/milestones/tasks ต้องผูกกับ snapshot ของ `Plot A`

---

### 6) Add Rice Variety + Fertilizer per Variety & Soil
ระบบต้องรองรับ “พันธุ์หลายขึ้น” และสูตรปุ๋ยตามชนิดดิน

#### 6.1 Data ที่ต้องมี
- `RiceVariety`: `id`, `name`, `fixedPlan`, `sourceReferences[]`
- `SoilType`: อย่างน้อย 2–3 กลุ่ม (เป็น key กลางของระบบ)
- `FertilizerRule`: key (`varietyId` + `soilType`) -> สูตร/ชนิดปุ๋ย + เงื่อนไขตามระยะ

#### 6.2 Constraint: ห้ามแนะนำปุ๋ยที่ขัดกับกรมการข้าว/คู่มือใน KB
- ต้อง encode ข้อห้ามตาม `constraintsByStage`
- ถ้า Knowledge Base ไม่ระบุสิ่งที่ถาม:
  - ตอบว่า “ไม่มีข้อมูลในคู่มือ”
  - ห้ามเอาความรู้ทั่วไปจากอินเทอร์เน็ตมาปน

---

### 7) RAG & Anti-Hallucination Protocol (บังคับ)

#### 7.1 Identify Source ทุกครั้ง
- ทุกคำตอบเกี่ยวกับ “วิธีปลูก” หรือ “พันธุ์ข้าว” ต้องระบุแหล่งข้อมูล (sources) ว่ามาจากไฟล์ใดใน Knowledge Base
  - ตัวอย่างเอกสารที่ระบบต้อง cite (ชื่อไฟล์ให้ตรงกับที่อยู่จริง): `Kubota_Guide.pdf`, `RD15_Manual.pdf`

#### 7.2 RD15 Origin Correction (ห้ามตอบผิด)
- กข15 (RD15) คือ “แฝด/สาย” ของหอมมะลิ 105 ที่ใช้รังสีแกมมา
- ห้ามตอบว่าเป็นพันธุ์ผสมจากสุพรรณบุรีเด็ดขาด

#### 7.3 No Guessing Rule
- หากใน Knowledge Base ไม่มีข้อมูล “ส่วนที่ผู้ใช้ถาม”:
  - ตอบ “ไม่มีข้อมูลในคู่มือ”
  - ห้ามเดา/เติมเต็มจากความรู้ทั่วไป

#### 7.4 Context Pack ที่ต้องส่งให้ backend RAG
- `question`
- `activePlotContext`:
  - `plotName/plotId`
  - `varietyId/varietyName`
  - `plantingDate`
  - `soilType`
- `fixedPlanSnapshot` ของพันธุ์นั้น (stage breakpoints + milestone dates)
- `fertilizerRules` ตาม variety + soil
- policy: citation + no guessing + conflict constraints

---

### 8) ไล่วิธีการปลูกข้าว 1 ชนิดก่อน (Pattern ก่อน scale)
- Strategy:
  - ทำ planting method แบบ step-by-step ให้ครบ pattern ด้วยพันธุ์เริ่มต้น 1 ชนิดก่อน
  - จากนั้นค่อยขยาย variety อื่น และเพิ่ม fertilizerRules ที่ถูกต้อง
- เมื่อผู้ใช้ถาม “วิธีปลูกข้าวพันธุ์ X”:
  - ตอบเป็นขั้นตอนตาม fixed plan
  - ผูกกับระยะ/stage และวันนับจาก `plantingDate`
  - ทุกส่วนต้องมี citation

---

### 9) “คิดจะปลูกจริงๆ” (Actionability)
- Timeline/คำตอบต้องนำไปทำงานได้จริง
- UI labels ควรผูกกับ “งานจริง” เช่น ใส่ปุ๋ยรอบไหน/ดูแลช่วงไหน/น้ำช่วงวิกฤต
- ห้ามคำอธิบายกว้าง ๆ ที่ทำให้ตัดสินใจไม่ได้ ต้องมีช่วงวัน/ระยะชัดเจนจาก fixed plan

---

### 10) Knowledge Upload ใหม่ (PDF -> Vector Store)
- ต้องมี API สำหรับอัปโหลด Knowledge ใหม่ (PDF) เข้า Vector Store
- Admin/Knowledge page:
  - อัปโหลดไฟล์ พร้อมเลือก `collection`
  - ลบเอกสาร
  - AI ต้องใช้งานเอกสารใหม่ได้หลัง index/update ตามรอบที่ระบบกำหนด

---

### 11) เก็บข้อมูลผลของ RAG (Logging; Mandatory)
ทุกครั้งที่ระบบตอบคำถามด้วย RAG ต้องเก็บอย่างน้อย:
- `timestamp`
- `userId` (ถ้ามี)
- `activePlotId`
- `question`
- `promptTemplateVersion` หรือ `templateId`
- `retrievedDocIds` (หรือ chunk ids)
- `sources[]` ที่ใช้ cite
- `answer`
- `latency_ms`
- `resultType` เช่น `success`, `no_data_in_kb`, `conflict_detected`, `error`

---

### 12) ชุดคำถามทดสอบ (20 ข้อ) + Template ที่ดี

#### 12.1 Template Structure (แนะนำ)
- `id`
- `question`
- `intentType` (เช่น `fertilizer`, `schedule`, `watering`, `pests`, `harvesting`, `troubleshooting`)
- `requiresPlotContext`
- `activePlotAssumptions`:
  - `plotName/varietyId/plantingDate/soilType`
- `expectedAnswerBehavior`:
  - ต้องมี citation
  - ถ้าไม่มีใน KB -> ต้องตอบ “ไม่มีข้อมูลในคู่มือ”

#### 12.2 ตัวอย่างคำถาม 20 ข้อ (แนวจากชาวนา/เพจ/ฟอรั่ม)
1. ตารางงานรายวัน/รายสัปดาห์สำหรับแปลงที่เลือก (timeline)
2. ตอนนี้ข้าวอยู่ระยะอะไร (อิงจาก `plantingDate`)
3. ต้องใส่ปุ๋ยรอบ 1-2 วันไหนของแปลงนี้
4. สูตรปุ๋ยของพันธุ์ X ในชนิดดิน Y คืออะไร (ต้อง cite)
5. ช่วงออกดอกต้องจัดการน้ำยังไง (ห้ามขาดน้ำ) (ต้อง cite)
6. หลังออกดอกควรทำอะไรเกี่ยวกับการให้น้ำ/ดูแล (ต้อง cite)
7. สัญญาณข้าวขาดน้ำ/น้ำมากในแต่ละช่วง (ต้อง cite)
8. ใบเหลืองในระยะนี้เกิดจากอะไร (ถ้าไม่มี KB -> ไม่มีข้อมูลในคู่มือ)
9. โรค/แมลงเริ่มระยะไหน (ถ้าไม่มี KB -> ไม่มีข้อมูลในคู่มือ)
10. การเตรียมแปลงก่อนปลูก/ก่อนเพาะ (ต้อง cite)
11. ระยะงอกควรแช่นานแค่ไหน (ต้อง cite)
12. วิธีบ่ม/เพาะกล้าให้แข็งแรง (ต้อง cite)
13. การจัดการวัชพืชช่วงแตกกอ (ถ้า KB มี)
14. เก็บเกี่ยวเมื่อถึงระยะพลับพลึงควรทำอย่างไร (ต้อง cite)
15. วางแผนเก็บเกี่ยวล่วงหน้าด้วย milestone (fixedPlan)
16. ฝนตกหนักควรทำอะไรกับแปลงนี้ (ต้อง cite)
17. ถ้าปลูกช้าหรือเลื่อนวันปลูก ต้องเลื่อน timeline อย่างไร (fixedPlan-based)
18. วิธีบันทึกผล/ติดตามการทำงาน (ตอบแบบ system guide + cite ถ้ามี)
19. ความแตกต่างของ RD15 vs พันธุ์อื่น (ต้อง cite และย้ำ origin correction)
20. วิธีปลูกข้าว “พันธุ์เริ่มต้น 1 ชนิด” แบบ step-by-step (ต้อง cite)

---

### 13) Frontend/Backend Integration Notes (ให้ตรง PRD)
- Frontend ต้องมี `CalendarComponent` ที่รองรับ milestone/timeline static ตาม growth stages
- `Calendar` ต้องเลือกแปลงได้และแสดง tasks/milestones ของ `activePlotId` เท่านั้น
- `Dashboard` ต้องแสดง card ต่อแปลงและบอกภาพรวม/สรุปงานของแปลงนั้น ๆ
- Backend ตอบ RAG โดยใช้ context pack ที่ผูกกับ active plot + fixed plan snapshot
- Plot-based loading เป็นข้อบังคับ:
  - Dashboard: summary ต่อ plot
  - Calendar/Timeline: tasks ของ active plot เท่านั้น

---

### 14) Implementation Order (แนะนำเพื่อทำให้จบไวและไม่หลุดกติกา)
1. ทำ fixed plan mapping ของพันธุ์เริ่มต้น 1 ชนิด (stage breakpoints + milestone dates + fertilizer events)
2. ทำ `CalendarComponent` + plot selector ให้ใช้งานได้ (milestone/timeline static)
3. ทำ `Dashboard` แบบ card ต่อแปลง (ระยะปัจจุบัน + งานเดือนนี้/สิ่งที่ต้องทำต่อ)
4. ทำ fertilizerRules (variety + soil) และผูกกับ stage constraints
5. ทำ planting method step-by-step สำหรับพันธุ์เริ่มต้น 1 ชนิด พร้อม citation
6. เพิ่ม Knowledge upload (PDF -> vector store)
7. เพิ่ม RAG logging + dataset 20 ข้อ เพื่อประเมินคุณภาพ
8. ค่อยขยาย variety + fertilizerRules ให้หลากหลายขึ้น

---

### 15) Open Questions (ขอคำตอบก่อนลงมือ “finalize”)
1. `SoilType` เริ่มต้นจะใช้กี่กลุ่ม และชื่อกลุ่มที่อยากให้ระบบใช้จริงคืออะไร?
2. พันธุ์เริ่มต้น “1 ชนิด” ที่อยากทำ planting method step-by-step ก่อนคือพันธุ์อะไร?
3. Fixed plan ของพันธุ์เริ่มต้นมี stage breakpoints เป็น “วันนับจากปลูก” อยู่แล้วหรือยัง?
4. ใน Calendar รอบแรกต้องการ “Milestone อย่างเดียว” หรือ “Milestone + tasks รายวัน” ตั้งแต่เริ่ม?
5. `task` ในระบบจะละเอียดระดับไหน (ใส่ปุ๋ยเป็น 1 task ต่อรอบ หรือแยกย่อยเป็นชนิดปุ๋ย/วิธีใส่)?

## Web Rice Expert – Context Engineering Rules (PRD & Technical Logic)

### 0) เป้าหมายหลัก
- สร้างระบบ RAG AI ช่วย “ชาวนา” จัดการแปลงนา ผ่าน `Dashboard` และ `Timeline/Calendar`
- ทำให้เข้าใจง่ายสำหรับเกษตรกร และแม่นสำหรับ developer
- Minimum Spec ของ Web App: เบา/เร็ว โดย “โหลดแยกตามแปลง” (plot-based loading) และเรนเดอร์ได้ลื่นบน low-end mobile

---

### 1) User Pain Point &สิ่งที่ระบบต้องแก้
- เกษตรกรต้องรู้ “ตอนนี้ข้าวอยู่ระยะไหน” และ “วัน/ช่วงที่ต้องทำต่อ”
- เกษตรกรต้องดูและจัดการ “แปลงของตัวเอง” โดยระบบต้องแสดงว่าเรากำลังดูแปลงไหน
- ชาวนาถามคำถามคล้ายสิ่งที่เจอในเพจ/ฟอรั่ม (เช่น reddit): ตารางงาน, ใส่ปุ๋ยตอนไหน, น้ำต้องให้ไหม, โรค/แมลง, แก้ปัญหา
- ห้ามตอบแบบเดา: ถ้า Knowledge Base ไม่มีข้อมูลที่เกี่ยวข้อง ต้องตอบว่า “ไม่มีข้อมูลในคู่มือ”

---

### 2) Growth Stage Logic (3 ระยะหลัก + 10 ระยะย่อย)
ใช้เพื่อสร้าง `Timeline` และ `Calendar Milestones`

#### A) Vegetative Stage (ลำต้น)
1. ระยะงอก (Germination): แช่ 24 ชม. บ่ม 24–48 ชม.
2. ระยะต้นกล้า (Seedling): 0–20 วัน
3. ระยะแตกกอ (Tillering): เริ่มหลังปลูก 20–45 วัน (ใส่ปุ๋ยรอบ 1)

#### B) Reproductive Stage (สร้างรวง/ออกดอก)
4. Panicle Initiation: เริ่ม “รับท้อง” (ใส่ปุ๋ยรอบ 2)
5. Booting: รวงดันกาบบน
6. Heading/Flowering: ข้าวบาน (ห้ามขาดน้ำเด็ดขาด)

#### C) Ripening Stage (สุกแก่)
7. Milk Stage: หลังผสมเกสร
8. Dough Stage: เมล็ดเริ่มแข็ง
9. Maturity: 25–30 วันหลังออกดอก (เก็บเกี่ยวได้คุณภาพดีที่สุด)

หมายเหตุเชิงเทคนิค:
- วันต่อระยะสำหรับคำนวณต้องมาจาก `Fixed Plan` ของพันธุ์นั้น (ไม่ใช่ช่วงกว้างใน PRD)
- เงื่อนไขเชิงระยะ (เช่น ห้ามขาดน้ำช่วงออกดอก) ต้อง encode เป็น `Constraints` เพื่อกันคำตอบขัดกับคู่มือ

---

### 3) Fixed Plan (Predictive Schedule)
ระบบต้องใช้ “ค่าคงที่ตามพันธุ์” เพื่อแสดงผลล่วงหน้าใน Timeline/Calendar

#### 3.1 นิยาม
`FixedPlan` ของพันธุ์หนึ่งประกอบด้วย
- `totalDays`
- `stageBreakpoints[]` (วันที่/วันนับจาก `plantingDate` ที่เปลี่ยนระยะ)
- `milestones[]` (จุดสำคัญที่ UI แสดง)
- `tasks[]` (งานที่จะถูกแปลงเป็น Timeline items)
- `fertilizerEvents[]` (เหตุการณ์ใส่ปุ๋ยตามระยะ)
- `constraintsByStage` (ข้อห้าม/เงื่อนไขตามระยะ)

#### 3.2 Plot-based Context (ต้องใช้เฉพาะแปลงที่กำลังดู)
เมื่อ user เปิดแปลง “Plot A”
- ใช้เฉพาะ `plotName`, `varietyId/varietyName`, `plantingDate`, และ `soilType` ของ Plot A ในการคำนวณ timeline
- ทุกหน้า (Dashboard/Calendar) ต้องอ้างอิง `activePlotId` หรือ plan ที่ active อยู่

---

### 4) Minimum Spec Web App (Performance + UX)
#### 4.1 Plot-based loading (ข้อบังคับด้าน performance)
- `Dashboard`: โหลด “summary ต่อแปลง” (การ์ด/ตัวเลข) ไม่โหลด tasks รายวันทุกแปลง
- `CalendarComponent`: โหลด/คำนวณเฉพาะ tasks ของ `activePlot` เท่านั้น

#### 4.2 Timeline แบบทำล่วงหน้าได้
- Timeline/Calendar ต้องแสดง “ล่วงหน้า” จาก Fixed Plan (predictive)
- แสดงอย่างน้อยในรูปแบบ `Milestones` ตาม stage และ/หรือ `timeline static`

#### 4.3 บอกชัดว่าเราดูแปลงไหน
- UI ต้องแสดงชื่อแปลงและชื่อพันธุ์ที่กำลัง active
- ปุ่ม/การกระทำใด ๆ ต้องผูกกับ active plot เท่านั้น (เช่น เลือก task หรือดูรายละเอียด)

---

### 5) Core UX ที่ต้องมี (ตาม requirement ใหม่)
1. `Dashboard` รวมหลายแปลง แต่ “เอาแดชบอร์ดใส่ในแต่ละแปลง” ด้วย (card per plot มี progress/milestones ย่อ)
2. `Calendar` ต้องมี selector เลือกแปลงนาเพื่อดู “วันเวลาที่ต้องทำของแปลงนั้น”
3. `CalendarComponent` รองรับ milestone ตามระยะข้าว (growth stages)
4. โหมดมุมมอง:
   - Milestone view
   - Timeline static view

---

### 6) Add Rice Variety + Fertilizer per Variety & Soil
#### 6.1 Data model ที่ต้องเตรียม
- `RiceVariety`
  - `id`, `name`
  - `fixedPlan` (stageBreakpoints/milestones/tasks/fertilizerEvents)
  - `sourceReferences[]` (ชื่อไฟล์/เอกสารใน Knowledge Base)
- `SoilType`
  - เริ่มอย่างน้อย 2–3 กลุ่ม (กำหนดเป็น key กลางของระบบ)
- `FertilizerRule`
  - key: (`varietyId` + `soilType`)
  - value: สูตร/ชนิดปุ๋ย + เงื่อนไขตามระยะ (stage constraints)

#### 6.2 Logic (พันธุ์ + ดิน -> ปุ๋ย)
- เมื่อระบบต้องสร้างคำแนะนำ/คำตอบ “ใส่ปุ๋ยอะไร”
  - ใช้ `(varietyId + soilType)` หา `FertilizerRule`
  - map ไปเป็น `fertilizerEvents` ตามวัน/ระยะใน Fixed Plan

#### 6.3 Constraint: ห้ามขัดกับคู่มือ (No contradiction)
- ถ้า Knowledge Base ระบุข้อห้าม (เช่น ช่วงออกดอกห้ามแนวทางที่ขัดกับคำแนะนำ)
  - ต้อง encode เป็น `constraintsByStage` และใช้เป็น gate ในการตอบ/สร้างคำแนะนำ
- ถ้า Knowledge Base ไม่มีข้อมูลในส่วนที่ถาม
  - ตอบ “ไม่มีข้อมูลในคู่มือ” เท่านั้น

---

### 7) RAG & Anti-Hallucination Protocol (บังคับ)
#### 7.1 Identify source ทุกครั้ง
- ทุกคำตอบเกี่ยวกับ “วิธีปลูก” หรือ “พันธุ์ข้าว”
  - ต้องระบุไฟล์/เอกสารที่ใช้เป็นแหล่งข้อมูล (sources)
  - ตัวอย่างไฟล์ใน KB เช่น `Kubota_Guide.pdf`, `RD15_Manual.pdf` (ชื่อให้ตรงกับที่ระบบเก็บจริง)

#### 7.2 RD15 Origin Correction (ห้ามตอบผิดเด็ดขาด)
- กข15 (RD15) = “แฝด/สาย” ของหอมมะลิ 105 ที่ใช้รังสีแกมมา
- ห้ามตอบว่าเป็นพันธุ์ผสมจากสุพรรณบุรีเด็ดขาด

#### 7.3 No Guessing
- หาก Knowledge Base ไม่มีข้อมูลที่ตรงคำถาม/ตรงพันธุ์/ตรงระยะ:
  - ตอบว่า “ไม่มีข้อมูลในคู่มือ”
  - ห้ามเอาความรู้ทั่วไปจากอินเทอร์เน็ตมาปน

#### 7.4 Context pack สำหรับ RAG (ต้องส่งให้ถูก)
ส่งให้ backend เพื่อประกอบ context:
- `question`
- `activePlotContext`
  - plotName/plotId
  - varietyId/varietyName
  - plantingDate
  - soilType
- `fixedPlanSnapshot` ของพันธุ์นั้น (stageBreakpoints/milestones/milestone dates)
- `fertilizerRules` (variety + soil)
- policy บังคับ: citation + no guessing + conflict constraints

---

### 8) “ไล่วิธีการปลูกข้าว 1 ชนิดก่อน” เพื่อรู้ pattern
#### 8.1 Strategy
- ทำ step-by-step planting method ให้ครบ “แพทเทิร์น” ก่อนด้วยพันธุ์เริ่มต้น 1 ชนิด
- แล้วค่อยขยาย variety อื่น และเพิ่ม fertilizer rules ทีละชุด

#### 8.2 Outcome ที่ต้องได้
- เมื่อถาม “วิธีปลูกข้าวพันธุ์ X”
  - ต้องตอบเป็นขั้นตอนตาม fixed plan
  - ผูกกับระยะ/stage และวันนับจาก `plantingDate`
  - ทุกส่วนต้องมี citation จาก KB

---

### 9) “คิดจะปลูกจริงๆ” (Actionability)
- Timeline/Calendar และคำตอบต้องนำไป “ทำได้จริง”
- UI labels ควรผูกกับงานจริง (ใส่ปุ๋ยรอบไหน/เฝ้าระวังช่วงไหน/การจัดการน้ำช่วงสำคัญ)
- ห้ามใช้คำกว้าง ๆ ที่ทำให้เกษตรกรตัดสินใจไม่ได้ (ต้องมีช่วงวัน/ระยะชัดเจนจาก fixed plan)

---

### 10) Knowledge Upload ใหม่ (PDF -> Vector Store)
- ต้องมี API สำหรับอัปโหลด Knowledge ใหม่ (PDF) เข้า Vector Store
- Admin/Knowledge page:
  - อัปโหลดไฟล์เลือก `collection`
  - ลบเอกสาร
  - AI ต้องเห็นข้อมูลใหม่หลัง index/update ตามรอบที่ระบบกำหนด

---

### 11) เก็บ Log ผลลัพธ์ RAG (Mandatory)
ทุกครั้งที่ตอบคำถามด้วย RAG ต้องเก็บ:
- `timestamp`
- `userId` (ถ้ามี)
- `activePlotId`
- `question`
- `promptTemplateVersion`/templateId
- `retrievedDocIds` (หรือ chunk ids)
- `sources[]` ที่ใช้ cite
- `answer`
- `latency_ms`
- `resultType` (เช่น `success`, `no_data_in_kb`, `conflict_detected`, `error`)

---

### 12) Dataset ทดสอบ: ชุดคำถาม 20 ข้อ + Template ที่ดี
#### 12.1 Template Structure (แนะนำ)
- `id`
- `question`
- `intentType`
- `requiresPlotContext`
- `activePlotAssumptions` (plotName/variety/plantingDate/soilType)
- `expectedAnswerBehavior`
  - ต้องมี citation
  - ถ้าไม่มีใน KB -> ต้องตอบ “ไม่มีข้อมูลในคู่มือ”

#### 12.2 ตัวอย่างคำถาม 20 ข้อ (แนวชาวนา/ฟอรั่ม)
1. ตารางงานรายวัน/รายสัปดาห์สำหรับแปลงที่เลือก (timeline)
2. ตอนนี้ข้าวอยู่ระยะอะไร (อิง plantingDate)
3. ต้องใส่ปุ๋ยรอบ 1-2 วันไหนของแปลงนี้
4. สูตรปุ๋ยของพันธุ์ X ในชนิดดิน Y คืออะไร (ต้อง cite)
5. ช่วงออกดอกต้องจัดการน้ำยังไง (ห้ามขาดน้ำ) (ต้อง cite)
6. หลังออกดอกควรทำอะไรกับการให้น้ำ/ดูแล (ต้อง cite)
7. สัญญาณข้าวขาดน้ำ/น้ำมากในแต่ละช่วง (ต้อง cite)
8. ใบเหลืองในระยะนี้เกิดจากอะไร (ถ้าไม่มี KB -> ไม่มีข้อมูลในคู่มือ)
9. โรค/แมลงเริ่มระยะไหน (ถ้าไม่มี KB -> ไม่มีข้อมูลในคู่มือ)
10. การเตรียมแปลงก่อนปลูก/ก่อนเพาะ (ต้อง cite)
11. ระยะงอกควรแช่นานแค่ไหน (ต้อง cite)
12. วิธีบ่ม/เพาะกล้าให้แข็งแรง (ต้อง cite)
13. การจัดการวัชพืชช่วงแตกกอ (ถ้า KB มี)
14. เก็บเกี่ยวเมื่อถึงระยะพลับพลึงควรทำอย่างไร (ต้อง cite)
15. วางแผนเก็บเกี่ยวล่วงหน้าจาก fixed plan + milestone
16. ฝนตกหนักควรทำอะไรกับแปลงนี้ (ต้อง cite)
17. ถ้าปลูกช้าหรือเลื่อนวันปลูก ต้องเลื่อน timeline อย่างไร (fixedPlan-based)
18. วิธีบันทึกผล/ติดตามการทำงาน (ตอบแบบ system guide + cite ถ้ามี)
19. ความแตกต่างของ RD15 vs พันธุ์อื่น (ต้อง cite และย้ำ origin correction)
20. วิธีปลูกข้าวพันธุ์เริ่มต้น 1 ชนิดแบบ step-by-step (ต้อง cite)

---

### 13) Implementation Order (ทำให้จบไว)
1. ทำ fixed plan mapping สำหรับพันธุ์เริ่มต้น 1 ชนิด (stageBreakpoints + milestone dates + fertilizer events)
2. ทำ `CalendarComponent` + plot selector ให้ใช้งานได้ (milestone/timeline static)
3. ทำ `Dashboard` แบบการ์ดต่อแปลง (ระยะปัจจุบัน + สิ่งที่ต้องทำต่อ + งานเดือนนี้)
4. ทำ fertilizerRules (variety + soil) และผูกกับ timeline/stage constraints
5. ทำ planting method step-by-step สำหรับพันธุ์เริ่มต้น 1 ชนิด พร้อม citation
6. เพิ่ม Knowledge upload (PDF -> vector store)
7. เพิ่ม RAG logging + dataset 20 ข้อ เพื่อประเมินคุณภาพ
8. ค่อยขยาย variety และ fertilizerRules ให้หลากหลายขึ้น

---

### 14) Open Questions (ขอคำตอบเพื่อ finalize ก่อนทำจริง)
1. `SoilType` จะเริ่มต้นกี่กลุ่ม และชื่อกลุ่มที่ต้องใช้จริงคืออะไร?
2. พันธุ์เริ่มต้น “1 ชนิด” ที่อยากทำ planting method step-by-step ก่อนคือพันธุ์อะไร?
3. Fixed plan ของพันธุ์เริ่มต้นมี stage breakpoints เป็น “วันนับจากปลูก” พร้อมแล้วหรือยัง?
4. ใน Calendar รอบแรกต้องการ “Milestone อย่างเดียว” หรือ “Milestone + tasks รายวัน” ตั้งแต่เริ่ม?
5. รูปแบบ `task` ที่ต้องการละเอียดแค่ไหน (ใส่ปุ๋ยเป็น 1 task ต่อรอบ หรือแยกย่อยชนิดปุ๋ย/วิธีใส่)?

## Web Rice Expert – Context Engineering Rules (PRD & Technical Logic)

### 0) เป้าหมายหลัก
- สร้างระบบ RAG AI ช่วย “ชาวนา/ชาวสวน” จัดการแปลงนา ผ่าน `Dashboard` + `Timeline/Calendar`
- ต้องเข้าใจง่ายสำหรับผู้ใช้เกษตรกร และแม่นสำหรับ developer
- โฟกัส Minimum Spec ของเว็บ: เบา/ลื่นบน low-end mobile และ “โหลดแยกตามแปลง” (plot-based loading)

---

### 1) โฟกัส Pain Point (ผู้ใช้)
- เกษตรกรต้องรู้ว่า “ข้าวตอนนี้อยู่ระยะไหน” และ “ต้องทำอะไรต่อ”
- เกษตรกรต้องดู/จัดการ “แปลงของตัวเอง” โดยไม่สับสน (ต้องบอกชัดว่าเรากำลังดูแปลงไหน)
- เมื่อถามเรื่องวิธีปลูก/พันธุ์/ปุ๋ย ระบบต้องอ้างอิงแหล่งข้อมูลจริง และไม่เดา

### 2) Pain Point (developer/ทีม)
- ต้องมี anti-hallucination rules ชัดเจน: ถ้า Knowledge Base ไม่ระบุ ให้ตอบว่า “ไม่มีข้อมูลในคู่มือ”
- ต้องมีแนวทาง engineering context ให้ RAG ตอบ “ตรงกับแปลงที่กำลังดู”
- ต้องมี logging เก็บผลลัพธ์ของ RAG เพื่อประเมิน/ปรับ prompt/rules ในอนาคต

---

### 3) Growth Stage Logic (3 ระยะหลัก + 10 ระยะย่อย)
ระบบต้องใช้เพื่อสร้าง `Timeline` และ `Milestones` ใน `Calendar`

#### A) ระยะการเจริญเติบโตทางลำต้น (Vegetative Stage)
1. **ระยะงอก (Germination)**: แช่ 24 ชม. บ่ม 24–48 ชม.
2. **ระยะต้นกล้า (Seedling)**: 0–20 วัน
3. **ระยะแตกกอ (Tillering)**: เริ่มหลังปลูก 20–45 วัน (ใส่ปุ๋ยรอบ 1)

#### B) ระยะการเจริญพันธุ์ (Reproductive Stage)
4. **ระยะสร้างรวงอ่อน (Panicle Initiation)**: ข้าวเริ่ม “รับท้อง” (ใส่ปุ๋ยรอบ 2)
5. **ระยะโผล่เหมย/ท้องแก่ (Booting)**: รวงดันกาบบน
6. **ระยะออกดอก (Heading/Flowering)**: ข้าวบาน (ห้ามขาดน้ำเด็ดขาด)

#### C) ระยะสุกแก่ (Ripening Stage)
7. **ระยะน้ำนม (Milk Stage)**: หลังผสมเกสร
8. **ระยะสร้างแป้ง (Dough Stage)**: เมล็ดเริ่มแข็ง
9. **ระยะสุกแก่/พลับพลึง (Maturity)**: 25–30 วันหลังออกดอก (เก็บเกี่ยวได้คุณภาพดีที่สุด)

หมายเหตุเชิงเทคนิค:
- ช่วงวัน “แบบตายตัว” ที่ใช้คำนวณปฏิทิน ต้องได้จาก `Fixed Plan` ของแต่ละพันธุ์ (ไม่ใช่เดาจากช่วงกว้างใน PRD)
- ข้อจำกัดเชิงระยะ (เช่น ห้ามขาดน้ำช่วงออกดอก) ต้องถูก encode เป็น `Constraints` สำหรับ AI และสำหรับ UI labels

---

### 4) Fixed Plan (Predictive Schedule) – หัวใจของ Timeline/Calendar
ระบบต้องแสดง “แผนคงที่” ของแต่ละพันธุ์ เพื่อให้เห็นล่วงหน้าได้ (Fixed Plan)

#### 4.1 Definition: FixedPlan
`FixedPlan` ของพันธุ์หนึ่งประกอบด้วย
- `totalDays` (อายุรวมฤดู/วงจร)
- `stageBreakpoints[]` (วันที่/วันนับจาก `plantingDate` ที่เปลี่ยนระยะ)
- `milestones[]` (จุดสำคัญที่แสดงใน Calendar)
- `tasks[]` (งานที่ระบบจะสร้างเป็น Timeline items)
- `fertilizerEvents[]` (เหตุการณ์การใส่ปุ๋ยตามระยะ)
- `constraintsByStage` (กฎข้อห้าม/ข้อกำหนดตามระยะ เพื่อกันคำแนะนำขัดกัน)

#### 4.2 Plot-based Context (ต้องใช้เฉพาะแปลงที่กำลังดู)
เมื่อผู้ใช้ดู `Plot A`:
- ใช้ `varietyId`, `plantingDate`, และ `soilType` ของ `Plot A` เท่านั้น
- ทุกการคำนวณ Timeline/Milestones/tasks ต้องอ้างอิง snapshot ของ `Plot A`

---

### 5) Minimum Spec Web App (Optimized for low-end mobile)
สิ่งที่ต้องมีเพื่อให้ “เบา + เร็ว”
- `Dashboard`: โหลดเฉพาะ summary ต่อแปลง (การ์ด) ไม่โหลด tasks รายวันทุกแปลงพร้อมกัน
- `CalendarComponent`: โหลด/คำนวณเฉพาะ tasks ของแปลงที่ active เท่านั้น
- Timeline เป็น `static/predictive` จาก FixedPlan เพื่อหลีกเลี่ยงการคำนวณหนักซ้ำๆ
- UI ต้องบอกชัดเจนว่า “กำลังดูแปลงไหน” (ชื่อแปลง + ชื่อพันธุ์)

---

### 6) Core UX Requirements (ที่คุณขอเพิ่มมา)
#### 6.1 “ดูสิ่งที่ทำล่วงหน้าได้”
- Calendar/Timeline ต้องแสดงงาน/จุดสำคัญ “ล่วงหน้า” จาก FixedPlan
- แสดงเป็น Milestone และ/หรือ timeline static ตาม stage

#### 6.2 “เอาแดชบอร์ดใส่ในแต่ละแปลงเลย”
- แม้มี Overview รวมหลายแปลง (`Dashboard แบบรวม`)
- แต่ทุกการ์ดของแปลงต้องมี summary แบบแดชบอร์ดย่อย เช่น
  - ระยะปัจจุบัน
  - วันที่/ระยะใกล้ทำต่อ
  - งานในเดือนนี้ (หรือช่วงถัดไปที่เลือก)

#### 6.3 “หน้าปฏิทินมีเลือกแปลงนา”
- `Calendar` ต้องมี selector เลือก plot เพื่อดูวัน/เวลาที่ต้องทำของแปลงนั้น
- ทุก interaction อ้างอิง `activePlotId` เท่านั้น

#### 6.4 “Timeline ระยะข้าว”
- ใช้ Milestone ตาม Growth Stage
- ใน Calendar ให้มีมุมมอง “จาก FixedPlan” เป็นหลัก

---

### 7) Add Rice Variety + Fertilizer per Variety & Soil
#### 7.1 Data ที่ระบบต้องรู้
- `RiceVariety`
  - `id`, `name`
  - `sourceReferences[]` (อ้างอิงเอกสารใน Knowledge Base)
  - `fixedPlan` (stageBreakpoints, milestones, fertilizerEvents)
  - `recommendedActionsByStage` (ถ้ามี)
- `SoilType`
  - อย่างน้อย 2–3 กลุ่มเริ่มต้น
  - ใช้เป็น key ในการหา fertilizer formula
- `FertilizerRule`
  - key: (`varietyId` + `soilType`)
  - value: สูตร/ชนิดปุ๋ย + เงื่อนไขตาม stage
  - policy: ห้ามขัดกับแหล่งที่ยึดตาม “ไร่เทพ & กรมการข้าว” (หรือไฟล์ KB ของคุณ)

#### 7.2 Logic
- เมื่อถาม/หรือระบบสร้างคำแนะนำเรื่องปุ๋ย:
  - ใช้ `(varietyId + soilType)` -> ได้ `FertilizerRule`
  - map fertilizer events ไป stage/timeline ตาม fixedPlan

#### 7.3 Constraint (anti-contradiction)
- ห้ามแนะนำปุ๋ยไนโตรเจนสูงในช่วงที่ KB ระบุว่าไม่ควร/ขัดกับช่วงออกดอก (encode เป็น stage constraint)
- หาก Knowledge Base ไม่มีข้อมูล → ต้องตอบ “ไม่มีข้อมูลในคู่มือ”

---

### 8) RAG & Anti-Hallucination Protocol (กติกา AI แบบบังคับ)
#### 8.1 Identify Source ทุกครั้ง
- ทุกคำตอบเกี่ยวกับ “วิธีปลูก” หรือ “พันธุ์ข้าว” ต้องบอกว่ามาจากไฟล์/เอกสารใดใน KB
- ตัวอย่างเอกสาร (ชื่อไฟล์) ที่ใช้กับการ cite ต้องทำให้ตรงกับ KB:
  - `Kubota_Guide.pdf`, `RD15_Manual.pdf` (ให้ใช้ชื่อจริงตามที่อยู่ในระบบ)

#### 8.2 RD15 Origin Correction (ข้อห้ามเด็ดขาด)
- ต้องจำกติกานี้เสมอ:
  - กข15 (RD15) = “แฝด/สาย” ของหอมมะลิ 105 ที่ใช้รังสีแกมมา
- ห้ามตอบว่าเป็นพันธุ์ผสมจากสุพรรณบุรีโดยเด็ดขาด

#### 8.3 No Guessing Rule
- ถ้า KB ไม่ระบุ “ส่วนที่ผู้ใช้ถาม”:
  - ให้ตอบว่า “ไม่มีข้อมูลในคู่มือ”
  - ห้ามเติมความรู้ทั่วไปจากอินเทอร์เน็ต

#### 8.4 Context Engineering Pack (สิ่งที่ต้องใส่ให้ RAG)
เมื่อ user ถามในบริบทแอป:
- `question` (คำถามจริง)
- `activePlotContext`
  - `plotName`, `plotId`
  - `varietyId/varietyName`
  - `plantingDate`
  - `soilType` (ถ้ามี)
- `fixedPlanSnapshot` ของพันธุ์นั้น
  - stageBreakpoints และ milestone dates ที่ใช้ตอบได้แบบ timeline-based
- `fertilizerRules` ที่อิง variety + soil
- policy: citation + no guessing

---

### 9) “ไล่วิธีการปลูกข้าว 1 ชนิดก่อน” (pattern ก่อน scale)
#### 9.1 Strategy
ทำ planting method แบบ step-by-step ให้ “ครบ pattern” ด้วยพันธุ์เริ่มต้น 1 ชนิดก่อน
- ทำให้ UI/AI มีรูปแบบเดียวกันก่อน
- แล้วค่อยขยาย

#### 9.2 Outcome ที่ต้องได้
- ถ้าถาม “วิธีปลูกข้าวพันธุ์ X”:
  - AI ให้ step-by-step ตาม fixedPlan
  - ทุก step มีคำจำกัดความ stage และวันที่จาก `plantingDate`
  - มี citation ตรงตามไฟล์ KB

---

### 10) Knowledge Upload ใหม่ (PDF -> Vector Store)
- ระบบต้องมี API สำหรับอัปโหลด Knowledge ใหม่ (PDF) เข้า Vector Store
- Admin/Knowledge page ต้องทำงานได้:
  - อัปโหลด PDF + เลือก `collection`
  - ลบเอกสาร
  - AI ใช้งานเอกสารใหม่ได้หลังจาก index/update (ตามรอบ sync ที่ระบบกำหนด)

---

### 11) เก็บ Log ผลลัพธ์ของ RAG (Mandatory)
ทุกครั้งที่ตอบคำถามด้วย RAG ต้องเก็บอย่างน้อย:
- `timestamp`
- `userId` (ถ้ามี)
- `activePlotId` (สำคัญมาก เพราะผูกกับ timeline)
- `question`
- `promptTemplateVersion` (หรือ templateId)
- `retrievedDocIds` (หรือ chunk ids)
- `sources[]` ที่ใช้ cite
- `answer`
- `latency_ms`
- `resultType`
  - เช่น `success`, `no_data_in_kb`, `conflict_detected`, `error`

เป้าหมาย:
- เทียบคุณภาพคำตอบ
- ปรับ prompt/rules ให้ดีขึ้นแบบวัดผลได้

---

### 12) ชุดคำถามทดสอบ (20 ข้อ) + Template ที่ดี
ระบบต้องมี dataset/corpus สำหรับทดสอบ RAG อย่างน้อย 20 ข้อ

#### 12.1 Template Structure (แนะนำ)
- `id`
- `question`
- `intentType` (เช่น `fertilizer`, `schedule`, `watering`, `pests`, `harvesting`, `troubleshooting`)
- `requiresPlotContext` (true/false)
- `activePlotAssumptions`
  - `plotName`, `varietyId/varietyName`, `plantingDate`, `soilType`
- `expectedAnswerBehavior`
  - ต้องมี citation
  - ถ้าไม่มีใน KB: ต้องตอบ “ไม่มีข้อมูลในคู่มือ”

#### 12.2 ตัวอย่างคำถาม 20 ข้อ (แนวจากชาวนา/เพจ/ฟอรั่ม)
1. ตารางงานรายวัน/รายสัปดาห์สำหรับแปลงที่เลือก (timeline)
2. ตอนนี้ข้าวอยู่ระยะอะไร (อิงจาก `plantingDate`)
3. ต้องใส่ปุ๋ยรอบ 1-2 วันไหนของแปลงนี้
4. สูตรปุ๋ยของพันธุ์ X ในชนิดดิน Y คืออะไร (ต้อง cite)
5. ช่วงออกดอกต้องจัดการน้ำยังไง (ห้ามขาดน้ำ) (ต้อง cite)
6. หลังออกดอกควรทำอะไรเกี่ยวกับการให้น้ำ/ดูแล (ต้อง cite)
7. สัญญาณข้าวขาดน้ำ/น้ำมากในแต่ละช่วง (ต้อง cite)
8. ใบเหลืองเกิดจากอะไรในระยะนี้ (ถ้า KB ไม่มี -> ไม่มีข้อมูลในคู่มือ)
9. โรค/แมลงเริ่มระยะไหน (ถ้า KB ไม่มี -> ไม่มีข้อมูลในคู่มือ)
10. การเตรียมแปลงก่อนปลูก/ก่อนเพาะ (ต้อง cite)
11. ระยะงอกควรแช่นานแค่ไหน (ต้อง cite)
12. วิธีบ่ม/เพาะกล้าให้แข็งแรง (ต้อง cite)
13. การจัดการวัชพืชช่วงแตกกอ (ถ้า KB มี) 
14. เก็บเกี่ยวเมื่อถึงระยะพลับพลึงควรทำอย่างไร (ต้อง cite)
15. วางแผนเก็บเกี่ยวล่วงหน้าด้วย milestone (fixedPlan)
16. ฝนตกหนักควรทำอะไรกับแปลงนี้ (ต้อง cite)
17. ถ้าปลูกช้าหรือเลื่อนวันปลูก ต้องเลื่อน timeline อย่างไร (fixedPlan-based)
18. วิธีบันทึกผลการทำงาน/ติดตาม (ตอบแบบ system guide + cite ถ้ามี)
19. ความแตกต่างของ RD15 vs พันธุ์อื่น (ต้อง cite และย้ำ origin correction)
20. วิธีปลูกข้าว “พันธุ์เริ่มต้น 1 ชนิด” แบบ step-by-step (เพื่อเช็ค pattern) (ต้อง cite)

หมายเหตุ:
- dataset นี้ใช้เพื่อวัดว่า “ระบบตอบถูกตาม KB และ cite ได้จริง” ไม่ใช่เพื่อถามความเห็นทั่วไป

---

### 13) Frontend Integration Requirements (แนวคิดสำคัญที่ต้องทำตาม PRD)
#### 13.1 `CalendarComponent`
- แสดง `Milestone` ตาม fixedPlan
- แสดง tasks/timeline static ตาม stage
- มี selector plot (ผู้ใช้ต้องรู้ว่า “กำลังดูแปลงไหน”)

#### 13.2 `Dashboard`
- มีภาพรวมรวมหลายแปลง (overview)
- แต่ละการ์ดต้องมีแดชบอร์ดย่อย: ระยะปัจจุบัน + สิ่งที่ต้องทำต่อ + งานเดือนนี้
- เปลี่ยน active plot แล้ว UI ต้องอัปเดต “ระยะ/งาน/วันที่” ให้ถูกแปลงทันที

#### 13.3 Plot-based Loading (ข้อบังคับด้าน performance)
- หลีกเลี่ยงการโหลด tasks รายวันของทุกแปลงพร้อมกัน
- โครงสร้างการเรียกข้อมูล:
  - `Dashboard`: summary ต่อ plot
  - `Calendar/Timeline`: tasks ของ activePlot เท่านั้น

---

### 14) Implementation Order (เพื่อให้ทำได้และไม่หลุดกติกา)
1. ทำ fixedPlan mapping ของพันธุ์เริ่มต้น 1 ชนิด (stageBreakpoints + milestones + fertilizer events)
2. ทำ `CalendarComponent` + plot selector ให้ใช้งานได้ (milestone/timeline static)
3. ทำ UI `Dashboard` แบบการ์ดต่อแปลง (ระยะปัจจุบัน + งานเดือนนี้)
4. ทำ fertilizerRules (variety + soil) และต่อเข้ากับ timeline/stage constraints
5. ทำ planting method step-by-step สำหรับพันธุ์เริ่มต้น 1 ชนิด พร้อม cite
6. เพิ่ม Knowledge upload (PDF -> vector store)
7. ทำ RAG logging + dataset (20 ข้อ) เพื่อประเมิน
8. ค่อยขยาย variety + fertilizer rules ให้หลากหลายขึ้น

---

### 15) Open Questions (ถามเพื่อปิดช่องว่างก่อนลงมือแบบ finalize)
1. `SoilType` เริ่มต้นจะใช้กี่กลุ่ม และชื่อกลุ่มที่อยากให้ระบบใช้จริงคืออะไร?
2. พันธุ์เริ่มต้น 1 ชนิดที่อยากทำแบบ step-by-step “ก่อน” คือพันธุ์อะไร (RD15 / หอมมะลิ 105 / หรือพันธุ์อื่นใน KB)?
3. FixedPlan ของพันธุ์เริ่มต้น มีข้อมูล stage breakpoints เป็น “วันนับจากปลูก” อยู่แล้วหรือยัง?
4. ใน Calendar ต้องการแสดง “Milestone อย่างเดียว” หรือ “Milestone + tasks รายวัน” พร้อมกันตั้งแต่รอบแรก?
5. `task` ในระบบจะละเอียดระดับไหน (เช่น ใส่ปุ๋ยเป็น 1 task ต่อรอบ หรือแยกชนิดปุ๋ย/วิธีใส่เป็น subtask)?

```text
## Web Rice Expert – Frontend Summary & Logic

### 1. ภาพรวมสถาปัตยกรรม

- **เทคโนโลยีหลัก**
  - **React + TypeScript** ทำงานแบบ Single Page Application (SPA)
  - ใช้ **`react-router`** จัดการเส้นทางหน้าเว็บ (กำหนดใน `routes.tsx`)
  - ใช้ **Context (`PlansContext`)** จัดการ state กลางของ “แผนการปลูกข้าว”
  - UI ใช้ component แบบ custom + utility class (แนว Tailwind)
  - ติดต่อ backend ผ่าน helper ฟังก์ชัน **`apiFetch`** ที่ตั้งค่า `API_BASE_URL` และแนบ token ให้เอง

- **โครงเส้นทาง (`routes.tsx`)**
  - `/` – หน้า Landing แนะนำระบบ
  - `/login` – หน้าเข้าสู่ระบบ / สมัครสมาชิก
  - `/app` – กลุ่มเส้นทางหลักหลังล็อกอิน ใช้ `ProtectedRoute` + `AppLayout`
    - `/app/dashboard` – แดชบอร์ดภาพรวมแปลงนา
    - `/app/plots` – รายการแปลงนาทั้งหมด
    - `/app/calendar` – ปฏิทินงานตามแผน
    - `/app/knowledge` – คลังความรู้ (เอกสารสำหรับ RAG)
    - `/app/admin` – หน้าจัดการระบบสำหรับ admin
    - `/app/create-plan` – หน้าสร้างแผนปลูกแบบ 3 ขั้นตอน
  - `*` – เส้นทางอื่น ๆ redirect กลับหน้า `/`

ภาพรวมคือ **ทุกหน้าใน `/app/*` ต้องล็อกอินก่อน** และใช้ layout / state กลางร่วมกันผ่าน `AppLayout` + `PlansProvider`.

---

### 2. การจัดการเส้นทางและ Layout

#### 2.1 `ProtectedRoute`

- ทำหน้าที่ตรวจว่า user **ล็อกอินแล้วหรือยัง** ด้วยฟังก์ชันจาก `auth` (เช่น `isAuthenticated()`).
- ถ้าไม่ล็อกอิน:
  - มักจะ redirect ไป `/` (หน้า Landing)
- ถ้าล็อกอินแล้ว:
  - render children ต่อ (เช่น `AppLayout`)

ผลคือ **ทุก route ใต้ `/app` จะปลอดภัย ต้องผ่านการเข้าสู่ระบบก่อน**.

#### 2.2 `AppLayout`

`AppLayout` เป็น layout หลักของส่วนที่อยู่ใน `/app` มีหน้าที่:

- แสดง **sidebar (desktop)** และ **mobile menu** สำหรับนำทางไปหน้าต่าง ๆ
- แสดงข้อมูลผู้ใช้ปัจจุบัน (ชื่อ, role) จาก helper ใน `auth`
- มีปุ่ม:
  - “สร้างแผนใหม่” → `navigate("/app/create-plan")`
  - “ออกจากระบบ” → `clearAuth()` แล้ว `navigate("/")`
- สำหรับ mobile:
  - มีปุ่ม hamburger เปิดเมนูด้านซ้าย
  - มีเมนูและปุ่มสร้างแผน / ออกจากระบบภายใน panel
- ส่วน main content:
  - ห่อด้วย **`PlansProvider`**:
    - ทำให้ component ใด ๆ ภายใน `<Outlet />` เรียก `usePlans()` เพื่ออ่าน/แก้ไขข้อมูลแผนได้
  - แสดง `<Outlet />` จาก `react-router` (render หน้า child route ที่ตรงกับ path ปัจจุบัน)
  - แสดง `<FloatingChat />` เป็นปุ่ม AI แชทมุมขวาล่าง

สรุป: `AppLayout` คือ “กรอบ” หลักของแอปที่ล็อกอินแล้ว ทั้ง navigation, context provider, และ chat.

---

### 3. การจัดการการเข้าสู่ระบบ (Auth Flow)

#### 3.1 Helper `auth`

จากการใช้งานในโค้ด (เช่น `Login.tsx`, `AppLayout.tsx`) สามารถสรุปหน้าที่ได้ว่า:

- จัดการ token และข้อมูลผู้ใช้ใน `localStorage`:
  - `login(username, password)` – เรียก backend เพื่อรับ token, เก็บลง localStorage
  - `register(username, password)` – สมัครสมาชิก, จากนั้นอาจล็อกอินอัตโนมัติ
  - `isAuthenticated()` – ตรวจว่ามี token ที่ใช้งานอยู่หรือไม่
  - `clearAuth()` – ลบ token ออกจาก localStorage
  - `getUsername()`, `getRole()`, `isAdmin()` – คืนข้อมูลผู้ใช้ที่เก็บไว้

#### 3.2 หน้า `Login`

- ใช้ state `isRegister` เพื่อสลับโหมด **เข้าสู่ระบบ** และ **สมัครสมาชิก**.
- ใช้ `useEffect` ตรวจตั้งแต่เริ่ม render:
  - ถ้า `isAuthenticated()` แล้ว → redirect ไป `/app/dashboard` ทันที
- เมื่อผู้ใช้กรอก form แล้วกด submit:
  - ถ้าอยู่ในโหมดสมัคร (`isRegister === true`):
    - เรียก `register(username, password)`
  - ถ้าอยู่ในโหมดเข้าสู่ระบบ:
    - เรียก `login(username, password)`
  - ถ้าสำเร็จ → `navigate("/app/dashboard", { replace: true })`
  - ถ้า error → แสดง message สีแดงด้านล่าง input
- UI ฝั่งซ้าย (บน desktop) แสดงจุดขายระบบและ icon ต่าง ๆ เพื่ออธิบายฟีเจอร์หลัก (ถาม-ตอบด้วย AI, วางแผนการปลูก ฯลฯ).

สรุป: ผู้ใช้ต้องผ่านหน้า `Login` ก่อนถึงจะเข้าถึง `/app/*` ได้, token และข้อมูลผู้ใช้เก็บใน localStorage ผ่าน helper `auth`.

---

### 4. ศูนย์กลางข้อมูลแผนปลูก: `PlansContext` + `usePlans`

`PlansContext` ทำหน้าที่เป็น **state กลาง** สำหรับทุกอย่างที่เกี่ยวกับ “แผนการปลูกข้าว”.

#### 4.1 รูปแบบข้อมูล

- **`PlanTask`** – งานแต่ละงานในแผนหนึ่งแปลง
  - `id` – รหัสงาน
  - `day` – วันที่เทียบจากวันเริ่มปลูก (เช่น วันที่ 1, 15, 30)
  - `stage` – ระยะของข้าว (เช่น เพาะกล้า, แตกกอ, ออกรวง)
  - `taskName` – ชื่องาน เช่น “ไถพรวนดิน”
  - `description` – รายละเอียดเพิ่มเติม
  - `date` – วันที่ปฏิบัติงาน (ISO string)
  - `isCompleted` – ทำเสร็จแล้วหรือยัง

- **`PlantingPlan`** – แผนปลูกข้าวหนึ่งแปลง
  - `id` – รหัสแผน
  - `varietyId` – id ของพันธุ์ข้าว (เช่น `"jasmine"`)
  - `varietyName` – ชื่อพันธุ์ภาษาคนอ่านได้
  - `startDate` – วันเริ่มปลูก (string)
  - `areaRai` – ขนาดพื้นที่ (ไร่)
  - `plotName` – ชื่อแปลง
  - `tasks` – งานทั้งหมดในฤดูกาลนี้
  - `createdAt` – เวลาเริ่มสร้างแผน

- **`ApiPlan`, `ApiTask`**
  - โครงสร้าง JSON จาก backend ใช้ snake_case (`variety_id`, `start_date`, `task_name` ฯลฯ)
  - มีฟังก์ชัน `mapPlan`, `mapTask` แปลงให้เป็นรูปแบบ TypeScript ที่ frontend ใช้ (camelCase).

#### 4.2 การโหลดแผนจาก backend

- เมื่อ `PlansProvider` ถูก mount ใน `AppLayout`:
  - state เบื้องต้น:
    - `plans = []`
    - `currentPlanId` อ่านค่าจาก `localStorage` key `rice_expert_current_plan_id` (ถ้าเคยเลือกแผนไว้)
    - `loading = true`, `error = null`
  - `useEffect` เรียก `fetchPlans()` ครั้งแรก:
    - ใช้ `apiFetch<ApiPlan[]>("/plans/", {}, true)`
      - `/plans/` คืน list แผนทั้งหมดของ user ที่ล็อกอิน
    - แปลงผลลัพธ์ด้วย `mapPlan` เป็น `PlantingPlan[]`
    - เซต `plans` ใน state
    - ถ้า `currentPlanId` เดิมยังอยู่ใน list แผน → ใช้ต่อ
    - ถ้าไม่:
      - เลือกแผนตัวแรกใน list เป็น current
      - บันทึก id ลง `localStorage`
    - ถ้าเกิด error ระหว่างโหลด:
      - เซต `error` เป็น message จาก backend
    - ไม่ว่าจะสำเร็จหรือไม่ → `loading` จะถูกเซตเป็น `false`

#### 4.3 ฟังก์ชันที่ context ส่งออก

`usePlans()` ให้ค่าและฟังก์ชันต่อไปนี้กับ component ที่เรียกใช้:

- ข้อมูล:
  - `plans` – list แผนทั้งหมดของผู้ใช้
  - `plan` – แผนที่ถูกเลือกปัจจุบัน (อิงจาก `currentPlanId`)
  - `loading` – ระบุว่ากำลังโหลดข้อมูลจาก backend หรือไม่
  - `error` – ข้อความ error ล่าสุดของแผน (ถ้ามี)
  - `currentPlanId` – id ของแผนปัจจุบัน

- การเปลี่ยนแปลงข้อมูล:
  - `setCurrentPlanId(id)` – เปลี่ยนแผนที่เลือก
    - เซฟ id ลง `localStorage` → หน้าต่าง ๆ จะเห็นแผนเดียวกันเมื่อ refresh หน้า
  - `createPlan(params)` – สร้างแผนใหม่
    - รับ `{ varietyId, startDate, plotName, landSize }`
    - หา object พันธุ์ข้าวจาก `RICE_VARIETIES` เพื่อใช้ `variety_name`
    - เรียก `apiFetch<ApiPlan>("/plans/", { method: "POST", body: JSON.stringify({ variety_id, variety_name, start_date, area_rai, plot_name }) }, true)`
    - แปลงผลลัพธ์และเพิ่มเข้า `plans`
    - ตั้ง `currentPlanId` เป็นแผนใหม่
  - `toggleTask(planId, taskId)` – เปลี่ยนสถานะงาน (เสร็จ/ไม่เสร็จ)
    - เรียก `PATCH /plans/{planId}/tasks/{taskId}/toggle`
    - แทนที่ task ใน state ด้วยตัวที่ backend ส่งกลับ
  - `deletePlan(planId)` – ลบแผน
    - เรียก `DELETE /plans/{planId}`
    - ลบแผนออกจาก `plans`
    - ถ้าแผนที่ถูกลบเป็นแผนปัจจุบัน:
      - เลือกแผนแรกที่เหลือ (ถ้ามี) แล้วอัปเดต `currentPlanId` + `localStorage`
      - ถ้าไม่มีแผนเหลือเลย → ลบ key ใน `localStorage`

- ฟังก์ชันช่วยคำนวณ:
  - `getDaysSinceStart()` – จำนวนวันตั้งแต่เริ่มปลูกของแผนปัจจุบัน
  - `getTotalDays()` – อายุของพันธุ์ข้าว (ดึงจาก `RICE_VARIETIES`)
  - `getProgressPercent()` – คิด % ความคืบหน้าตามจำนวนวัน
  - `getCurrentStageName()` – ระยะปัจจุบันของข้าว (ใช้ `getCurrentStage`)
  - `getUpcomingTasks(daysAhead)` – งานที่จะถึงในช่วง X วันข้างหน้า

จุดสำคัญ: **ทุกหน้าใน `/app` ที่เกี่ยวกับแผนปลูก ไม่ต้องเรียก API ตรง ๆ ซ้ำไปมา** แต่ใช้ `usePlans()` เพื่ออ่าน/เปลี่ยนข้อมูลจาก context เดียว ทำให้โค้ดง่ายและสอดคล้องกัน.

### 4.4 หน้า Landing (`/`) – แชท/คลังความรู้ก่อนล็อกอิน

- ถ้า `isAuthenticated()` แล้ว → redirect ไป `/app/dashboard` (แทนหน้าเดิม)
- ถ้าไม่ล็อกอิน:
  - ตอน component mount:
    - โหลดเอกสารด้วย `apiFetch("/documents/", {}, false)`
    - โหลด prompt templates ด้วย `apiFetch("/prompts/", {}, false)`
  - UI มีแท็บ `chat` และ `docs`
- โหมด `chat`:
  - ส่งคำถามไป `POST /chat/` แบบไม่ต้องใช้ token (`requireAuth = false`)
  - body ที่ส่งคือ `{ question, history }` โดย `history` มาจาก messages ล่าสุด (ตัดหลังสุด)
  - ปุ่มคำถามตัวอย่าง (prompt templates) จะแสดงเมื่อยังมีข้อความแค่ welcome
- โหมด `docs`:
  - แสดงรายการเอกสารจาก `/documents/`
  - ปุ่ม “เปิดอ่าน” เปิดไฟล์ที่ `${API_BASE_URL}/documents/${doc.id}/file` ในแท็บใหม่

---

### 5. Logic ของแต่ละหน้า (ภายใน `/app`)

#### 5.1 `CreatePlan` – สร้างแผนการปลูกใหม่

- เป็นหน้าลักษณะ wizard 3 ขั้นตอน:
  1. เลือกพันธุ์ข้าวจาก list ที่ hard-code (`riceVarieties`)
  2. เลือกวันเริ่มปลูก (input type `date`)
  3. กรอกชื่อแปลง + ขนาดพื้นที่ (ไร่) และดูสรุปแผน
- State สำคัญ:
  - `step` – ควบคุมขั้นตอนปัจจุบัน (1–3)
  - `formData` – `{ variety, plantDate, landSize, plotName }`
  - `isLoading` – สถานะตอนรอ API สร้างแผน
  - `error` – ข้อความ error จาก backend (ถ้ามี)
- ปุ่ม “ถัดไป / สร้างแผน”:
  - ถ้า `step < 3` → แค่เปลี่ยน `step` เป็น step ถัดไป
  - ถ้า `step === 3`:
    - เรียก `createPlan()` จาก context ด้วยค่าจาก `formData`
    - ระหว่างรอ → `isLoading = true` ปุ่มเปลี่ยนข้อความเป็น “กำลังสร้าง...”
    - ถ้าสำเร็จ:
      - `navigate("/app/dashboard")` และแดชบอร์ดจะเห็นแผนใหม่ทันที
    - ถ้า error:
      - แสดง message สีแดงใต้ฟอร์ม
      - `isLoading` กลับเป็น false ให้กดใหม่ได้
- ปุ่มย้อนกลับ:
  - ถ้าอยู่ step 1 → กลับไปหน้า `/app/dashboard`
  - ถ้าอยู่ step อื่น → ลด `step` ลงทีละ 1

#### 5.2 `Dashboard` – ภาพรวมของแผนปัจจุบัน

- ใช้ `usePlans()` เพื่ออ่าน:
  - `plan`, `plans`, `loading`
  - ฟังก์ชันคำนวณ progress ต่าง ๆ
  - `toggleTask` สำหรับติ๊กงานว่าเสร็จแล้ว
- ถ้า `loading`:
  - แสดงข้อความ “กำลังโหลด...”
- ถ้ามี `plan`:
  - แสดงข้อมูล 3 บล็อกหลัก:
    1. การ์ด **ระยะปัจจุบัน** – ชื่อระยะ, วันเริ่มปลูก, จำนวนวันตั้งแต่ปลูก, ชื่อแปลง, ขนาดพื้นที่, ชื่อพันธุ์
    2. การ์ด **วงกลม progress** – แสดง % ฤดูกาล, เหลือกี่วัน
    3. การ์ด **จำนวนงานที่ต้องทำเดือนนี้**
  - ด้านล่างมีหัวข้อ “งานที่ต้องทำเดือนนี้”:
    - ดึงจาก `getUpcomingTasks(30)`
    - แสดงรายการ task พร้อมปุ่มวงกลม toggle:
      - เมื่อคลิก → เรียก `toggleTask(plan.id, task.id)` → backend ปรับสถานะ แล้ว state frontend ตามทันที
  - ด้านล่างสุดมี “Stats Summary” 3 การ์ด:
    - จำนวนแปลงทั้งหมด
    - พื้นที่รวมทุกแปลง
    - จำนวนแปลงที่ใกล้เก็บเกี่ยว (คำนวณจากอายุพันธุ์ - 7 วัน)
- ถ้า **ยังไม่มีแผนเลย (`plan` เป็น null)**:
  - แสดงการ์ดเชิญชวนให้ “สร้างแผนการปลูก” พร้อมปุ่มไป `/app/create-plan`.

#### 5.3 `Plots` – รายการแปลงนา

- ใช้ `usePlans()` อ่าน:
  - `plans`, `loading`
  - `setCurrentPlanId`, `deletePlan`
- ถ้า `loading`:
  - แสดงข้อความกำลังโหลด
- ถ้า `plans` ว่าง:
  - แสดงการ์ดแจ้งว่า “ยังไม่มีแปลงนา” พร้อมปุ่ม “เพิ่มแปลงนา” ไป `/app/create-plan`
- ถ้ามีแผน:
  - แสดงการ์ดสำหรับแต่ละ plan:
    - ข้อมูลชื่อแปลง, พันธุ์, พื้นที่, วันที่ปลูก, อายุแปลง, ระยะปัจจุบัน, % ความคืบหน้า
    - กดที่การ์ด:
      - เรียก `setCurrentPlanId(plan.id)` → เปลี่ยนแผนปัจจุบัน
      - `navigate("/app/dashboard")` → กลับไปดูรายละเอียดแผนนั้น
    - ปุ่มลบ:
      - กด icon ถังขยะ → เรียก `deletePlan(plan.id)`
      - State `plans` จะอัปเดตและจัดการ `currentPlanId` ให้เหมาะสม

#### 5.4 `Calendar` – ปฏิทินงานของแผน

- ใช้ `usePlans()` อ่าน `plan`, `loading`
- ถ้า `loading` → แสดงกำลังโหลด
- ถ้า `plan` ไม่มี:
  - แสดงข้อความให้ไปสร้างหรือเลือกแผนจากหน้าแดชบอร์ด/แปลงนา
- ถ้ามี `plan`:
  - สร้าง `tasksByDate` (Map จากวันที่ → list งาน)
  - ใช้ `react-day-picker` แสดงปฏิทิน:
    - วันที่ที่มีงานจะมี dot สีเขียวใต้ตัวเลข
    - เมื่อเลือกวัน:
      - ด้านขวาจะแสดงรายการงานของวันนั้น (ชื่อ, stage, day, description)

#### 5.5 `Knowledge` – คลังความรู้

- เมื่อ component mount:
  - `useEffect` เรียก API 2 ตัว:
    - `apiFetch("/documents/", {}, false)` → รายการเอกสาร
    - `apiFetch("/documents/collections", {}, false)` → รายการหมวดหมู่สำหรับจัดกลุ่ม
- แสดงแบบจัดกลุ่ม:
  - แสดงส่วนตาม `collections`
  - มีหมวด “อื่นๆ” สำหรับเอกสารที่ `chroma_collection` ไม่อยู่ใน list ของ collections
  - แต่ละการ์ดแสดง `filename`, `file_type`, `created_at` และปุ่ม “เปิดอ่าน” ที่เปิด `${API_BASE_URL}/documents/${doc.id}/file` ในแท็บใหม่
- เอกสารเหล่านี้ใช้เป็นแหล่งข้อมูลให้ AI ใน Floating Chat (ฝั่ง backend ทำ RAG).

#### 5.6 `Admin` – หน้าจัดการระบบ (สำหรับ admin)

- ใช้ `activeTab` คุมแท็บ `docs | faq | prompts`
- แท็บ `docs`:
  - ตอน mount โหลดเอกสารและ collections ด้วย `apiFetch("/documents/", {}, false)` และ `apiFetch("/documents/collections", {}, false)`
  - อัปโหลดไฟล์ด้วย `fetch(`${API_BASE_URL}/documents/upload`)` พร้อม `Authorization: Bearer <token>` และส่ง `files` + `collection`
  - ลบเอกสารด้วย `apiFetch(`/documents/${id}`, { method: "DELETE" }, true)`
- แท็บ `faq`:
  - เมื่อสลับแท็บครั้งแรก จะดึง `apiFetch("/admin/faq", {}, true)` แล้วแสดงรายการคำถามยอดนิยม
- แท็บ `prompts`:
  - โหลด template ด้วย `apiFetch("/prompts/", {}, false)` ตอนสลับแท็บ
  - เพิ่ม prompt ด้วย `POST /prompts/` (`requireAuth = true`)
  - ลบ prompt ด้วย `DELETE /prompts/${id}` (`requireAuth = true`)

---

### 6. Floating Chat – AI ผู้ช่วยวิชาการข้าว

- แสดงเป็นปุ่มวงกลมที่มุมขวาล่างของหน้าจอ (ภายใน `AppLayout`).
- กดแล้ว:
  - เปิดหน้าต่างแชท overlay (บน mobile = เต็มจอ, บน desktop = กล่องขวาล่าง)
  - มีข้อความต้อนรับ `WELCOME_MESSAGE` จาก bot
- การทำงานหลัก:
  - โหลด **prompt templates** จาก `/prompts/` ตอน component mount (ใช้ `apiFetch("/prompts/", {}, false)`)
  - ถ้า user ล็อกอินและ “เปิด” แชทครั้งแรก (overlay เปิดครั้งแรก):
    - เรียก `/chat/history` เพื่อดึงประวัติคำถาม–คำตอบ แล้วต่อหลัง `WELCOME_MESSAGE`
  - เมื่อผู้ใช้ส่งข้อความ:
    - เพิ่ม message ฝั่ง user ใน state
    - สร้าง `history` จาก messages ล่าสุด (ตัด welcome ออก และ slice หลังสุด)
    - เรียก `apiFetch("/chat/", { method: "POST", body: { question, history } }, true)`
    - backend จะตอบ `{ answer, sources[] }`
    - แสดง message ฝั่ง bot พร้อมรายการ `sources` (ชื่อเอกสาร/หน้า) เพื่ออ้างอิง
  - ถ้า request พลาด:
    - แสดงข้อความ error มาตรฐานให้ลองใหม่

ผลรวมคือ Floating Chat ทำหน้าที่เป็น **อินเทอร์เฟซถาม–ตอบ AI** โดยเบื้องหลังไปเรียก backend RAG ที่ใช้เอกสารในระบบ.

---

### 7. Helper `apiFetch` – จุดเดียวสำหรับเรียก API

- ตั้งต้นค่าคงที่:
  - `API_BASE_URL = "http://localhost:8000"`
- การทำงาน:
  1. อ่าน token จาก `localStorage` ผ่าน `getAuthToken()`.
  2. รวม headers:
     - `Content-Type: application/json`
     - ถ้า `requireAuth = true` และมี token → ใส่ `Authorization: Bearer <token>`.
  3. เรียก `fetch(API_BASE_URL + path, options)`.
  4. ถ้า `res.ok` เป็น false:
     - พยายาม `res.json()` เพื่อหา field `detail`
     - ถ้ามี → สร้าง `Error(detail)` โยนออกไป
     - ถ้าไม่มี → สร้าง `Error("Request failed with status XXX")`
  5. ถ้า status 204 → คืน `undefined`
  6. อย่างอื่น → แปลง `res.json()` เป็น generic type `T` และคืนค่า

ข้อดี:

- ทำให้หน้าอื่นเรียก API ได้ง่ายและสม่ำเสมอ
- การจัดการ token + error อยู่ศูนย์กลางเดียว, UI แค่จับ error message ไปแสดง.

---

### 8. User Journey โดยสรุป

1. ผู้ใช้เปิดเว็บ → เห็นหน้า Landing (`/`).
2. ที่หน้า Landing สามารถใช้งาน Chat/ดูคลังความรู้ได้ก่อนล็อกอิน แต่ถ้าจะใช้งาน/บันทึกแผนให้กด “เริ่มใช้งาน” → ไปหน้า `/login`.
3. สมัครสมาชิกหรือเข้าสู่ระบบ:
   - สร้าง/รับ JWT token เก็บใน localStorage
   - redirect ไป `/app/dashboard`.
4. `AppLayout` ทำงาน:
   - แสดงเมนู, ข้อมูลผู้ใช้, ปุ่มแผนใหม่, ปุ่มออกจากระบบ.
   - mount `PlansProvider` → โหลด `/plans/` และเลือก `currentPlan`.
5. ถ้าไม่มีแผน:
   - Dashboard / Plots แสดงการ์ดเชิญชวนสร้างแผนใหม่.
6. ผู้ใช้กด “สร้างแผนใหม่”:
   - ไป `/app/create-plan` → กรอก step 1–3 → กด “สร้างแผน”.
   - Frontend เรียก `createPlan()` → backend สร้าง record ใน `planting_plans` + tasks.
   - สำเร็จ → redirect กลับ `/app/dashboard` (และ `plans` ถูกอัปเดต).
7. จาก Dashboard:
   - ดู progress ของแผนปัจจุบัน, งานในเดือนนี้, สถิติต่าง ๆ.
   - ติ๊กงานว่าเสร็จแล้วด้วย `toggleTask`.
8. จาก Plots:
   - ดูแผนทั้งหมด.
   - เลือกแผนอื่น → `setCurrentPlanId` และกลับแดชบอร์ด.
   - ลบแผนที่ไม่ต้องการด้วย `deletePlan`.
9. จาก Calendar:
   - ดูงานในรูปแบบปฏิทินของแผนที่เลือกอยู่.
10. จาก Knowledge:
    - เปิดอ่านเอกสาร / คู่มือเกี่ยวกับการปลูกข้าว.
11. ระหว่างใช้งานทุกหน้าใน `/app`:
    - ใช้ Floating Chat เพื่อถามคำถาม AI โดยมี backend RAG ตอบจากเอกสารใน Knowledge.

---

### 9. แนวคิดออกแบบโดยรวม

- ใช้ **Context + Router** เพื่อแยก “ข้อมูลแผนปลูก” ออกจาก UI แต่ละหน้า:
  - Context (`PlansContext`) จัดการ state และการเรียก API.
  - หน้าแต่ละหน้า (`Dashboard`, `Plots`, `Calendar`, `CreatePlan`) เป็นเพียงตัว “แสดงผลและเก็บอินพุต”.
- `AppLayout` รวม:
  - Navigation
  - การป้องกันด้วย `ProtectedRoute`
  - การแชร์ `PlansProvider` และ Floating Chat ให้ทุกหน้า.
- `apiFetch` ช่วยให้การเรียก API มีมาตรฐานเดียวกันเรื่อง header, token, และ error handling.

ด้วยสถาปัตยกรรมนี้ คนที่เข้ามาดูโค้ดใหม่สามารถ:

- เริ่มอ่านจาก `routes.tsx` → เห็นภาพเส้นทางทั้งหมด.
- ตามเข้าไปที่ `AppLayout` → เข้าใจว่า state กลางและ UI หลักอยู่ตรงไหน.
- อ่าน `PlansContext` เพื่อเข้าใจ data model และการเชื่อมต่อ backend.
- จากนั้นเปิดแต่ละหน้า (`Dashboard`, `Plots`, `Calendar`, `CreatePlan`, `Knowledge`) เพื่อดูว่าใช้ context เหล่านี้อย่างไรในมุมมองผู้ใช้.
 
<!-- DUPLICATE START (hidden): second repeated summary block below (kept for reference only).
## Web Rice Expert – Frontend Summary & Logic

### 1. ภาพรวมสถาปัตยกรรม

- **Tech Stack หลัก**
  - **React + TypeScript** ทำงานแบบ SPA
  - ใช้ **`react-router`** จัดการเส้นทาง (`routes.tsx`)
  - ใช้ **Context (`PlansContext`)** จัดการ state ของแผนปลูกข้าวทั้งระบบ
  - ใช้ **Tailwind + Component UI แบบ custom** ทำ UI
  - ติดต่อ backend ผ่าน helper `apiFetch` (กำหนด `API_BASE_URL` และแนบ token ให้เอง)

- **โครงเส้นทางหลัก (`routes.tsx`)**
  - `/` : หน้า Landing แนะนำระบบ
  - `/login` : หน้าเข้าสู่ระบบ / สมัครสมาชิก
  - `/app` : เส้นทางหลักของผู้ใช้หลังล็อกอิน
    - ใช้ `ProtectedRoute` ห่อไว้ ถ้าไม่ล็อกอินจะ redirect ไปหน้าอื่น
    - ใช้ `AppLayout` เป็น layout รวม sidebar + header + content
    - มี child routes ใต้ `/app`:
      - `/app/dashboard` : แดชบอร์ดภาพรวมแปลงนา
      - `/app/plots` : รายการแปลงนาทั้งหมด
      - `/app/calendar` : ปฏิทินงานในแผน
      - `/app/knowledge` : คลังเอกสารสำหรับ RAG
      - `/app/admin` : หน้าจัดการระบบ (สำหรับ admin)
      - `/app/create-plan` : หน้าสร้างแผนปลูกใหม่แบบ step-by-step

### 2. Layout และโครงสร้างหน้าหลัก

- **`AppLayout`**
  - แสดง **Sidebar / Mobile Menu / Main Content** ให้ทุกหน้าภายใต้ `/app`
  - ใช้ `navItems` กำหนดเมนูซ้าย (แดชบอร์ด, แปลงนา, ปฏิทิน, คลังความรู้, admin)
  - ด้านล่าง sidebar แสดง
    - ชื่อผู้ใช้ + role (ดึงจาก `auth` helper)
    - ปุ่ม **“สร้างแผนใหม่”** → `navigate("/app/create-plan")`
    - ปุ่ม **ออกจากระบบ** → เคลียร์ token แล้วไปหน้า `/`
  - มีเวอร์ชัน **Mobile**:
    - ปุ่ม hamburger เปิด panel เมนูด้านซ้าย
    - ปุ่ม “สร้างแผนใหม่” และ “ออกจากระบบ” ในเมนู mobile ด้วย
  - ส่วน Main Content:
    - ห่อด้วย **`PlansProvider`** เพื่อให้ทุกหน้าที่อยู่ใน `<Outlet />` ใช้ hook `usePlans()` ได้
    - แสดง `FloatingChat` ติดด้านล่างเป็น AI แชทบ็อต

### 3. การจัดการ Auth และ `ProtectedRoute`

- **Helper `auth` (สรุปพฤติกรรมจากการใช้งานใน `Login` และ `AppLayout`)**
  - มีฟังก์ชัน `login`, `register`, `isAuthenticated`, `clearAuth`, `getUsername`, `getRole`, `isAdmin`
  - จัดเก็บ JWT token ใน `localStorage` (ใช้โดย `apiFetch` ตอน `requireAuth = true`)

- **`ProtectedRoute`**
  - ใช้ห่อ `AppLayout` ที่ path `/app`
  - ถ้า `isAuthenticated()` เป็น false → redirect ไปที่ `/login` หรือหน้าอื่น (ขึ้นกับการ implement)
  - ทำให้ทุกหน้าใน `/app/*` ต้องล็อกอินก่อนเสมอ

- **หน้า `Login`**
  - Form เดียวใช้ได้ทั้ง **เข้าสู่ระบบ** และ **สมัครสมาชิก** (สลับโหมดด้วย state `isRegister`)
  - ก่อน render จะเช็ก `isAuthenticated()`:
    - ถ้าเคยล็อกอินแล้ว → redirect ไป `/app/dashboard`
  - เมื่อ submit:
    - โหมด login → เรียก `login(username, password)`
    - โหมด register → เรียก `register(username, password)`
    - สำเร็จ → `navigate("/app/dashboard", { replace: true })`
    - ถ้า error → แสดงข้อความในกล่องแดงด้านล่าง input

### 4. แกนกลางของข้อมูล: `PlansContext` และ `usePlans`

- **หน้าที่หลักของ `PlansContext`**
  - เก็บและกระจายข้อมูล “แผนการปลูกข้าว” ให้กับทุกหน้าในพื้นที่ `/app`
  - ทำให้หน้าอย่าง `Dashboard`, `Plots`, `Calendar`, `CreatePlan` เข้าถึงข้อมูลกลางเดียวกันได้

- **โครงสร้างข้อมูลสำคัญ**
  - `PlanTask`
    - งานแต่ละงานในแผน (เช่น “เตรียมดิน”, “ใส่ปุ๋ยครั้งที่ 1”)
    - มีข้อมูล: `day` (วันที่เทียบจากวันเริ่มปลูก), `stage` (ระยะเพาะกล้า/แตกกอ ฯลฯ), `taskName`, `description`, `date`, `isCompleted`
  - `PlantingPlan`
    - แผนปลูกหนึ่งแปลง
    - มี: `id`, `varietyId`, `varietyName`, `startDate`, `areaRai`, `plotName`, `tasks[]`, `createdAt`
  - `ApiPlan`, `ApiTask`
    - รูปแบบข้อมูลที่ได้จาก backend (snake_case)
    - แปลงเป็น camelCase ด้วยฟังก์ชัน `mapPlan`, `mapTask`

- **Lifecycle และการโหลดข้อมูล**
  - เมื่อ `PlansProvider` ถูก mount (ภายใน `AppLayout`):
    - `useEffect` เรียก `fetchPlans()` หนึ่งครั้ง
    - `fetchPlans()`:
      - `apiFetch("/plans/", {}, true)` → ดึงแผนทั้งหมดของผู้ใช้จาก backend
      - แปลงเป็น `PlantingPlan[]` ด้วย `mapPlan`
      - เซต `plans` ใน state
      - จัดการ `currentPlanId`:
        - ถ้ามี id เก่าจาก `localStorage` และยังอยู่ในรายการ → ใช้ id เดิม
        - ถ้าไม่มี → เลือกแผนตัวแรกและบันทึกลง `localStorage`
    - สุดท้ายเซต `loading = false`

- **ค่าที่ context ส่งออก (`PlansContextValue`)**
  - `plans` : list แผนทั้งหมดของผู้ใช้
  - `plan` : แผนที่เลือกอยู่ตอนนี้ (อิง `currentPlanId`), ถ้าไม่มีแผนเลยจะเป็น `null`
  - `loading`, `error`
  - `currentPlanId`, `setCurrentPlanId(id)`
  - `createPlan(params)` : สร้างแผนใหม่ผ่าน API
  - `toggleTask(planId, taskId)` : toggle งานเป็นเสร็จ/ไม่เสร็จ
  - `deletePlan(planId)` : ลบแผน
  - ฟังก์ชันช่วยคำนวณ:
    - `getDaysSinceStart()` : นับจำนวนวันตั้งแต่วันเริ่มปลูกของแผนปัจจุบัน
    - `getTotalDays()` : อายุวงจรของพันธุ์ข้าวจาก `RICE_VARIETIES`
    - `getProgressPercent()` : % ความคืบหน้าตามจำนวนวัน
    - `getCurrentStageName()` : ระยะปัจจุบันของแผน (ใช้ `getCurrentStage`)
    - `getUpcomingTasks(daysAhead)` : งานที่กำลังจะถึงในช่วง X วันข้างหน้า

- **การสร้างแผน (`createPlan`)**
  - รับ `{ varietyId, startDate, plotName, landSize }`
  - หา object พันธุ์ข้าวจาก `RICE_VARIETIES` เพื่อเอา `variety_name`
  - เรียก `apiFetch("/plans/", { method: "POST", body: JSON.stringify({...}) }, true)`
    - ส่งข้อมูลไป backend ในรูปแบบ snake_case (`variety_id`, `start_date`, `area_rai`, `plot_name`)
  - ได้ `ApiPlan` กลับมา → แปลงเป็น `PlantingPlan`
  - เพิ่มเข้า `plans` และปรับ `currentPlanId` เป็นแผนใหม่

- **การสลับแผน (`setCurrentPlanId`)**
  - เซฟ id ลง `localStorage` (`rice_expert_current_plan_id`)
  - ปรับ state ให้ `plan` เปลี่ยนตาม → หน้าต่าง ๆ ที่ใช้ `usePlans()` จะอัปเดตอัตโนมัติ

### 5. หน้าต่าง ๆ ที่ใช้แผนปลูก

#### 5.1 `CreatePlan` – สร้างแผนใหม่แบบ 3 ขั้นตอน

- ทำงานเป็น wizard 3 step:
  1. **เลือกพันธุ์ข้าว** (`riceVarieties` hard-coded ในไฟล์)
  2. **กำหนดวันเริ่มปลูก**
  3. **กรอกรายละเอียดแปลงนา** (ชื่อแปลง + ขนาดไร่) และสรุป preview
- State หลัก:
  - `step` : 1–3
  - `formData` : `{ variety, plantDate, landSize, plotName }`
  - `isLoading` / `error`
- ปุ่ม "ถัดไป" / "สร้างแผน":
  - ถ้า `step < 3` → แค่ขยับไป step ต่อไป
  - ถ้า `step === 3` → เรียก `createPlan()` จาก context ด้วยค่าที่กรอก
    - ช่วงนี้ปุ่มจะเปลี่ยนเป็นข้อความ **"กำลังสร้าง..."**
    - ถ้าสำเร็จ → `navigate("/app/dashboard")`
    - ถ้าล้มเหลว (เช่น backend error) → `setError(e.message)` แสดง error สีแดง และปุ่มกลับมาเป็น “สร้างแผน”
- มีปุ่มย้อนกลับ:
  - ถ้าอยู่ step 1 → กลับ `/app/dashboard`
  - ถ้า step 2/3 → ย้อน step ลงทีละ 1

#### 5.2 `Dashboard` – ภาพรวมของแปลงที่เลือก

- ใช้ `usePlans()` อ่าน:
  - แผนปัจจุบัน `plan`
  - ฟังก์ชันคำนวณ (`getDaysSinceStart`, `getTotalDays`, `getProgressPercent`, `getCurrentStageName`, `getUpcomingTasks`)
  - `toggleTask` เพื่อ mark งานเป็นเสร็จ
- แสดงข้อมูลหลัก:
  - การ์ด **ระยะปัจจุบัน** ของแปลง (ชื่อระยะ, วันเริ่มปลูก, ชื่อแปลง, ขนาดพื้นที่, พันธุ์ข้าว)
  - วงกลม progress ของฤดูกาล (% ความคืบหน้า + จำนวนวันคงเหลือ)
  - จำนวนงานที่ต้องทำในเดือนนี้
  - ถ้ายังไม่มีแผนเลย → แสดงการ์ดว่างเชิญชวนให้กด “สร้างแผนการปลูก”
- รายการ **งานที่ต้องทำเดือนนี้**:
  - ดึงจาก `getUpcomingTasks(30)`
  - แต่ละรายการกดเพื่อติ๊กงานเสร็จ/ไม่เสร็จ (`toggleTask`)
- สรุปตัวเลขด้านล่าง:
  - จำนวนแปลงทั้งหมด
  - พื้นที่รวม (ไร่)
  - จำนวนแปลงที่ใกล้เก็บเกี่ยว (เหลือไม่เกิน 7 วันจากอายุการปลูกของพันธุ์นั้น)

#### 5.3 `Plots` – รายการแปลงทั้งหมด

- ใช้ `usePlans()` อ่าน `plans`, `loading`, `setCurrentPlanId`, `deletePlan`
- ถ้ายังไม่มีแผน:
  - แสดงการ์ดอธิบาย + ปุ่มสร้างแผนใหม่ (ลิงก์ไป `/app/create-plan`)
- ถ้ามีแผนแล้ว:
  - แสดงการ์ดหนึ่งใบต่อหนึ่ง `PlantingPlan`
  - แต่ละการ์ดแสดง:
    - ชื่อแปลง, ชื่อพันธุ์, พื้นที่, วันที่ปลูก, อายุแปลงปัจจุบัน/อายุเต็ม, progress bar, ระยะปัจจุบัน
  - คลิกการ์ด:
    - เรียก `setCurrentPlanId(plan.id)` เพื่อสลับแผน active
    - `navigate("/app/dashboard")` ให้ผู้ใช้เห็นรายละเอียดแผนนั้น
  - ปุ่มถังขยะ:
    - เรียก `deletePlan(plan.id)` เพื่อลบแผนออกจาก backend และ state

#### 5.4 `Calendar` – ปฏิทินงานของแผนที่เลือก

- ใช้ `usePlans()` อ่าน `plan`, `loading`
- ถ้า `loading` → แสดงข้อความกำลังโหลด
- ถ้า `plan` ยังไม่มี (ยังไม่ได้เลือก / ยังไม่มีแผน):
  - แสดงหน้าว่างพร้อมข้อความให้ไปสร้าง/เลือกแผนจากแดชบอร์ดหรือหน้าแปลงนา
- ถ้ามีแผน:
  - ใช้ `react-day-picker` แสดงปฏิทิน
  - สร้างแผนที่ `tasksByDate` (Map จากวันที่ → list งาน)
  - วันที่ที่มีงานจะมีจุดสีเขียวใต้ตัวเลข
  - คลิกวันที่ → แสดงรายการงานในวันนั้นด้านขวา

#### 5.5 `Knowledge` – คลังความรู้

- เมื่อโหลดหน้า:
  - `useEffect` เรียก `apiFetch("/documents/", {}, false)` เพื่อดึง list เอกสารทั้งหมด
  - เก็บใน state `documents`
- แสดง:
  - รายการเอกสารพร้อมชื่อไฟล์, ประเภท, วันที่อัปโหลด
  - ปุ่ม “เปิดอ่าน” (`window.open`) ไปที่ `${API_BASE_URL}/documents/{id}/file`
  - ข้อมูลนี้ยังใช้เป็นแหล่งอ้างอิงให้ AI ใน `FloatingChat` อีกด้วย (ผ่าน backend)

### 6. Floating Chat – AI ผู้ช่วยวิชาการข้าว

- แสดงเป็นปุ่มวงกลมมุมขวาล่างของทุกหน้าภายใต้ `AppLayout`
- เมื่อคลิก:
  - เปิดหน้าต่างแชทขนาดเล็ก overlay
  - เริ่มด้วยข้อความ `WELCOME_MESSAGE` จาก bot
- ฟังก์ชันหลัก:
  - โหลด **prompt templates** จาก `/prompts/` เพื่อให้ user คลิกเลือกคำถามสำเร็จรูป
  - เมื่อผู้ใช้ส่งคำถาม:
    - เพิ่ม message ฝั่ง user เข้า state
    - เรียก `apiFetch("/chat/", { method: "POST", body: { question } }, true)`
    - รับคำตอบ `{ answer, sources[] }`
    - แสดงข้อความ bot + รายการ `sources` เป็น bullet ด้านล่าง (ใช้เป็น reference จาก RAG)
  - เมื่อเปิดแชทครั้งแรกหลังล็อกอิน:
    - โหลดประวัติแชทเก่าจาก `/chat/history` แล้วแปลงเป็นคู่ Q/A ในหน้า

### 7. ลอจิกฝั่ง API และ helper `apiFetch`

- `apiFetch(path, options, requireAuth?)`
  - ต่อ URL เป็น `API_BASE_URL + path` (ปัจจุบันคือ `http://localhost:8000`)
  - ใส่ header `Content-Type: application/json`
  - ถ้า `requireAuth = true` และมี token ใน `localStorage`:
    - เพิ่ม header `Authorization: Bearer <token>`
  - เรียก `fetch` แล้ว:
    - ถ้า `res.ok` เป็น false:
      - พยายามอ่าน `{ detail }` จาก response JSON
      - โยน `Error(detail)` ออกมาให้ UI จัดการ
    - ถ้า status 204 → คืน `undefined`
    - อย่างอื่น → แปลง JSON เป็น generic type `T` ส่งกลับ
  - ทำให้ทุกหน้าใช้รูปแบบ error / token handling ที่เหมือนกัน

### 8. เส้นทางการใช้งานของผู้ใช้ (User Journey)

1. ผู้ใช้เปิดเว็บ → เห็นหน้า Landing (intro ระบบ)
2. กดเริ่มใช้งาน → ไปหน้า `/login`
3. สมัครสมาชิกหรือเข้าสู่ระบบ:
   - สำเร็จแล้ว redirect ไป `/app/dashboard`
4. ถ้ายังไม่มีแผน:
   - Dashboard & Plots แสดงการ์ดชวน “สร้างแผนการปลูก”
5. ผู้ใช้กด “สร้างแผนใหม่”:
   - ไป `/app/create-plan`
   - กรอก 3 step → submit
   - frontend เรียก `createPlan()` → backend สร้าง record ใน `planting_plans` + tasks
   - เมื่อสำเร็จ redirect กลับ `/app/dashboard`
6. จาก Dashboard:
   - ดูความคืบหน้า, งานที่จะทำ, ข้อมูลแปลง
   - ติ๊กงานที่ทำเสร็จแล้ว → `toggleTask` อัปเดต backend และ state
7. จาก Plots:
   - เห็นแปลงทั้งหมด
   - คลิกเลือกแปลงอื่น → `setCurrentPlanId` และกลับแดชบอร์ด
   - ลบแปลงที่ไม่ต้องการด้วย `deletePlan`
8. จาก Calendar:
   - ดูงานตามวันในปฏิทินของแผนที่เลือกอยู่
9. จาก Knowledge:
   - เปิดอ่านเอกสารอ้างอิงต่าง ๆ
10. ทุกหน้าใน `/app`:
    - ใช้ Floating Chat ถามคำถามเกี่ยวกับการปลูกข้าว โดย backend ใช้ RAG จากเอกสารเหล่านั้น

### 9. สรุปแนวคิดการออกแบบ

- แยก **การจัดการข้อมูลแผนปลูก** ไว้ที่ `PlansContext` ส่วนกลางตัวเดียว
- ใช้ **React Router** จัด layout แบบ nested:
  - `AppLayout` รวม UI โครงหลัก + `PlansProvider` + Floating Chat
- ทุกหน้าใน `/app` จึงเป็นเพียง “ตัวแสดงผล” ที่ใช้ hook `usePlans()` และ `apiFetch()` เพื่อดึง/อัปเดตข้อมูล
- การแยกแบบนี้ทำให้:
  - เพิ่มหน้าที่ใช้ข้อมูลแผนได้ง่าย (แค่เรียก `usePlans()`)
  - เปลี่ยน UI แต่ละหน้าหรือเพิ่มฟีเจอร์ใหม่ โดยไม่ต้องแตะโค้ดที่ติดต่อ backend มากนัก
 
-- >
```
-->
