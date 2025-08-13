"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  title: string;
  coverUrl: string;
  pageCount: number;
  isPublished: boolean;
  updatedAt: string;
  genres: string[]; // อาจมีตัวพิมพ์ผสม เช่น ["Sheep","Wolf"]
};

export default function AdminDashboard() {
  const [list, setList] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");    // เก็บค่าเป็น lower-case
  const [genres, setGenres] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // โหลดรายการ + แท็ก (API ปัจจุบันของคุณมี /api/admin/list และ /api/admin/genres)
  useEffect(() => {
    (async () => {
      const [listRes, genresRes] = await Promise.all([
        fetch("/api/admin/list", { cache: "no-store" }),
        fetch("/api/admin/genres", { cache: "no-store" }),
      ]);
      const rows = (await listRes.json()) as Row[];
      const rawGenres = (await genresRes.json()) as string[];

      // ทำให้เป็นชุด unique และ “ค่าจริงเป็น lower-case”
      const set = new Map<string, string>(); // lower -> display
      rawGenres.forEach((g) => {
        const val = (g || "").toString().trim().toLowerCase();
        if (!val) return;
        if (!set.has(val)) {
          const label = g.slice(0, 1).toUpperCase() + g.slice(1).toLowerCase();
          set.set(val, label);
        }
      });

      setList(rows);
      setGenres(Array.from(set.values())); // เก็บ label ไว้โชว์สวย ๆ
    })();
  }, []);

  // ฟิลเตอร์แบบไม่แยกตัวพิมพ์
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return list.filter((r) => {
      const okQ = ql
        ? (r.title || "").toLowerCase().includes(ql) || r.id.toLowerCase().includes(ql)
        : true;

      const okG = genre
        ? (r.genres ?? []).some(
            (g) => (g || "").toString().trim().toLowerCase() === genre
          )
        : true;

      return okQ && okG;
    });
  }, [list, q, genre]);

  async function togglePublish(row: Row) {
    await fetch(`/api/admin/entry?id=${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished: !row.isPublished }),
    });
    // รีโหลดรายการหลังอัปเดต
    const res = await fetch("/api/admin/list", { cache: "no-store" });
    setList(await res.json());
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin Dashboard</h1>

      {/* แถบค้นหา & เลือกแท็ก */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหา title หรือ slug"
          className="h-11 w-72 rounded-xl bg-zinc-900/70 px-4 text-sm text-zinc-200 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-sky-400"
        />

        <select
          className="h-11 rounded-xl bg-zinc-900/70 px-3 text-sm text-zinc-200 ring-1 ring-white/10 focus:ring-2 focus:ring-sky-400"
          value={genre}
          onChange={(e) => setGenre(e.target.value.toLowerCase())} // ✅ เก็บเป็น lower-case เสมอ
        >
          <option value="">— เลือกแท็ก —</option>
          {genres.map((label) => {
            const value = label.toLowerCase(); // ค่าเทียบจริง
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>

        <div className="ml-auto text-sm text-zinc-400">
          ทั้งหมด: {filtered.length} เรื่อง
        </div>
      </div>

      {/* รายการการ์ดแบบง่าย */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-xl bg-zinc-900/60 p-3 ring-1 ring-white/10"
          >
            <img
              src={r.coverUrl}
              alt={r.title}
              className="h-20 w-16 flex-none rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 font-medium">{r.title}</div>
              <div className="text-xs text-zinc-400">
                {r.pageCount} pages • {new Date(r.updatedAt).toLocaleString()}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {(r.genres ?? []).map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300"
                  >
                    #{g}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => togglePublish(r)}
                className={`rounded-lg px-2 py-1 text-xs ring-1 ring-white/10 ${
                  r.isPublished ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-200"
                }`}
              >
                {r.isPublished ? "Unpublish" : "Publish"}
              </button>
              <Link
                href={`/admin/editor?id=${r.id}`}
                className="rounded-lg bg-sky-600 px-2 py-1 text-xs text-white"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-zinc-400">ไม่พบรายการ</div>
        )}
      </section>
    </main>
  );
}
