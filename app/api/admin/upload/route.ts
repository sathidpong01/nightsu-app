import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { upsertOneshot } from "@/lib/oneshots";
import { prisma } from "@/lib/db";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// slug จาก title: เว้นวรรค -> "_"
function slugifyTitle(input: string, spaceSymbol = "_") {
  const normalized = input.normalize("NFKC").trim();
  let s = normalized.replace(/\s+/g, spaceSymbol);
  s = s.replace(/[^\p{Letter}\p{Number}_-]+/gu, "");
  const symEsc = spaceSymbol.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  s = s.replace(new RegExp(`${symEsc}{2,}`, "g"), spaceSymbol);
  s = s.replace(new RegExp(`^${symEsc}|${symEsc}$`, "g"), "");
  return s || "untitled";
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let id = base;
  let i = 2;
  while (await prisma.oneshot.findUnique({ where: { id } })) {
    id = `${base}_${i++}`;
  }
  return id;
}

function extFromFile(f: File) {
  const map: Record<string, string> = {
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/png": "png",
  };
  const byType = map[f.type];
  if (byType) return byType;
  const m = /\.([a-z0-9]+)$/i.exec((f as any).name || "");
  return m ? m[1].toLowerCase() : "webp";
}

// กรอง cover ออกจาก pages
function filterOutCover(pages: { url: string }[], coverUrl: string) {
  const re = /\/cover(?:-\d+)?\.[a-z0-9]+$/i;
  return (pages || []).filter(
    (p) => p?.url && p.url !== coverUrl && !re.test(p.url)
  );
}

// หาไฟล์ชื่อ cover.ext หรือ cover-2.ext … ที่ยังไม่ชน
async function allocateCoverFilename(dir: string, ext: string): Promise<string> {
  let n = 1;
  let name = `cover.${ext}`;
  while (true) {
    try {
      await fs.access(path.join(dir, name));
      n += 1;
      name = `cover-${n}.${ext}`;
    } catch {
      return name; // ว่าง ใช้ชื่อนี้ได้
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const title = String(form.get("title") || "").trim();
    if (!title) return new NextResponse("Missing title", { status: 400 });

    const editId = String(form.get("editId") || "").trim();
    const baseSlug = slugifyTitle(title);
    let id = editId ? editId : await ensureUniqueSlug(baseSlug);

    const publish = String(form.get("publish") || "") === "on";
    const genresText = String(form.get("genres") || "");

    const authorName = String(form.get("authorName") || "");
    const authorUrl = String(form.get("authorUrl") || "");
    const ageBadge = String(form.get("ageBadge") || "");
    const ribbonsText = String(form.get("ribbons") || "");
    const statsComments = Number(form.get("statsComments") || 0);
    const statsStars = Number(form.get("statsStars") || 0);
    const statsDays = Number(form.get("statsDays") || 0);

    const existing = editId
      ? await prisma.oneshot.findUnique({ where: { id: editId } })
      : null;

    const baseDir = path.join(process.cwd(), "public", "oneshots", id);
    await fs.mkdir(baseDir, { recursive: true });

    // ===== COVER =====
    let coverUrl = existing?.coverUrl || "";
    const cover = form.get("cover") as File | null;
    if (cover && cover.size > 0) {
      const ext = extFromFile(cover);

      // สร้างชื่อไฟล์ใหม่หาก cover.<ext> ชน -> cover-2.<ext>, cover-3.<ext>, ...
      const fileName = await allocateCoverFilename(baseDir, ext);
      const abs = path.join(baseDir, fileName);
      const bin = new Uint8Array(await cover.arrayBuffer());
      await fs.writeFile(abs, bin);

      // ลบไฟล์ cover เดิมทั้งหมดยกเว้นไฟล์ล่าสุด (กันหลุดไปโผล่ใน pages)
      const keep = new Set([fileName]);
      try {
        const files = await fs.readdir(baseDir);
        await Promise.all(
          files
            .filter((n) => /^cover(?:-\d+)?\.[a-z0-9]+$/i.test(n) && !keep.has(n))
            .map((n) => fs.unlink(path.join(baseDir, n)).catch(() => {}))
        );
      } catch {}

      coverUrl = `/oneshots/${id}/${fileName}`;
    } else if (!coverUrl) {
      return new NextResponse("Missing cover", { status: 400 });
    }

    // ===== PAGES เดิมที่คงไว้ (ลำดับผู้ใช้จัด) =====
    const keepJson = String(form.get("existingPages") || "");
    let keepPages: { url: string }[] = keepJson ? JSON.parse(keepJson) : [];
    keepPages = filterOutCover(keepPages, coverUrl);

    // ถ้าไม่ส่ง keepPages แต่แก้ไขอยู่ ให้โหลดจาก DB เดิมแล้วกรอง cover
    if (keepPages.length === 0 && existing?.pages) {
      const prev = JSON.parse(existing.pages as unknown as string) as { url: string }[];
      keepPages = filterOutCover(prev, coverUrl);
    }

     // ===== PAGES ใหม่ (เพิ่มต่อท้าย) =====
    // 🔒 FIX: กรองให้เหลือเฉพาะไฟล์ภาพจริง และมีขนาด > 0
    const rawPageFiles = form.getAll("pages");
    const pageFiles: File[] = (rawPageFiles as any[]).filter(
      (x: any): x is File =>
        x instanceof File &&
        x.size > 0 &&
        typeof x.type === "string" &&
        x.type.startsWith("image/")
    );

    const newPages: { url: string }[] = [];
    if (pageFiles.length > 0) {
      pageFiles.sort((a: File, b: File) => a.name.localeCompare(b.name));
      for (let i = 0; i < pageFiles.length; i++) {
        const n = String(keepPages.length + newPages.length + i + 1).padStart(3, "0");
        const f = pageFiles[i];
        const ext = extFromFile(f);
        const abs = path.join(baseDir, `page-${n}.${ext}`);
        const bin = new Uint8Array(await f.arrayBuffer());
        await fs.writeFile(abs, bin);
        newPages.push({ url: `/oneshots/${id}/page-${n}.${ext}` });
      }
    }

    // รวมและกรอง cover อีกรอบเพื่อความชัวร์
    const pages: { url: string }[] = filterOutCover([...keepPages, ...newPages], coverUrl);

    const ribbons = ribbonsText
      .split(",")
      .map((s: string) => s.trim().toUpperCase())
      .filter(Boolean);

    await upsertOneshot({
      id,
      title,
      genres: genresText.split(",").map((s: string) => s.trim()).filter(Boolean),
      coverUrl,
      pages,
      publish,
      authorName: authorName || undefined,
      authorUrl: authorUrl || undefined,
      ageBadge: ageBadge || undefined,
      ribbons: ribbons.length ? ribbons : undefined,
      stats: { pages: pages.length, comments: statsComments, stars: statsStars, days: statsDays }
    });

    return NextResponse.json({ id });
  } catch (e: any) {
    return new NextResponse(e?.message || "Server error", { status: 500 });
  }
}
