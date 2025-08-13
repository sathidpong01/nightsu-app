import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.oneshot.findMany({ select: { genresText: true } });
  const set = new Set<string>();
  rows.forEach((r) => {
    (r.genresText || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .forEach((g) => set.add(g));
  });
  // ส่งเป็น label ดูสวย (ตัวแรกใหญ่) ให้เอาไปโชว์ใน select
  const labels = Array.from(set).map(
    (g) => g.slice(0, 1).toUpperCase() + g.slice(1).toLowerCase()
  );
  return NextResponse.json(labels.sort((a, b) => a.localeCompare(b)));
}
