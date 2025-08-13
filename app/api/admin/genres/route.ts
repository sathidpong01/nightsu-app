import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.oneshot.findMany({ select: { genresText: true } });
  const set = new Set<string>();
  rows.forEach((r: { genresText: string | null }) => {
    (r.genresText || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter((g: string) => Boolean(g))
      .forEach((g: string) => set.add(g));
  });
  return NextResponse.json(Array.from(set).sort((a, b) => a.localeCompare(b)));
}
