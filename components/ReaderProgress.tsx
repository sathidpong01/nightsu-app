"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  /** จำนวนภาพทั้งหมด (รวมปก) */
  total: number;
  /** เลือก element ที่แทนแต่ละหน้า (default: [data-readpage]) */
  selector?: string;
};

export default function ReaderProgress({ total, selector = "[data-readpage]" }: Props) {
  const [page, setPage] = useState(1);        // 1..total
  const [percent, setPercent] = useState(0);  // 0..100

  // คำนวณเปอร์เซ็นต์จาก scroll จริง เพื่อให้ลื่นแม้มีภาพสูงไม่เท่ากัน
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setPercent(Math.max(0, Math.min(100, p)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // หา “หน้าที่กำลังอ่าน” ด้วย IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!els.length) return;

    // ใช้ rootMargin ให้ถือว่าอยู่หน้าเมื่อภาพเข้ามากลางจอประมาณ 40%–60%
    const io = new IntersectionObserver(
      (entries) => {
        // เลือกอันที่ใกล้กลางจอที่สุด
        let bestIdx = -1;
        let bestDist = Infinity;
        const vpMid = window.innerHeight / 2;

        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const rect = e.target.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          const dist = Math.abs(mid - vpMid);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = els.indexOf(e.target as HTMLElement);
          }
        }
        if (bestIdx >= 0) setPage(bestIdx + 1);
      },
      {
        root: null,
        threshold: [0.1, 0.25, 0.5, 0.75],
        rootMargin: "-40% 0px -40% 0px",
      }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector, total]);

  if (!total) return null;

  return (
    <>
      {/* แถบ progress ด้านบน */}
      <div className="fixed left-0 right-0 top-0 z-40 h-1.5 bg-[var(--brand-muted)]/60">
        <div
          className="h-full bg-[var(--brand-primary)] transition-[width] duration-150 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* ป้ายแสดงหน้า */}
      <div className="fixed right-3 top-3 z-40 select-none">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur">
          {page} / {total}
        </span>
      </div>
    </>
  );
}
