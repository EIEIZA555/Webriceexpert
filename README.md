# 🌾 Rice Expert

ระบบจัดการแปลงนาอัจฉริยะ - เว็บแอปพลิเคชันสำหรับช่วยเกษตรกรจัดการและติดตามการเจริญเติบโตของข้าว

## ✨ Features

- 🔐 **Login** - ระบบเข้าสู่ระบบที่สวยงามแบบ split-screen พร้อมรูปภาพนาและ emerald overlay
- 📊 **Dashboard** - ภาพรวมแปลงนาพร้อม weather widget, สถิติสรุป และการ์ดแปลงนาแต่ละแปลง
- 📝 **Create Plan** - สร้างแผนการปลูกข้าวแบบ step-by-step (เลือกพันธุ์ → กำหนดวันปลูก → รายละเอียดแปลง)
- 🌱 **Rice Plot Cards** - การ์ดแสดงความคืบหน้าการเจริญเติบโตพร้อม progress bar และ badge สถานะ
- 🎨 **Modern UI** - Clean design ด้วย rounded corners, soft shadows และ emerald green theme

## 🛠️ Tech Stack

- **React** 18.3.1 - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** 4.1 - Utility-first CSS framework
- **React Router** 7.13 - Client-side routing
- **Vite** 6.3.5 - Build tool
- **shadcn/ui** - UI component library
- **Lucide React** - Icon library
- **Radix UI** - Headless UI primitives

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ และ npm/pnpm/yarn

### Installation

1. Clone repository:
```bash
git clone https://github.com/YOUR-USERNAME/rice-expert-app.git
cd rice-expert-app
```

2. ติดตั้ง dependencies:
```bash
npm install
# หรือ
pnpm install
# หรือ
yarn install
```

3. รันโปรเจกต์:
```bash
npm run dev
```

4. เปิดเบราว์เซอร์ที่ `http://localhost:5173`

### Build for Production

```bash
npm run build
```

ไฟล์ที่ build เสร็จจะอยู่ในโฟลเดอร์ `dist/`

## 📁 Project Structure

```
rice-expert-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── figma/           # Figma components
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Login.tsx        # หน้า Login
│   │   │   ├── Dashboard.tsx    # หน้า Dashboard
│   │   │   └── CreatePlan.tsx   # หน้า Create Plan
│   │   ├── App.tsx              # Main app component
│   │   └── routes.ts            # Router configuration
│   └── styles/
│       ├── theme.css            # Design tokens และ CSS variables
│       ├── tailwind.css         # Tailwind directives
│       └── fonts.css            # Font imports
├── package.json
├── vite.config.ts
└── README.md
```

## 🎨 Design System

### Colors
- **Primary**: Emerald Green (#059669)
- **Background**: White (#ffffff)
- **Foreground**: Dark Gray
- **Accent**: Light Gray (#e9ebef)

### Typography
- ใช้ default system fonts
- Font sizes และ weights กำหนดใน `/src/styles/theme.css`

### Components
- ใช้ shadcn/ui components พร้อม custom styling
- Rounded corners (--radius: 0.625rem)
- Soft shadows สำหรับ cards และ buttons

## 📱 Pages

### 1. Login (`/`)
- Split-screen design
- รูปภาพนาด้านซ้าย (desktop only)
- Emerald green overlay พร้อมโลโก้ Rice Expert
- ฟอร์ม login ด้านขวา (email + password)
- Responsive สำหรับ mobile

### 2. Dashboard (`/dashboard`)
- **Sidebar Navigation**: แดชบอร์ด, แปลงนา, ปฏิทิน, ตั้งค่า, ออกจากระบบ
- **Weather Widget**: แสดงอุณหภูมิ, โอกาสฝน, ความชื้น, ความเร็วลม
- **Summary Stats**: จำนวนแปลงนา, พื้นที่รวม, แปลงพร้อมเก็บเกี่ยว
- **Rice Plot Cards**: Grid ของการ์ดแปลงนาพร้อม:
  - ไอคอนข้าว
  - ชื่อแปลงและพันธุ์
  - วันที่ปลูกและพื้นที่
  - Progress bar แสดงความคืบหน้า
  - Badge สถานะ (ปกติ/ดีมาก)

### 3. Create Plan (`/create-plan`)
- **Progress Stepper**: แสดง 3 ขั้นตอน
- **Step 1**: เลือกพันธุ์ข้าว (ข้าวหอมมะลิ, RD43, กข15, ปทุมธานี)
- **Step 2**: กำหนดวันเริ่มปลูก (date picker)
- **Step 3**: กรอกชื่อแปลงและขนาดพื้นที่ + สรุปแผน
- Form validation และ disabled state บนปุ่ม Next

## 🎯 Features Roadmap

- [ ] หน้ารายละเอียดแปลงนา (Plot Detail)
- [ ] ระบบปฏิทินการดูแล
- [ ] กราฟแสดงการเจริญเติบโต (Recharts)
- [ ] ระบบแจ้งเตือน (Notifications)
- [ ] Dark mode support
- [ ] Mobile app version
- [ ] การเชื่อมต่อกับ Supabase สำหรับ backend
- [ ] ระบบอัพโหลดรูปภาพแปลงนา
- [ ] Export รายงาน PDF

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Style

- ใช้ TypeScript strict mode
- ใช้ Tailwind CSS utilities แทน custom CSS
- Component naming: PascalCase
- File naming: PascalCase สำหรับ components, camelCase สำหรับ utilities

## 🤝 Contributing

Contributions, issues และ feature requests ยินดีต้อนรับเสมอ!

1. Fork โปรเจกต์
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

สร้างด้วย Figma Make และ AI

## 🙏 Acknowledgments

- Design inspiration จาก modern SaaS applications
- UI Components จาก [shadcn/ui](https://ui.shadcn.com/)
- Icons จาก [Lucide](https://lucide.dev/)
- Images จาก [Unsplash](https://unsplash.com/)

---

**Happy Coding! 🌾**
