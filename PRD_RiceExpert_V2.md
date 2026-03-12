# 📄 PRD: Rice Expert Smart System (V2 - Local Wisdom Integrated)

## 1. Objective
สร้างระบบวางแผนการปลูกข้าวที่แม่นยำ โดยผสมผสาน "นิยามดั้งเดิมของชาวนาไทย" เข้ากับ "เทคโนโลยีเกษตรแม่นยำ" (Precision Farming) และรองรับระบบ RAG เพื่อตอบคำถามเชิงลึก

---

## 2. Core Feature: Smart Scheduler Logic (หัวใจของระบบ)
ระบบต้องคำนวณวันเก็บเกี่ยวและกิจกรรมหลัก โดยแบ่ง Logic ตามประเภทข้าวที่คุณสรุปมา ดังนี้:

### ก. ข้าวไวแสง (นาปี / ข้าวดอ / ข้าวหนัก)
- **Logic:** ไม่นับวันตามอายุ แต่ให้เช็ค "ช่วงเวลาแสงสั้น" (ตะวันอ้อมข้าว)
- **Calculation:** - หากเป็น **ข้าวดอ**: Fix วันเก็บเกี่ยวช่วงต้นฤดูเก็บเกี่ยว (ต.ค. - พ.ย.)
  - หากเป็น **ข้าวขึ้นน้ำ/ข้าวลอย**: Fix วันเก็บเกี่ยวช่วงปลายฤดู (ธ.ค. - ม.ค.) และระบบต้องแจ้งเตือนให้ปลูกก่อนสงกรานต์
- **Instruction:** ระบบต้องไม่ออกคำสั่ง "ปลูกนอกฤดูกาล" สำหรับกลุ่มนี้

### ข. ข้าวไม่ไวแสง (นาปรัง / ข้าวนาแซง)
- **Logic:** นับวันตามอายุต้นข้าว (Dynamic Aging)
- **Calculation:** `วันที่ปลูก + อายุข้าว (เบา/กลาง/หนัก)` = วันเก็บเกี่ยว
- **Checklist:** ระบบต้องปรับความถี่การใส่ปุ๋ยตาม "คุณสมบัติอายุ" (เช่น ข้าวเบาต้องใส่ปุ๋ยรอบ 2 เร็วกว่าข้าวหนัก)

### ค. ข้าวไร่ vs ข้าวนา
- **Environmental Logic:** - หากเลือก **ข้าวไร่**: ระบบต้องตัดเมนู "การจัดการน้ำขัง" ออก และเปลี่ยนเป็น "การรักษาความชื้นดิน"
  - หากเลือก **ข้าวนา**: เปิดใช้งานฟีเจอร์ **AWD (เปียกสลับแห้ง)**

---

## 3. RAG System Requirements (การจัดการความรู้)
เพื่อให้ AI (Cursor/LLM) ตอบคำถามได้โดยไม่ Hallucinate (ไม่มั่ว):

- **Knowledge Source:** ใช้ไฟล์ `Rice_Knowledge_Base.md` ที่รวมนิยามเรื่อง ข้าวดอ, ข้าวนาแซง, ข้าวขึ้นน้ำ ไว้เป็นหลัก
- **Context Engineering:** เมื่อ User ถามคำถาม AI ต้องจำแนกก่อนว่า User ปลูกข้าวประเภทไหน (เช่น "ถ้าปลูกข้าวดอ ห้ามแนะนำให้ปลูกนอกฤดูนาปี")
- **Performance Display:** ทุกคำตอบของ AI ต้องแสดงค่า **Total Latency (ms)** เพื่อให้ผู้พัฒนาเปรียบเทียบความเร็วของ Model ได้

---

## 4. User Interface (UI) Requirements
- **Input Form:** - ให้เลือก "ประเภทการปลูก" (นาปี/นาปรัง/ข้าวไร่/ข้าวขึ้นน้ำ) 
  - ให้เลือก "พันธุ์ข้าว" และระบุว่าเป็น "ข้าวเบา/กลาง/หนัก"
- **Timeline:** แสดงผลเป็นแบบ Gantt Chart หรือ Timeline รายเดือน
- **Monthly Insight:** ระบบต้องสรุปว่า "เดือนถัดไป (Next Month Forecast)" ข้าวจะอยู่ในสถานะใด (เช่น ยืดตัว, ตั้งท้อง, หรือรอวันสั้นเพื่อออกรวง)

---

## 5. Frontend vs Backend Responsibilities

เพื่อไม่ให้ Logic ซ้ำซ้อน และสอดคล้องกับ repo หลังบ้าน `rice-rag-backend` ให้แบ่งหน้าที่ชัดเจนดังนี้:

### 5.1 Frontend (Webriceexpert – React/Vite)
- แบบฟอร์ม Input และ UX ทั้งหมด:
  - เลือกประเภทการปลูก, พันธุ์ข้าว, วันปลูก, ขนาดพื้นที่, ชื่อแปลง
  - แสดง Timeline / Calendar / Checklist / Dashboard ตามข้อมูลแผนที่ได้รับ
- State management ฝั่ง client:
  - เก็บแผนที่ user เลือกอยู่ตอนนี้ (current field) ด้วย Zustand (`usePlanStore`)
  - แสดง progress, current stage, upcoming tasks, calendar view จากข้อมูลแผน (ไม่คิด logic RAG เอง)
- Integration:
  - เรียก **Backend API** กลุ่ม `/plans` เพื่อ
    - POST `/plans` → ขอให้ backend generate แผน (และบันทึกลง DB)
    - GET `/plans` / `/plans/{id}` → ดึงแผนเก่ามาแสดงบน Dashboard / Calendar
  - เรียก **Backend API** `/chat` เพื่อใช้ RAG ตอบคำถาม พร้อมแสดง latency / metrics ที่ backend ส่งมา
  - **Guest vs Logged-in:**
    - Guest (ไม่ล็อกอิน): สามารถเข้าใช้หน้า knowledge, RAG chatbot, และดู UI ส่วนใหญ่ได้ แต่การ call backend จะไม่ผูกกับ user id (chat history เป็นแบบชั่วคราว)
    - Logged-in: ใช้ endpoint เดิม แต่ backend จะผูก chat history / plans / documents กับ user เพื่อเก็บประวัติและนำไปวิเคราะห์ในงานวิจัย

> **Note:** Logic อย่าง `calculateHarvestDate` และ `RICE_VARIETIES` ใน frontend ให้ถือเป็น **UI helper / fallback** เท่านั้น ถ้า backend ส่งแผน/วันเก็บเกี่ยวมาแล้ว ต้องเชื่อค่าจาก backend เป็นหลัก

### 5.2 Backend (rice-rag-backend – FastAPI)
- RAG Pipeline (พระเอกของ thesis):
  - `/chat` ใช้ LangChain + Ollama + ChromaDB ตอบคำถามจากเอกสาร (รวม PRD/ความรู้การทำนา) และบันทึก metrics (`response_time_ms`, `ram_used_mb`, ฯลฯ)
  - `/documents` สำหรับอัปโหลด/จัดการ knowledge base (PDF/TXT/DOCX)
- Plan Service:
  - `/plans` รับ input จาก frontend (พันธุ์ข้าว, วิธีปลูก, วันปลูก, ขนาดพื้นที่ ฯลฯ)
  - generate แผนการปลูก (plan_content JSON) และเก็บลงตาราง `planting_plans`
  - คำนวณ/บันทึกข้อมูล metrics ที่ใช้ในงานวิจัย (เวลา, RAM, model_used) ลงใน plan
- Auth & User Management:
  - `/auth/register`, `/auth/login`, `/auth/me` ใช้ JWT
  - เก็บ chat history, plans, documents ผูกกับ user

---

## 6. Success Metrics (ตัวชี้วัด)
1. **Accuracy:** ระบบคำนวณวันเก็บเกี่ยวข้าวดอ และข้าวนาปีได้ตรงตาม "จังหวะตะวันอ้อมข้าว" ของพื้นที่นั้นๆ
2. **Speed:** Latency ของระบบ RAG ต้องต่ำกว่า 2000ms สำหรับการค้นหาข้อมูลเชิงลึก
3. **Reliability:** AI ไม่สับสนระหว่าง "ข้าวเบา" (อายุสั้น) กับ "ข้าวดอ" (ไวแสงแต่เกี่ยวเร็ว)