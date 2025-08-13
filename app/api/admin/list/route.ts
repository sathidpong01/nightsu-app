import { NextResponse } from "next/server";
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

type RowDB = {
  id: string;
  title: string;
  coverUrl: string;
  pageCount: number;
  genres: string;      // JSON string
  isPublished: boolean;
  updatedAt: Date;
};

export async function GET() {
  const rows = (await prisma.oneshot.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, coverUrl: true, pageCount: true,
      genres: true, isPublished: true, updatedAt: true
    }
  })) as RowDB[];

  const mapped = rows.map((r: RowDB) => ({
    ...r,
    genres: safeParse<string[]>(r.genres, []),
  }));

  return NextResponse.json(mapped);
}
