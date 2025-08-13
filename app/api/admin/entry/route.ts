import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST JSON:
 * { id: string, action: "hide" | "unhide" | "delete" }
 */
export async function POST(req: NextRequest) {
  try {
    const { id, action } = (await req.json()) as { id?: string; action?: "hide" | "unhide" | "delete" };
    if (!id || !action) return new NextResponse("Bad request", { status: 400 });

    const row = await prisma.oneshot.findUnique({ where: { id } });
    if (!row) return new NextResponse("Not found", { status: 404 });

    if (action === "hide") {
      const upd = await prisma.oneshot.update({
        where: { id },
        data: { isPublished: false, publishedAt: null, updatedAt: new Date() },
        select: { id: true, isPublished: true, updatedAt: true },
      });
      return NextResponse.json(upd);
    }

    if (action === "unhide") {
      const upd = await prisma.oneshot.update({
        where: { id },
        data: { isPublished: true, publishedAt: new Date(), updatedAt: new Date() },
        select: { id: true, isPublished: true, updatedAt: true },
      });
      return NextResponse.json(upd);
    }

    if (action === "delete") {
      // ลบโฟลเดอร์ไฟล์ทั้งหมดของเรื่อง
      const baseDir = path.join(process.cwd(), "public", "oneshots", id);
      try {
        await fs.rm(baseDir, { recursive: true, force: true });
      } catch {}
      // ลบ record
      await prisma.oneshot.delete({ where: { id } });
      return NextResponse.json({ id, deleted: true });
    }

    return new NextResponse("Unknown action", { status: 400 });
  } catch (e: any) {
    return new NextResponse(e?.message || "Server error", { status: 500 });
  }
}
