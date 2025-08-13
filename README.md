# nightsu-app (Local Oneshot Reader)

- Next.js 14 + TypeScript + Tailwind
- Prisma + SQLite (ไฟล์เดียว)
- อัปโหลดรูปเก็บใน `public/oneshots/{id}/`
- หลังบ้านป้องกันด้วย Basic Auth

## เริ่มต้น

```bash
npm install
npm run prisma:push
npm run dev
```

เปิด `http://localhost:3000/admin` — กรอก Basic Auth จาก `.env`:
```
ADMIN_USER=admin
ADMIN_PASS=strong_password
```

อัปโหลดไฟล์ `cover.webp` และหน้า `.webp` หลายไฟล์ จากนั้นไปหน้า `/` และ `/read/[id]` เพื่ออ่าน

> Tip: บีบอัดภาพเป็น WebP กว้าง ~1080px ก่อนอัปโหลด
