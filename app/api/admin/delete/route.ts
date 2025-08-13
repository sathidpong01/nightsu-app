import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeParse<T>(v: any, fallback: T): T {
  try { return typeof v === "string" ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}

// ให้แน่ใจว่า child อยู่ใต้ parent จริง ๆ (กัน path traversal)
function isSubPath(parent: string, child: string) {
  const rel = path.relative(parent, child);
  return !!rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

// แปลง URL -> absolute path ใต้ public/
function absFromPublicUrl(u: string) {
  // ตัด query/hash ออก และแปลง \ ให้เป็น /
  const clean = u.split("?")[0].split("#")[0].replace(/\\/g, "/").replace(/^\/+/, "");
  return path.join(process.cwd(), "public", clean);
}

type ReqBody =
  | { id: string; cover: true }
  | { id: string; pageUrl: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReqBody;
    const id = (body as any).id?.trim();
    if (!id) return new NextResponse("Missing id", { status: 400 });

    const row = await prisma.oneshot.findUnique({ where: { id } });
    if (!row) return new NextResponse("Not found", { status: 404 });

    const baseDir = path.join(process.cwd(), "public", "oneshots", id);

    // ----- ลบ COVER -----
    if ("cover" in body && body.cover) {
      try {
        const files = await fs.readdir(baseDir);
        await Promise.all(
          files
            .filter((n) => /^cover\.[a-z0-9]+$/i.test(n))
            .map((n) => fs.unlink(path.join(baseDir, n)).catch(() => {}))
        );
      } catch {}
      await prisma.oneshot.update({
        where: { id },
        data: { coverUrl: "", updatedAt: new Date() }
      });
      return NextResponse.json({ ok: true, id, coverUrl: "" });
    }

    // ----- ลบ PAGE -----
    if ("pageUrl" in body && body.pageUrl) {
      // แปลงเป็น absolute path ใต้ public แล้วเช็กขอบเขตโฟลเดอร์เรื่อง
      const abs = absFromPublicUrl(body.pageUrl);
      if (!isSubPath(baseDir, abs)) {
        return new NextResponse("Invalid path", { status: 400 });
      }

      // ลบไฟล์ออกจากดิสก์ (ถ้ามี)
      try { await fs.unlink(abs); } catch { /* เผื่อไฟล์ไม่มีจริง ก็ไปอัปเดต DB ต่อ */ }

      // อัปเดต DB: ลบ url ที่ตรงกับ pageUrl (ตัด query ออกด้วย) และอัปเดต pageCount
      const pages = safeParse<{ url: string }[]>(row.pages, []);
      const targetPath = body.pageUrl.split("?")[0];
      const newPages = pages.filter((p) => {
        if (!p?.url) return false;
        const pu = p.url.split("?")[0];
        return pu !== targetPath;
      });

      await prisma.oneshot.update({
        where: { id },
        data: {
          pages: JSON.stringify(newPages),
          pageCount: newPages.length,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true, id, pages: newPages });
    }

    return new NextResponse("Bad request", { status: 400 });
  } catch (e: any) {
    return new NextResponse(e?.message || "Server error", { status: 500 });
  }
}
