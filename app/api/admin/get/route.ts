import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeParse<T>(v: any, fallback: T): T {
  try {
    if (typeof v !== "string") return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

type PageItem = { url: string; w?: number; h?: number };

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const row = await prisma.oneshot.findUnique({ where: { id } });
  if (!row) return new NextResponse("Not found", { status: 404 });

  const genres = safeParse<string[]>(row.genres, []);
  const rawPages = safeParse<PageItem[]>(row.pages, []);
  const ribbons = safeParse<string[] | null>(row.ribbons, null);
  const stats = safeParse<Record<string, any> | null>(row.stats, null);

  // ❌ ตัด cover ออกจาก pages ทุกกรณี (รองรับ cover-2.jpg เป็นต้น)
  const coverRe = /\/cover(?:-\d+)?\.[a-z0-9]+$/i;
  const pages = rawPages.filter(
    (p) => p?.url && !coverRe.test(p.url) && p.url !== row.coverUrl
  );

  return NextResponse.json({
    ...row,
    genres,
    pages,
    ribbons,
    stats,
  });
}
