"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export type CardItem = {
  id: string;
  title: string;
  coverUrl: string;
  pageCount?: number;
  updatedAt?: string | Date | null;
  publishedAt?: string | Date | null;
  isPublished?: boolean;
  ageBadge?: string | null;   // หมวดหมู่
  authorName?: string | null; // ชื่อผู้เขียน
};

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const TWO_MONTHS = DAY * 60;

// สีประจำหมวด (ตัวพิเศษ)
const KNOWN: Record<string, { badgeBg: string; authorText: string }> = {
  "mf+": { badgeBg: "bg-pink-500/90", authorText: "text-pink-300" },
  "mm": { badgeBg: "bg-violet-500/90", authorText: "text-violet-300" },
};
// พาเลตสุ่มแบบคงที่ (ใช้ hash จากชื่อหมวด)
const PAL = [
  { badgeBg: "bg-sky-500/90", authorText: "text-sky-300" },
  { badgeBg: "bg-emerald-500/90", authorText: "text-emerald-300" },
  { badgeBg: "bg-amber-500/90", authorText: "text-amber-300" },
  { badgeBg: "bg-rose-500/90", authorText: "text-rose-300" },
  { badgeBg: "bg-indigo-500/90", authorText: "text-indigo-300" },
  { badgeBg: "bg-fuchsia-500/90", authorText: "text-fuchsia-300" },
];
function colorByCategory(cat?: string | null) {
  const key = (cat ?? "").trim().toLowerCase();
  if (!key) return { badgeBg: "bg-zinc-700/80", authorText: "text-zinc-300" };
  if (KNOWN[key]) return KNOWN[key];
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum = (sum + key.charCodeAt(i)) % 1000;
  return PAL[sum % PAL.length];
}

function toBuddhistDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const be = d.getFullYear() + 543;
  return `${dd}/${mm}/${be}`;
}

function formatWhen(d?: string | Date | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const now = new Date();
  const diff = now.getTime() - date.getTime(); // past=+, future=-

  if (Math.abs(diff) < TWO_MONTHS) {
    if (Math.abs(diff) < DAY) {
      const hours = Math.max(1, Math.round(Math.abs(diff) / HOUR));
      return diff >= 0 ? `${hours} ชั่วโมงที่แล้ว` : `อีก ${hours} ชั่วโมง`;
    }
    const days = Math.max(1, Math.round(Math.abs(diff) / DAY));
    return diff >= 0 ? `${days} วันที่แล้ว` : `อีก ${days} วัน`;
  }
  return toBuddhistDate(date);
}

export default function OneshotCard({ item }: { item: CardItem }) {
  const posted = useMemo(
    () => formatWhen(item.publishedAt ?? item.updatedAt ?? null),
    [item.publishedAt, item.updatedAt]
  );
  const colors = colorByCategory(item.ageBadge);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-zinc-900/60 ring-1 ring-white/10 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Cover */}
<div className="relative aspect-[3/4] w-full">
  <Image
    src={item.coverUrl}
    alt={item.title}
    fill
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 320px"
    className="object-cover"
    priority={false}
  />

  {/* gradient อยู่ใต้ลิงก์ และไม่กินคลิก */}
  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

  {/* หมวดหมู่ขวาบน ให้อยู่เหนือ overlay */}
  {item.ageBadge && (
    <span className={`absolute right-2 top-2 z-30 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow ${colors.badgeBg}`}>
      {item.ageBadge}
    </span>
  )}

  {/* 🔗 overlay คลิกได้ทั้งรูปปก */}
  <Link
    href={`/read/${item.id}`}
    className="absolute inset-0 z-20 cursor-pointer"
    aria-label={`อ่าน ${item.title}`}
  >
    <span className="sr-only">อ่าน {item.title}</span>
  </Link>
</div>

      {/* Body */}
<div className="px-4 py-3">
  {/* กล่องรวม Title + Author → แยกบรรทัดและกึ่งกลางแน่นอน */}
  <div className="grid place-items-center gap-0.5">
    {/* ชื่อเรื่อง */}
    <Link
      href={`/read/${item.id}`}
      className="underline-fx inline-block text-center text-xl md:text-xl font-bold tracking-tight text-white hover:text-sky-300"
    >
      {item.title}
    </Link>

    {/* ผู้เขียน */}
    {item.authorName && (
      <Link
        href={`/?author=${encodeURIComponent(item.authorName)}`}
        className={`underline-fx inline-block text-center text-sm md:text-sm font-medium ${colors.authorText} hover:opacity-90`}
        title={`ดูผลงานทั้งหมดของ ${item.authorName}`}
      >
        {item.authorName}
      </Link>
    )}
  </div>

  {/* Meta ด้านล่าง: วันที่ซ้าย, จำนวนหน้า ขวา */}
  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
    <span>{posted}</span>
    {typeof item.pageCount === "number" && <span>{item.pageCount} pages</span>}
  </div>
</div>

    </article>
  );
}
