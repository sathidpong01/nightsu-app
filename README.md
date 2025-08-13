# Nightsu App - แอปอ่าน One-shot Manga

แอปพลิเคชันสำหรับอ่านและจัดการ One-shot Manga ที่พัฒนาด้วย Next.js 14 และ TypeScript

## ✨ ฟีเจอร์หลัก

- 📚 อ่าน One-shot Manga แบบออนไลน์
- 🔍 ค้นหาและกรองตามหมวดหมู่
- 👤 ระบบจัดการผู้เขียน
- 🏷️ จัดการแท็กและหมวดหมู่
- 📱 Responsive Design รองรับทุกอุปกรณ์
- 🌙 โหมดมืด/สว่าง
- ⚡ Real-time Sync สำหรับการอ่าน
- 🔐 ระบบจัดการหลังบ้านด้วย Basic Auth

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Prisma + SQLite (ไฟล์เดียว)
- **Authentication**: Basic Auth
- **Image Storage**: Local file system (`public/oneshots/`)
- **Styling**: Tailwind CSS + CSS Modules

## 🚀 วิธีการติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่าฐานข้อมูล
```bash
npm run prisma:push
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
```env
ADMIN_USER=admin
ADMIN_PASS=รหัสผ่านที่แข็งแกร่ง
```

### 4. รันโปรเจค
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## 📖 วิธีการใช้งาน

### สำหรับผู้ใช้ทั่วไป
- หน้าแรก (`/`) - ดูรายการ One-shot ทั้งหมด
- `/read/[id]` - อ่าน One-shot ตาม ID
- `/author/[name]` - ดูผลงานของผู้เขียน
- `/categories/[cat]` - ดูผลงานตามหมวดหมู่
- `/tags/[tag]` - ดูผลงานตามแท็ก

### สำหรับผู้ดูแลระบบ
- `/admin` - เข้าสู่ระบบจัดการหลังบ้าน
- `/admin/editor` - แก้ไขและจัดการ One-shot

## 📁 โครงสร้างโปรเจค

```
nightsu-app/
├── app/                 # Next.js App Router
│   ├── admin/          # หน้าจัดการหลังบ้าน
│   ├── api/            # API Routes
│   ├── author/         # หน้าผู้เขียน
│   ├── categories/     # หน้าหมวดหมู่
│   ├── read/           # หน้าอ่าน
│   └── tags/           # หน้าแท็ก
├── components/          # React Components
├── lib/                # Utilities และ Config
├── prisma/             # Database Schema
└── public/             # Static Files
    └── oneshots/       # ไฟล์รูป One-shot
```

## 🖼️ การจัดการรูปภาพ

### รูปปก (Cover)
- ไฟล์: `cover.webp`
- ขนาดแนะนำ: กว้าง 1080px
- รูปแบบ: WebP (แนะนำ)

### หน้าหนังสือ
- ไฟล์: `1.webp`, `2.webp`, `3.webp`, ...
- ขนาดแนะนำ: กว้าง 1080px
- รูปแบบ: WebP (แนะนำ)

### โฟลเดอร์จัดเก็บ
```
public/oneshots/{id}/
├── cover.webp
├── 1.webp
├── 2.webp
└── ...
```

## 🔧 คำสั่งที่มีประโยชน์

```bash
# รันโปรเจคในโหมด Development
npm run dev

# Build สำหรับ Production
npm run build

# รันในโหมด Production
npm start

# อัพเดท Database Schema
npm run prisma:push

# เปิด Prisma Studio
npm run prisma:studio

# ตรวจสอบ TypeScript
npm run type-check

# Lint โค้ด
npm run lint
```

## 📱 การใช้งานบนมือถือ

แอปได้รับการออกแบบให้รองรับการใช้งานบนมือถือ:
- Touch-friendly navigation
- Responsive layout
- Optimized image loading
- Mobile-first design

## 🌟 Tips และ Tricks

1. **บีบอัดรูปภาพ**: ใช้ WebP format และบีบอัดให้กว้างประมาณ 1080px เพื่อประหยัดพื้นที่
2. **การตั้งชื่อไฟล์**: ใช้ตัวเลขเรียงลำดับสำหรับหน้าหนังสือ (1.webp, 2.webp, ...)
3. **การจัดการแท็ก**: ใช้แท็กที่สอดคล้องกันเพื่อให้ค้นหาได้ง่าย
4. **การจัดหมวดหมู่**: จัดหมวดหมู่ให้ชัดเจนเพื่อการนำทางที่ดี

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย
- **Database Error**: รัน `npm run prisma:push` ใหม่
- **Image ไม่แสดง**: ตรวจสอบ path และชื่อไฟล์
- **Auth Error**: ตรวจสอบ `.env` file

## 📄 License

โปรเจคนี้พัฒนาสำหรับการใช้งานส่วนตัว

---

**พัฒนาโดย**: Nightsu  
**เวอร์ชัน**: 1.0.0  
**อัพเดทล่าสุด**: 2024
