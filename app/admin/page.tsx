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
  genres: string[];
};

export default function AdminDashboard() {
  const [list, setList] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string>("");

  // --- BroadcastChannel สำหรับ sync ข้ามแท็บ/หน้า
  const bcRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window))
      return;
    const bc = new BroadcastChannel("oneshot-admin");
    bc.onmessage = (ev) => {
      if (ev?.data?.type === "mutated") {
        reload(); // มีการแก้ไขจากแท็บอื่น → ดึงรายการใหม่
      }
    };
    bcRef.current = bc;
    return () => bc.close();
  }, []);

  function notifyMutation() {
    bcRef.current?.postMessage({ type: "mutated", ts: Date.now() });
  }

  async function reload() {
    const [rows, gs] = await Promise.all([
      fetch("/api/admin/list").then((r) => r.json()),
      fetch("/api/admin/genres").then((r) => r.json()),
    ]);
    setList(rows);
    setGenres(gs);
  }
  useEffect(() => {
    reload().catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();

    return list.filter((r) => {
      const okQ = ql
        ? (r.title || "").toLowerCase().includes(ql) ||
          r.id.toLowerCase().includes(ql)
        : true;

      // ✅ ไม่แยกตัวพิมพ์เล็ก-ใหญ่ + กันค่า null/เว้นวรรค
      const okG = genre
        ? (r.genres ?? []).some(
            (g) =>
              (g || "").toString().trim().toLowerCase() === genre.toLowerCase()
          )
        : true;

      return okQ && okG;
    });
  }, [list, q, genre]);

  async function togglePublish(row: Row) {
    try {
      setBusyId(row.id);
      // 1) optimistic update: เปลี่ยนสถานะใน UI ทันที
      setList((prev) =>
        prev.map((it) =>
          it.id === row.id
            ? {
                ...it,
                isPublished: !row.isPublished,
                updatedAt: new Date().toISOString(),
              }
            : it
        )
      );

      // 2) เรียก API จริง
      const action = row.isPublished ? "hide" : "unhide";
      const res = await fetch("/api/admin/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, action }),
      });

      // 3) ถ้า API ล้มเหลว กลับสถานะเดิม
      if (!res.ok) {
        setList((prev) =>
          prev.map((it) =>
            it.id === row.id ? { ...it, isPublished: row.isPublished } : it
          )
        );
        return;
      }

      // 4) แจ้งข้ามแท็บ + re-fetch เพื่อ sync ข้อมูล (กัน edge case)
      notifyMutation();
      reload().catch(() => {});
    } finally {
      setBusyId("");
    }
  }

  async function removeEntry(row: Row) {
    if (!confirm(`ลบเรื่อง "${row.title}" และไฟล์ทั้งหมด?`)) return;
    try {
      setBusyId(row.id);
      // optimistic: เอาออกจากรายการทันที
      setList((prev) => prev.filter((it) => it.id !== row.id));

      const res = await fetch("/api/admin/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, action: "delete" }),
      });

      if (!res.ok) {
        // ถ้าลบไม่สำเร็จ → reload คืนสภาพจากเซิร์ฟเวอร์
        await reload();
        return;
      }
      notifyMutation();
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/editor" className="button-primary">
          + เพิ่มเรื่องใหม่
        </Link>
      </div>

      <div className="card p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input"
            placeholder="ค้นหา..."
          />
          <select
            className="input"
            value={genre}
            onChange={(e) => setGenre(e.target.value.toLowerCase())}
          >
            <option value="">— เลือกแท็ก —</option>
            {genres.map((g) => {
              const value = (g || "").toString().trim().toLowerCase(); // ค่าใช้เทียบ
              const label = g; // จะแสดงตามเดิม
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>

          <div className="text-brand-subtext flex items-center">
            ทั้งหมด: {filtered.length} เรื่อง
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">รายการทั้งหมด</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((row) => {
            const bust = new Date(row.updatedAt).getTime();
            const loading = busyId === row.id;
            return (
              <div key={row.id} className="card p-4">
                <div className="grid grid-cols-[96px,1fr] gap-4 items-center">
                  <img
                    src={`${row.coverUrl}?v=${bust}`}
                    className="w-24 h-32 object-cover rounded-lg border border-[var(--brand-border)]"
                    alt={row.title}
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="font-semibold text-base leading-snug break-words">
                      {row.title}
                    </div>
                    <div className="text-sm opacity-75 break-all">
                      {row.id} • {row.pageCount}p{" "}
                      {row.isPublished ? "• Published" : "• Draft"}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        disabled={loading}
                        className={
                          row.isPublished ? "button-warn" : "button-success"
                        }
                        onClick={() => togglePublish(row)}
                      >
                        {row.isPublished ? "Hide" : "Unhide"}
                      </button>
                      <Link
                        href={`/admin/editor?id=${encodeURIComponent(row.id)}`}
                        className="button-info"
                      >
                        Edit
                      </Link>
                      <button
                        disabled={loading}
                        onClick={() => removeEntry(row)}
                        className="button-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-brand-subtext">ไม่พบรายการ</div>
          )}
        </div>
      </section>
    </main>
  );
}
