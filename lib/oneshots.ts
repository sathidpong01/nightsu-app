import { prisma } from "@/lib/db";

/** ---------- Types ---------- */

export type PageItem = { url: string; w?: number; h?: number };

export type CardItem = {
  id: string;
  title: string;
  coverUrl: string;
  pageCount?: number;
  updatedAt?: Date | string | null;
  publishedAt?: Date | string | null;
  isPublished?: boolean;
  ageBadge?: string | null;      // ใช้เป็นหมวดหมู่หลักได้ (เช่น MF+, MM)
  authorName?: string | null;
  authorUrl?: string | null;
  genres?: string[];             // เก็บเป็น array หลัง normalize (เดิมอาจเป็น JSON string)
  pages?: PageItem[];            // เก็บเป็น array หลัง normalize (เดิมอาจเป็น JSON string)
  ribbons?: string[] | null;     // ถ้ามี
  stats?: { pages?: number; comments?: number; stars?: number; days?: number } | null;
};

export type SearchInput = {
  q?: string;
  genre?: string;
  author?: string;
  take?: number;
  skip?: number;
};

/** ---------- Helpers ---------- */
function safeParse<T>(v: any, fallback: T): T {
  try {
    if (v == null) return fallback;
    if (typeof v !== "string") return v as T;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function normalizeRow(r: any): CardItem {
  const genresArr = safeParse<string[] | string>(r.genres, []);
  const pagesArr = safeParse<PageItem[] | string>(r.pages, []);
  const ribbonsArr = safeParse<string[] | string | null>(r.ribbons, null);
  const statsObj = safeParse<Stats | null>(r.stats, null); // ✅ บังคับให้เป็น Stats | null

  return {
    id: r.id,
    title: r.title,
    coverUrl: r.coverUrl,
    pageCount:
      typeof r.pageCount === "number"
        ? r.pageCount
        : Array.isArray(pagesArr)
        ? pagesArr.length
        : undefined,
    updatedAt: r.updatedAt ?? null,
    publishedAt: r.publishedAt ?? null,
    isPublished: !!r.isPublished,
    ageBadge: r.ageBadge ?? null,
    authorName: r.authorName ?? null,
    authorUrl: r.authorUrl ?? null,
    genres: Array.isArray(genresArr)
      ? genresArr
      : typeof genresArr === "string"
      ? genresArr.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    pages: Array.isArray(pagesArr) ? pagesArr : [],
    ribbons: Array.isArray(ribbonsArr) ? ribbonsArr : null,
    stats: statsObj, // ✅ ตอนนี้เป็น Stats | null แล้ว ไม่ใช่ string
  };
}

/** ---------- Reads ---------- */
export async function listAllGenres(): Promise<string[]> {
  const rows = await prisma.oneshot.findMany({
    where: { isPublished: true },
    select: { genres: true },
  });
  const set = new Set<string>();
  rows.forEach((r) => {
    const g = safeParse<string[] | string>(r.genres, []);
    (Array.isArray(g) ? g : String(g).split(","))
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((v) => set.add(v));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** หมวดหมู่หลัก ใช้จาก ageBadge (เช่น MF+, MM) */
export async function listAllCategories(): Promise<string[]> {
  const rows = await prisma.oneshot.findMany({
    where: { isPublished: true },
    select: { ageBadge: true },
  });
  const set = new Set<string>();
  rows.forEach(r => {
    if (r.ageBadge) set.add(String(r.ageBadge));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** ---------- Searches (คืนค่าเป็น Array เพื่อเข้ากับหน้าปัจจุบัน) ---------- */

export async function searchOneshots(input: SearchInput): Promise<CardItem[]> {
  const { q, genre, author, take = 60, skip = 0 } = input;

  // เลือกเฉพาะฟิลด์ที่ต้องใช้
  const rows = await prisma.oneshot.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take,
    skip,
    select: {
      id: true,
      title: true,
      coverUrl: true,
      pageCount: true,
      updatedAt: true,
      publishedAt: true,
      isPublished: true,
      ageBadge: true,
      authorName: true,
      authorUrl: true,
      genres: true,
      pages: true,
      ribbons: true,
      stats: true,
    },
  });

  // ฟิลเตอร์ฝั่งแอปให้ครอบคลุม schema เดิม (ปลอดภัยกว่า ถ้า schema ยังไม่ใส่ index/array)
  const items = rows
    .map(normalizeRow)
    .filter((r) => {
      if (genre && !r.genres?.some(g => g.toLowerCase() === genre.toLowerCase())) return false;
      if (author && (r.authorName || "").toLowerCase() !== author.toLowerCase()) return false;
      if (q && q.trim()) {
        const needle = q.toLowerCase();
        const hay = [
          r.title,
          r.authorName ?? "",
          ...(r.genres ?? []),
        ].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

  return items;
}

export async function searchByCategory(cat: string, take = 60): Promise<CardItem[]> {
  const rows = await prisma.oneshot.findMany({
    where: { isPublished: true, ageBadge: cat },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take,
    select: {
      id: true,
      title: true,
      coverUrl: true,
      pageCount: true,
      updatedAt: true,
      publishedAt: true,
      isPublished: true,
      ageBadge: true,
      authorName: true,
      authorUrl: true,
      genres: true,
      pages: true,
      ribbons: true,
      stats: true,
    },
  });
  return rows.map(normalizeRow);
}

export async function getOneshotsByAuthor(authorName: string, take = 60): Promise<CardItem[]> {
  const rows = await prisma.oneshot.findMany({
    where: { isPublished: true, authorName },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take,
    select: {
      id: true,
      title: true,
      coverUrl: true,
      pageCount: true,
      updatedAt: true,
      publishedAt: true,
      isPublished: true,
      ageBadge: true,
      authorName: true,
      authorUrl: true,
      genres: true,
      pages: true,
      ribbons: true,
      stats: true,
    },
  });
  return rows.map(normalizeRow);
}

/** ---------- Admin: upsert ตอนอัปโหลด ---------- */
/** ใช้ใน /app/api/admin/upload/route.ts */
export async function upsertOneshot(data: {
  id: string;
  title: string;
  genres: string[];
  coverUrl: string;
  pages: PageItem[];
  publish: boolean;
  authorName?: string | null;
  authorUrl?: string | null;
  ageBadge?: string | null;
  ribbons?: string[] | null;
  stats?: { pages?: number; comments?: number; stars?: number; days?: number } | null;
}) {
  const {
    id, title, genres, coverUrl, pages, publish,
    authorName, authorUrl, ageBadge, ribbons, stats,
  } = data;

  // เก็บเป็น JSON string ให้เข้ากับ schema เดิม (ถ้า schema คุณเก็บเป็น Array อยู่แล้ว Prisma จะไม่ว่า)
  const genresStr = JSON.stringify(genres);
  const genresText = genres.map(s => s.trim()).filter(Boolean).join(",").toLowerCase();
  const pagesStr = JSON.stringify(pages);
  const ribbonsStr = ribbons ? JSON.stringify(ribbons) : null;
  const statsStr = stats ? JSON.stringify(stats) : null;

  return prisma.oneshot.upsert({
    where: { id },
    update: {
      title,
      coverUrl,
      genres: genresStr,
      // ถ้ามีคอลัมน์นี้ใน schema จะช่วยค้นหาเร็วขึ้น (ไม่มีก็ละไว้)
      // @ts-ignore
      genresText,
      pages: pagesStr,
      pageCount: Array.isArray(pages) ? pages.length : undefined,
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
      authorName,
      authorUrl,
      ageBadge,
      ribbons: ribbonsStr,
      stats: statsStr,
    },
    create: {
      id,
      title,
      coverUrl,
      genres: genresStr,
      // @ts-ignore
      genresText,
      pages: pagesStr,
      pageCount: Array.isArray(pages) ? pages.length : undefined,
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
      authorName,
      authorUrl,
      ageBadge,
      ribbons: ribbonsStr,
      stats: statsStr,
    },
  });
}
